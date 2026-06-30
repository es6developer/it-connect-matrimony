aws_region               = "us-east-1"
environment              = "prod"
domain_name              = "itconnectmatrimony.com"
project_name             = "it-connect-matrimony"

vpc_cidr                 = "10.96.0.0/16"
availability_zones       = ["us-east-1a", "us-east-1b", "us-east-1c"]
public_subnet_cidrs      = ["10.96.1.0/24", "10.96.2.0/24", "10.96.3.0/24"]
private_subnet_cidrs     = ["10.96.10.0/24", "10.96.11.0/24", "10.96.12.0/24"]
database_subnet_cidrs    = ["10.96.20.0/24", "10.96.21.0/24", "10.96.22.0/24"]

eks_cluster_version          = "1.28"
eks_node_group_instance_types = ["t3.large"]
eks_node_group_desired_size  = 5
eks_node_group_min_size      = 3
eks_node_group_max_size      = 15
eks_node_group_disk_size     = 100

rds_instance_class        = "db.r6g.large"
rds_allocated_storage     = 200
rds_max_allocated_storage = 1000
rds_multi_az              = true
rds_backup_retention_period = 30
rds_deletion_protection   = true

redis_node_type           = "cache.r6g.large"
redis_num_cache_nodes     = 2
redis_automatic_failover  = true

opensearch_instance_type       = "m6g.large.search"
opensearch_instance_count      = 3
opensearch_ebs_volume_size     = 200
opensearch_dedicated_master_enabled = true
opensearch_dedicated_master_count   = 3
opensearch_dedicated_master_type    = "m6g.large.search"

ecr_image_tag_mutability = "IMMUTABLE"
ecr_scan_on_push         = true

cloudfront_price_class   = "PriceClass_All"
log_retention_days       = 90

db_username              = "itconnect"
db_name                  = "it_connect"

s3_media_bucket_name     = "it-connect-prod-media-uploads"
s3_logs_bucket_name      = "it-connect-prod-logs"
s3_backup_bucket_name    = "it-connect-prod-backups"

enable_cloudfront        = true
enable_acm               = true
enable_route53           = true
certificate_domain_name  = "itconnectmatrimony.com"
additional_certificate_domains = [
  "*.itconnectmatrimony.com",
  "www.itconnectmatrimony.com",
  "api.itconnectmatrimony.com",
  "admin.itconnectmatrimony.com",
  "media.itconnectmatrimony.com"
]
route53_zone_id          = "ZPRODHOSTEDZONEID"

create_eks_cluster       = true
create_rds               = true
create_redis             = true
create_opensearch        = true

allowed_ssh_cidr_blocks  = ["10.0.0.0/8"]

tags = {
  Environment = "prod"
  Project     = "it-connect-matrimony"
}
