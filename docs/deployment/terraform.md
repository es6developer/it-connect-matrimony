# Terraform Infrastructure Guide

## Overview

Infrastructure is managed as code using Terraform. Code is located in `infrastructure/terraform/`.

## Directory Structure

```
infrastructure/terraform/
├── main.tf                  # Main infrastructure definition
├── variables.tf             # Input variables
├── iam.tf                   # IAM roles and policies
├── outputs.tf               # Output values
├── environments/
│   ├── dev/
│   │   └── terraform.tfvars
│   ├── staging/
│   │   └── terraform.tfvars
│   └── prod/
│       └── terraform.tfvars
```

## Prerequisites

```bash
# Install Terraform (v1.5+)
brew install terraform

# Configure AWS credentials
aws configure

# S3 backend bucket (create once)
aws s3 mb s3://it-connect-terraform-state
aws dynamodb create-table \
  --table-name it-connect-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

## Workspace Management

```bash
# List workspaces
terraform workspace list

# Create/select workspace
terraform workspace new dev
terraform workspace select prod
```

## Initialization

```bash
# Initialize with backend config
cd infrastructure/terraform
terraform init

# For specific environment
terraform init -backend-config="key=infrastructure/terraform-{env}.tfstate"
```

## Environment Configurations

### Dev (`environments/dev/terraform.tfvars`)
```hcl
environment = "dev"
aws_region = "ap-south-1"
vpc_cidr = "10.0.0.0/16"
availability_zones = ["ap-south-1a", "ap-south-1b"]
create_rds = true
rds_instance_class = "db.t3.medium"
rds_multi_az = false
create_redis = true
redis_node_type = "cache.t3.medium"
redis_num_cache_nodes = 1
redis_automatic_failover = false
create_opensearch = true
opensearch_instance_type = "t3.small.search"
opensearch_instance_count = 1
opensearch_dedicated_master_enabled = false
eks_node_group_instance_types = ["t3.medium"]
eks_node_group_desired_size = 2
eks_node_group_min_size = 1
eks_node_group_max_size = 4
enable_cloudfront = false
enable_acm = false
enable_route53 = false
domain_name = ""
```

### Staging (`environments/staging/terraform.tfvars`)
```hcl
environment = "staging"
aws_region = "ap-south-1"
vpc_cidr = "10.1.0.0/16"
availability_zones = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
create_rds = true
rds_instance_class = "db.r6g.large"
rds_multi_az = true
rds_deletion_protection = false
create_redis = true
redis_node_type = "cache.r6g.large"
redis_num_cache_nodes = 1
redis_automatic_failover = true
create_opensearch = true
opensearch_instance_type = "r6g.large.search"
opensearch_instance_count = 2
eks_node_group_instance_types = ["t3.large"]
eks_node_group_desired_size = 3
eks_node_group_min_size = 2
eks_node_group_max_size = 8
enable_cloudfront = true
enable_acm = true
enable_route53 = true
domain_name = "staging.itconnectmatrimony.com"
```

### Production (`environments/prod/terraform.tfvars`)
```hcl
environment = "prod"
aws_region = "ap-south-1"
vpc_cidr = "10.0.0.0/16"
availability_zones = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
create_rds = true
rds_instance_class = "db.r6g.large"
rds_multi_az = true
rds_allocated_storage = 200
rds_max_allocated_storage = 1000
rds_backup_retention_period = 35
rds_deletion_protection = true
create_redis = true
redis_node_type = "cache.r6g.large"
redis_automatic_failover = true
create_opensearch = true
opensearch_instance_type = "r6g.large.search"
opensearch_instance_count = 3
opensearch_dedicated_master_enabled = true
opensearch_dedicated_master_count = 3
opensearch_dedicated_master_type = "t3.small.search"
eks_node_group_instance_types = ["c6i.large", "r6i.large"]
eks_node_group_desired_size = 5
eks_node_group_min_size = 3
eks_node_group_max_size = 20
enable_cloudfront = true
enable_acm = true
enable_route53 = true
domain_name = "itconnectmatrimony.com"
certificate_domain_name = "itconnectmatrimony.com"
route53_zone_id = "Z0123456789ABCDEF"
```

## Deployment Commands

### Plan
```bash
# Preview changes
terraform plan -var-file=environments/dev/terraform.tfvars

# Save plan
terraform plan -var-file=environments/dev/terraform.tfvars -out=tfplan
```

### Apply
```bash
# Apply with plan
terraform apply tfplan

# Or directly
terraform apply -var-file=environments/prod/terraform.tfvars -auto-approve
```

### Destroy
```bash
# Destroy environment
terraform destroy -var-file=environments/dev/terraform.tfvars
```

## Key Components (from `main.tf`)

| Component | Resource | Notes |
|-----------|----------|-------|
| VPC | `module.vpc` | 3 AZs, public/private/database subnets |
| EKS | `module.eks` | Managed node groups, private endpoint |
| RDS MySQL | `aws_db_instance.mysql` | Multi-AZ, encrypted, Performance Insights |
| ElastiCache Redis | `aws_elasticache_replication_group.redis` | Cluster mode, encrypted, auth token |
| OpenSearch | `aws_opensearch_domain.this` | Dedicated master, VPC, encrypted |
| ECR | `aws_ecr_repository.*` | 4 repos: backend, web, admin, mobile |
| S3 | `aws_s3_bucket.*` | Media, logs, backups - all encrypted |
| CloudFront | `aws_cloudfront_distribution.media` | OAC with S3, custom SSL |
| ACM | `aws_acm_certificate.main` | DNS validation via Route53 |
| Route53 | `aws_route53_record.*` | Main domain, www, api, admin, media |
| CloudWatch | `aws_cloudwatch_log_group.*` | Log groups for all services |

## IAM Configuration (`iam.tf`)

```hcl
# RDS Enhanced Monitoring Role
resource "aws_iam_role" "rds_enhanced_monitoring" {
  name = "${local.name_prefix}-rds-monitoring"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "monitoring.rds.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  role       = aws_iam_role.rds_enhanced_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# EKS Node IAM Role
resource "aws_iam_role" "eks_node" {
  name = "${local.name_prefix}-eks-node-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_worker_node" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node.name
}

resource "aws_iam_role_policy_attachment" "eks_cni" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node.name
}

resource "aws_iam_role_policy_attachment" "ecr_read" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node.name
}

resource "aws_iam_role_policy_attachment" "s3_access" {
  policy_arn = aws_iam_policy.s3_access.arn
  role       = aws_iam_role.eks_node.name
}
```

## Outputs (`outputs.tf`)

```hcl
output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "cluster_name" {
  value = module.eks.cluster_name
}

output "rds_endpoint" {
  value = aws_db_instance.mysql[0].address
}

output "redis_endpoint" {
  value = aws_elasticache_replication_group.redis[0].primary_endpoint_address
}

output "opensearch_endpoint" {
  value = aws_opensearch_domain.this[0].endpoint
}

output "ecr_backend_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "cloudfront_domain" {
  value = var.enable_cloudfront ? aws_cloudfront_distribution.media[0].domain_name : ""
}
```
