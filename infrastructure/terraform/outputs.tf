output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_public_subnets" {
  description = "IDs of the VPC public subnets"
  value       = module.vpc.public_subnets
}

output "vpc_private_subnets" {
  description = "IDs of the VPC private subnets"
  value       = module.vpc.private_subnets
}

output "eks_cluster_id" {
  description = "EKS cluster ID"
  value       = module.eks.cluster_id
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_certificate_authority_data" {
  description = "EKS cluster certificate authority data"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "eks_cluster_security_group_id" {
  description = "EKS cluster security group ID"
  value       = module.eks.cluster_primary_security_group_id
}

output "eks_node_security_group_id" {
  description = "EKS node security group ID"
  value       = module.eks.node_security_group_id
}

output "eks_oidc_provider_arn" {
  description = "EKS OIDC provider ARN"
  value       = module.eks.oidc_provider_arn
}

output "eks_oidc_provider_url" {
  description = "EKS OIDC provider URL"
  value       = module.eks.oidc_provider
}

output "rds_endpoint" {
  description = "RDS MySQL endpoint"
  value       = var.create_rds ? aws_db_instance.mysql[0].endpoint : null
}

output "rds_address" {
  description = "RDS MySQL address"
  value       = var.create_rds ? aws_db_instance.mysql[0].address : null
}

output "rds_port" {
  description = "RDS MySQL port"
  value       = var.create_rds ? aws_db_instance.mysql[0].port : null
}

output "rds_database_name" {
  description = "RDS MySQL database name"
  value       = var.create_rds ? aws_db_instance.mysql[0].db_name : null
}

output "redis_primary_endpoint" {
  description = "Redis primary endpoint"
  value       = var.create_redis ? aws_elasticache_replication_group.redis[0].primary_endpoint_address : null
}

output "redis_port" {
  description = "Redis port"
  value       = var.create_redis ? aws_elasticache_replication_group.redis[0].port : null
}

output "redis_auth_token" {
  description = "Redis auth token"
  value       = var.create_redis ? aws_elasticache_replication_group.redis[0].auth_token : null
  sensitive   = true
}

output "opensearch_domain_endpoint" {
  description = "OpenSearch domain endpoint"
  value       = var.create_opensearch ? aws_opensearch_domain.this[0].endpoint : null
}

output "opensearch_dashboard_endpoint" {
  description = "OpenSearch Kibana/OpenSearch Dashboards endpoint"
  value       = var.create_opensearch ? aws_opensearch_domain.this[0].dashboard_endpoint : null
}

output "opensearch_arn" {
  description = "OpenSearch domain ARN"
  value       = var.create_opensearch ? aws_opensearch_domain.this[0].arn : null
}

output "s3_media_bucket_arn" {
  description = "S3 media bucket ARN"
  value       = aws_s3_bucket.media.arn
}

output "s3_media_bucket_name" {
  description = "S3 media bucket name"
  value       = aws_s3_bucket.media.bucket
}

output "s3_logs_bucket_name" {
  description = "S3 logs bucket name"
  value       = aws_s3_bucket.logs.bucket
}

output "s3_backup_bucket_name" {
  description = "S3 backup bucket name"
  value       = aws_s3_bucket.backups.bucket
}

output "ecr_backend_repository_url" {
  description = "ECR backend repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_web_repository_url" {
  description = "ECR web repository URL"
  value       = aws_ecr_repository.web.repository_url
}

output "ecr_admin_repository_url" {
  description = "ECR admin repository URL"
  value       = aws_ecr_repository.admin.repository_url
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.media[0].domain_name : null
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.media[0].id : null
}

output "acm_certificate_arn" {
  description = "ACM certificate ARN"
  value       = var.enable_acm ? aws_acm_certificate.main[0].arn : null
}
