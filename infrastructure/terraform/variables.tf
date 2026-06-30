variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "it-connect-matrimony"
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
}

variable "database_subnet_cidrs" {
  description = "CIDR blocks for database subnets"
  type        = list(string)
  default     = null
}

variable "eks_cluster_version" {
  description = "EKS cluster Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "eks_node_group_instance_types" {
  description = "Instance types for EKS node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "eks_node_group_desired_size" {
  description = "Desired number of nodes in EKS node group"
  type        = number
  default     = 3
}

variable "eks_node_group_min_size" {
  description = "Minimum number of nodes in EKS node group"
  type        = number
  default     = 3
}

variable "eks_node_group_max_size" {
  description = "Maximum number of nodes in EKS node group"
  type        = number
  default     = 10
}

variable "eks_node_group_disk_size" {
  description = "Disk size for EKS nodes in GB"
  type        = number
  default     = 50
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 100
}

variable "rds_max_allocated_storage" {
  description = "RDS maximum allocated storage in GB (autoscaling)"
  type        = number
  default     = 500
}

variable "rds_multi_az" {
  description = "Enable RDS Multi-AZ deployment"
  type        = bool
  default     = false
}

variable "rds_backup_retention_period" {
  description = "RDS backup retention period in days"
  type        = number
  default     = 7
}

variable "rds_deletion_protection" {
  description = "Enable RDS deletion protection"
  type        = bool
  default     = true
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.medium"
}

variable "redis_num_cache_nodes" {
  description = "Number of Redis cache nodes"
  type        = number
  default     = 1
}

variable "redis_automatic_failover" {
  description = "Enable Redis automatic failover"
  type        = bool
  default     = false
}

variable "opensearch_instance_type" {
  description = "OpenSearch instance type"
  type        = string
  default     = "t3.small.search"
}

variable "opensearch_instance_count" {
  description = "Number of OpenSearch instances"
  type        = number
  default     = 1
}

variable "opensearch_ebs_volume_size" {
  description = "OpenSearch EBS volume size in GB"
  type        = number
  default     = 100
}

variable "opensearch_dedicated_master_enabled" {
  description = "Enable OpenSearch dedicated master nodes"
  type        = bool
  default     = false
}

variable "opensearch_dedicated_master_count" {
  description = "Number of OpenSearch dedicated master nodes"
  type        = number
  default     = 0
}

variable "opensearch_dedicated_master_type" {
  description = "OpenSearch dedicated master node type"
  type        = string
  default     = "t3.small.search"
}

variable "ecr_image_tag_mutability" {
  description = "ECR image tag mutability"
  type        = string
  default     = "IMMUTABLE"
}

variable "ecr_scan_on_push" {
  description = "Enable ECR scan on push"
  type        = bool
  default     = true
}

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}

variable "db_username" {
  description = "RDS master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "RDS database name"
  type        = string
  default     = "it_connect"
}

variable "s3_media_bucket_name" {
  description = "S3 bucket name for media uploads"
  type        = string
}

variable "s3_logs_bucket_name" {
  description = "S3 bucket name for access logs"
  type        = string
}

variable "s3_backup_bucket_name" {
  description = "S3 bucket name for backups"
  type        = string
}

variable "allowed_ssh_cidr_blocks" {
  description = "CIDR blocks allowed for SSH access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "create_eks_cluster" {
  description = "Whether to create EKS cluster"
  type        = bool
  default     = true
}

variable "create_rds" {
  description = "Whether to create RDS instance"
  type        = bool
  default     = true
}

variable "create_redis" {
  description = "Whether to create ElastiCache Redis"
  type        = bool
  default     = true
}

variable "create_opensearch" {
  description = "Whether to create OpenSearch domain"
  type        = bool
  default     = true
}

variable "enable_cloudfront" {
  description = "Whether to create CloudFront distribution"
  type        = bool
  default     = true
}

variable "enable_route53" {
  description = "Whether to create Route53 records"
  type        = bool
  default     = true
}

variable "enable_acm" {
  description = "Whether to request ACM certificates"
  type        = bool
  default     = true
}

variable "certificate_domain_name" {
  description = "Domain name for ACM certificate"
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
  default     = ""
}

variable "additional_certificate_domains" {
  description = "Additional domain names for ACM certificate"
  type        = list(string)
  default     = []
}
