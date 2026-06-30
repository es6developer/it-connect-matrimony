aws_region               = "us-east-1"
environment              = "staging"
domain_name              = "staging.itconnectmatrimony.com"
project_name             = "it-connect-matrimony"

vpc_cidr                 = "10.48.0.0/16"
availability_zones       = ["us-east-1a", "us-east-1b", "us-east-1c"]
public_subnet_cidrs      = ["10.48.1.0/24", "10.48.2.0/24", "10.48.3.0/24"]
private_subnet_cidrs     = ["10.48.10.0/24", "10.48.11.0/24", "10.48.12.0/24"]
database_subnet_cidrs    = ["10.48.20.0/24", "10.48.21.0/24", "10.48.22.0/24"]

eks_cluster_version          = "1.28"
eks_node_group_instance_types = ["t3.medium"]
eks_node_group_desired_size  = 3
eks_node_group_min_size      = 3
eks_node_group_max_size      = 6
eks_node_group_disk_size     = 50

rds_instance_class        = "db.t3.medium"
rds_allocated_storage     = 50
rds_max_allocated_storage = 200
rds_multi_az              = false
rds_backup_retention_period = 7
rds_deletion_protection   = true

redis_node_type           = "cache.t3.small"
redis_num_cache_nodes     = 1
redis_automatic_failover  = false

opensearch_instance_type       = "t3.small.search"
opensearch_instance_count      = 2
opensearch_ebs_volume_size     = 50

ecr_image_tag_mutability = "IMMUTABLE"
ecr_scan_on_push         = true

cloudfront_price_class   = "PriceClass_200"
log_retention_days       = 30

db_username              = "itconnect"
db_name                  = "it_connect_staging"

s3_media_bucket_name     = "it-connect-staging-media-uploads"
s3_logs_bucket_name      = "it-connect-staging-logs"
s3_backup_bucket_name    = "it-connect-staging-backups"

enable_cloudfront        = true
enable_acm               = true
enable_route53           = true
certificate_domain_name  = "staging.itconnectmatrimony.com"
additional_certificate_domains = ["*.staging.itconnectmatrimony.com"]
route53_zone_id          = "ZSTAGINGHOSTEDZONEID"

create_eks_cluster       = true
create_rds               = true
create_redis             = true
create_opensearch        = true

tags = {
  Environment = "staging"
  Project     = "it-connect-matrimony"
}
