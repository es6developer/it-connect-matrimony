terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
  backend "s3" {
    bucket         = "it-connect-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "it-connect-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = merge(var.tags, {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "Terraform"
    })
  }
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

# ============================================
# VPC
# ============================================
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${local.name_prefix}-vpc"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  public_subnets  = var.public_subnet_cidrs
  private_subnets = var.private_subnet_cidrs
  database_subnets = var.database_subnet_cidrs != null ? var.database_subnet_cidrs : var.private_subnet_cidrs

  enable_nat_gateway     = true
  single_nat_gateway     = var.environment == "prod" ? false : true
  one_nat_gateway_per_az = var.environment == "prod" ? true : false
  enable_vpn_gateway     = false

  enable_dns_hostnames = true
  enable_dns_support   = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }
  database_subnet_tags = {
    Name = "${local.name_prefix}-database-subnet"
  }

  tags = local.common_tags
}

# ============================================
# EKS Cluster
# ============================================
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "${local.name_prefix}-cluster"
  cluster_version = var.eks_cluster_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access           = var.environment == "prod" ? false : true
  cluster_endpoint_private_access          = true
  cluster_endpoint_public_access_cidrs     = var.environment == "prod" ? [] : ["0.0.0.0/0"]
  cluster_encryption_config = {
    resources = ["secrets"]
  }

  eks_managed_node_groups = {
    main = {
      desired_size = var.eks_node_group_desired_size
      min_size     = var.eks_node_group_min_size
      max_size     = var.eks_node_group_max_size

      instance_types = var.eks_node_group_instance_types
      capacity_type  = "ON_DEMAND"
      disk_size      = var.eks_node_group_disk_size

      use_custom_launch_template = false

      update_config = {
        max_unavailable_percentage = 33
      }

      tags = local.common_tags
    }
  }

  node_security_group_additional_rules = {
    ingress_self_all = {
      description = "Node to node all ports/protocols"
      protocol    = "-1"
      from_port   = 0
      to_port     = 0
      type        = "ingress"
      self        = true
    }
    ingress_cluster_all = {
      description = "Cluster to node all ports/protocols"
      protocol    = "-1"
      from_port   = 0
      to_port     = 0
      type        = "ingress"
      source_cluster_security_group = true
    }
    egress_all = {
      description = "Node all egress"
      protocol    = "-1"
      from_port   = 0
      to_port     = 0
      type        = "egress"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  tags = local.common_tags
}

# ============================================
# RDS MySQL
# ============================================
resource "random_password" "db_password" {
  length  = 24
  special = false
}

resource "aws_db_subnet_group" "mysql" {
  name       = "${local.name_prefix}-mysql-subnet-group"
  subnet_ids = module.vpc.database_subnets
  tags       = local.common_tags
}

resource "aws_db_parameter_group" "mysql" {
  name        = "${local.name_prefix}-mysql-params"
  family      = "mysql8.0"
  description = "IT Connect MySQL parameter group"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }
  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }
  parameter {
    name  = "max_connections"
    value = "500"
  }
  parameter {
    name  = "innodb_buffer_pool_size"
    value = "{DBInstanceClassMemory*3/4}"
  }
  parameter {
    name  = "slow_query_log"
    value = "1"
  }
  parameter {
    name  = "long_query_time"
    value = "2"
  }

  tags = local.common_tags
}

resource "aws_db_instance" "mysql" {
  count = var.create_rds ? 1 : 0

  identifier = "${local.name_prefix}-mysql"

  engine         = "mysql"
  engine_version = "8.0.35"
  instance_class = var.rds_instance_class

  allocated_storage     = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = null

  db_name  = var.db_name
  username = var.db_username != "" ? var.db_username : "itconnect"
  password = var.db_password != "" ? var.db_password : random_password.db_password.result

  db_subnet_group_name   = aws_db_subnet_group.mysql.name
  parameter_group_name   = aws_db_parameter_group.mysql.name
  vpc_security_group_ids = [aws_security_group.mysql.id]

  backup_retention_period = var.rds_backup_retention_period
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  multi_az               = var.rds_multi_az
  deletion_protection    = var.rds_deletion_protection
  skip_final_snapshot    = var.environment == "prod" ? false : true
  final_snapshot_identifier = var.environment == "prod" ? "${local.name_prefix}-mysql-final-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  copy_tags_to_snapshot = true
  enabled_cloudwatch_logs_exports = ["audit", "error", "general", "slowquery"]

  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  monitoring_interval                   = 60
  monitoring_role_arn                   = aws_iam_role.rds_enhanced_monitoring.arn

  auto_minor_version_upgrade = true

  tags = local.common_tags
}

