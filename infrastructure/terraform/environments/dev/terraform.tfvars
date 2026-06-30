aws_region               = "us-east-1"
environment              = "dev"
domain_name              = "dev.itconnectmatrimony.com"
project_name             = "it-connect-matrimony"

vpc_cidr                 = "10.0.0.0/16"
availability_zones       = ["us-east-1a", "us-east-1b"]
public_subnet_cidrs      = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs     = ["10.0.10.0/24", "10.0.11.0/24"]
database_subnet_cidrs    = ["10.0.20.0/24", "10.0.21.0/24"]

eks_cluster_version          = "1.28"
eks_node_group_instance_types = ["t3.medium"]
eks_node_group_desired_size  = 2
eks_node_group_min_size      = 2
eks_node_group_max_size      = 4
eks_node_group_disk_size     = 30

rds_instance_class        = "db.t3.small"
rds_allocated_storage     = 20
rds_max_allocated_storage = 100
rds_multi_az              = false
rds_backup_retention_period = 3
rds_deletion_protection   = false

redis_node_type           = "cache.t3.micro"
redis_num_cache_nodes     = 1
redis_automatic_failover  = false

opensearch_instance_type       = "t3.small.search"
opensearch_instance_count      = 1
opensearch_ebs_volume_size     = 20

ecr_image_tag_mutability = "MUTABLE"
ecr_scan_on_push         = true

cloudfront_price_class   = "PriceClass_100"
log_retention_days       = 14

db_username              = "itconnect"
db_name                  = "it_connect_dev"

s3_media_bucket_name     = "it-connect-dev-media-uploads"
s3_logs_bucket_name      = "it-connect-dev-logs"
s3_backup_bucket_name    = "it-connect-dev-backups"

enable_cloudfront        = false
enable_acm               = false
enable_route53           = false

create_eks_cluster       = true
create_rds               = true
create_redis             = true
create_opensearch        = true

tags = {
  Environment = "dev"
  Project     = "it-connect-matrimony"
}