# ============================================
# ElastiCache Redis
# ============================================
resource "aws_elasticache_subnet_group" "redis" {
  name       = "${local.name_prefix}-redis-subnet-group"
  subnet_ids = module.vpc.private_subnets
  tags       = local.common_tags
}

resource "aws_elasticache_replication_group" "redis" {
  count = var.create_redis ? 1 : 0

  replication_group_id = "${local.name_prefix}-redis"
  description          = "IT Connect Redis cluster"

  engine         = "redis"
  engine_version = "7.1"
  port           = 6379

  node_type            = var.redis_node_type
  num_cache_clusters   = var.redis_automatic_failover ? 2 : var.redis_num_cache_nodes
  automatic_failover_enabled = var.redis_automatic_failover
  multi_az_enabled     = var.redis_automatic_failover

  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]

  at_rest_encryption_enabled  = true
  transit_encryption_enabled  = true
  auth_token                  = random_password.redis_auth_token.result
  auth_token_update_strategy  = "ROTATE"

  maintenance_window = "sun:05:00-sun:06:00"
  snapshot_window    = "02:00-03:00"
  snapshot_retention_limit = 7

  auto_minor_version_upgrade = true
  notification_topic_arn     = null

  tags = local.common_tags
}

resource "random_password" "redis_auth_token" {
  length  = 32
  special = false
}

# ============================================
# OpenSearch (Elasticsearch)
# ============================================
resource "aws_opensearch_domain" "this" {
  count = var.create_opensearch ? 1 : 0

  domain_name    = "${var.project_name}-${var.environment}"
  engine_version = "OpenSearch_2.11"

  cluster_config {
    instance_type  = var.opensearch_instance_type
    instance_count = var.opensearch_instance_count

    dedicated_master_enabled = var.opensearch_dedicated_master_enabled
    dedicated_master_count   = var.opensearch_dedicated_master_count
    dedicated_master_type    = var.opensearch_dedicated_master_type

    zone_awareness_enabled = var.opensearch_instance_count > 1 ? true : false
  }

  ebs_options {
    ebs_enabled = true
    volume_size = var.opensearch_ebs_volume_size
    volume_type = "gp3"
  }

  encrypt_at_rest {
    enabled    = true
    kms_key_id = null
  }

  node_to_node_encryption {
    enabled = true
  }

  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "TLS_1_2"
  }

  advanced_security_options {
    enabled                        = true
    internal_user_database_enabled = true
    master_user_options {
      master_user_name     = "opensearch-admin"
      master_user_password = random_password.opensearch_password.result
    }
  }

  vpc_options {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [aws_security_group.opensearch.id]
  }

  log_publishing_options {
    cloudwatch_log_group_arn = aws_cloudwatch_log_group.opensearch_application[0].arn
    log_type                 = "INDEX_SLOW_LOGS"
  }
  log_publishing_options {
    cloudwatch_log_group_arn = aws_cloudwatch_log_group.opensearch_application[0].arn
    log_type                 = "SEARCH_SLOW_LOGS"
  }
  log_publishing_options {
    cloudwatch_log_group_arn = aws_cloudwatch_log_group.opensearch_application[0].arn
    log_type                 = "ES_APPLICATION_LOGS"
  }

  auto_tune_options {
    desired_state = "ENABLED"
  }

  snapshot_options {
    automated_snapshot_start_hour = 3
  }

  tags = local.common_tags
}

resource "random_password" "opensearch_password" {
  length  = 24
  special = false
}

# ============================================
# S3 Buckets
# ============================================
resource "aws_s3_bucket" "media" {
  bucket = var.s3_media_bucket_name
  tags   = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "media" {
  bucket = aws_s3_bucket.media.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "media" {
  bucket = aws_s3_bucket.media.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "media" {
  bucket = aws_s3_bucket.media.id
  rule {
    id     = "expire-aborted-multipart-uploads"
    status = "Enabled"
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
  rule {
    id     = "transition-old-versions"
    status = "Enabled"
    filter {
      prefix = ""
    }
    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }
    noncurrent_version_expiration {
      noncurrent_days = 365
    }
  }
}

resource "aws_s3_bucket" "logs" {
  bucket = var.s3_logs_bucket_name
  tags   = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "logs" {
  bucket = aws_s3_bucket.logs.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "logs" {
  bucket = aws_s3_bucket.logs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket" "backups" {
  bucket = var.s3_backup_bucket_name
  tags   = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "backups" {
  bucket = aws_s3_bucket.backups.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  rule {
    id     = "expire-old-backups"
    status = "Enabled"
    expiration {
      days = 90
    }
  }
}

# ============================================
# ECR Repositories
# ============================================
resource "aws_ecr_repository" "backend" {
  name                 = "${local.name_prefix}/backend"
  image_tag_mutability = var.ecr_image_tag_mutability
  force_delete         = var.environment != "prod"

  image_scanning_configuration {
    scan_on_push = var.ecr_scan_on_push
  }

  tags = local.common_tags
}

resource "aws_ecr_repository" "web" {
  name                 = "${local.name_prefix}/web"
  image_tag_mutability = var.ecr_image_tag_mutability
  force_delete         = var.environment != "prod"

  image_scanning_configuration {
    scan_on_push = var.ecr_scan_on_push
  }

  tags = local.common_tags
}

resource "aws_ecr_repository" "admin" {
  name                 = "${local.name_prefix}/admin"
  image_tag_mutability = var.ecr_image_tag_mutability
  force_delete         = var.environment != "prod"

  image_scanning_configuration {
    scan_on_push = var.ecr_scan_on_push
  }

  tags = local.common_tags
}

resource "aws_ecr_repository" "mobile" {
  name                 = "${local.name_prefix}/mobile"
  image_tag_mutability = var.ecr_image_tag_mutability
  force_delete         = var.environment != "prod"

  image_scanning_configuration {
    scan_on_push = var.ecr_scan_on_push
  }

  tags = local.common_tags
}

# ============================================
# CloudFront Distribution
# ============================================
resource "aws_cloudfront_origin_access_control" "media" {
  name                              = "${local.name_prefix}-media-oac"
  description                       = "OAC for media bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "media" {
  count = var.enable_cloudfront ? 1 : 0

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "IT Connect Media Distribution - ${var.environment}"
  default_root_object = "index.html"
  price_class         = var.cloudfront_price_class
  http_version        = "http2and3"

  aliases = var.domain_name != "" ? ["media.${var.domain_name}"] : []

  origin {
    domain_name              = aws_s3_bucket.media.bucket_regional_domain_name
    origin_id                = "media-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.media.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "media-origin"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern     = "uploads/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "media-origin"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.enable_acm ? aws_acm_certificate.main[0].arn : null
    ssl_support_method        = "sni-only"
    minimum_protocol_version  = "TLSv1.2_2021"
    cloudfront_default_certificate = var.enable_acm ? false : true
  }

  logging_config {
    include_cookies = false
    bucket          = aws_s3_bucket.logs.bucket_domain_name
    prefix          = "cloudfront/"
  }

  tags = local.common_tags
}

# ============================================
# ACM SSL Certificate
# ============================================
resource "aws_acm_certificate" "main" {
  count = var.enable_acm ? 1 : 0

  domain_name       = var.certificate_domain_name != "" ? var.certificate_domain_name : var.domain_name
  subject_alternative_names = concat(
    ["*.${var.domain_name}"],
    var.additional_certificate_domains
  )

  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = local.common_tags
}

resource "aws_route53_record" "cert_validation" {
  for_each = var.enable_acm && var.enable_route53 ? {
    for dvo in aws_acm_certificate.main[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.route53_zone_id
}

resource "aws_acm_certificate_validation" "main" {
  count = var.enable_acm && var.enable_route53 ? 1 : 0

  certificate_arn         = aws_acm_certificate.main[0].arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# ============================================
# Route53 Records
# ============================================
resource "aws_route53_record" "main" {
  for_each = var.enable_route53 ? {
    main   = var.domain_name
    www    = "www.${var.domain_name}"
    api    = "api.${var.domain_name}"
    admin  = "admin.${var.domain_name}"
    media  = "media.${var.domain_name}"
  } : {}

  zone_id = var.route53_zone_id
  name    = each.value
  type    = "A"

  alias {
    name                   = module.eks.cluster_endpoint
    zone_id                = module.eks.cluster_primary_security_group_id
    evaluate_target_health = false
  }
}

# ============================================
# CloudWatch Log Groups
# ============================================
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/aws/eks/${local.name_prefix}/backend"
  retention_in_days = var.log_retention_days
  kms_key_id        = null
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "web" {
  name              = "/aws/eks/${local.name_prefix}/web"
  retention_in_days = var.log_retention_days
  kms_key_id        = null
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "admin" {
  name              = "/aws/eks/${local.name_prefix}/admin"
  retention_in_days = var.log_retention_days
  kms_key_id        = null
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "nginx" {
  name              = "/aws/eks/${local.name_prefix}/nginx"
  retention_in_days = var.log_retention_days
  kms_key_id        = null
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "opensearch_application" {
  count             = var.create_opensearch ? 1 : 0
  name              = "/aws/opensearch/${local.name_prefix}/application"
  retention_in_days = var.log_retention_days
  kms_key_id        = null
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "rds" {
  count             = var.create_rds ? 1 : 0
  name              = "/aws/rds/${local.name_prefix}/mysql"
  retention_in_days = var.log_retention_days
  kms_key_id        = null
  tags              = local.common_tags
}

# ============================================
# Security Groups
# ============================================
resource "aws_security_group" "mysql" {
  name        = "${local.name_prefix}-mysql-sg"
  description = "IT Connect MySQL security group"
  vpc_id      = module.vpc.vpc_id
  tags        = local.common_tags
}

resource "aws_security_group_rule" "mysql_ingress" {
  type                     = "ingress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  security_group_id        = aws_security_group.mysql.id
  source_security_group_id = module.eks.node_security_group_id
  description              = "Allow MySQL access from EKS nodes"
}

resource "aws_security_group_rule" "mysql_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  security_group_id = aws_security_group.mysql.id
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow all egress from MySQL"
}

resource "aws_security_group" "redis" {
  name        = "${local.name_prefix}-redis-sg"
  description = "IT Connect Redis security group"
  vpc_id      = module.vpc.vpc_id
  tags        = local.common_tags
}

resource "aws_security_group_rule" "redis_ingress" {
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  security_group_id        = aws_security_group.redis.id
  source_security_group_id = module.eks.node_security_group_id
  description              = "Allow Redis access from EKS nodes"
}

resource "aws_security_group_rule" "redis_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  security_group_id = aws_security_group.redis.id
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow all egress from Redis"
}

resource "aws_security_group" "opensearch" {
  name        = "${local.name_prefix}-opensearch-sg"
  description = "IT Connect OpenSearch security group"
  vpc_id      = module.vpc.vpc_id
  tags        = local.common_tags
}

resource "aws_security_group_rule" "opensearch_ingress" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.opensearch.id
  source_security_group_id = module.eks.node_security_group_id
  description              = "Allow OpenSearch access from EKS nodes"
}

resource "aws_security_group_rule" "opensearch_ingress_https" {
  type                     = "ingress"
  from_port                = 9200
  to_port                  = 9200
  protocol                 = "tcp"
  security_group_id        = aws_security_group.opensearch.id
  source_security_group_id = module.eks.node_security_group_id
  description              = "Allow OpenSearch HTTP access from EKS nodes"
}

resource "aws_security_group_rule" "opensearch_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  security_group_id = aws_security_group.opensearch.id
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow all egress from OpenSearch"
}
