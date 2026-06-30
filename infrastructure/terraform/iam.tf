# ============================================
# IAM Roles for EKS Service Accounts
# ============================================
data "aws_iam_policy_document" "eks_oidc_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"
    condition {
      test     = "StringEquals"
      variable = "${module.eks.oidc_provider}:sub"
      values   = ["system:serviceaccount:${var.environment}:*"]
    }
    principals {
      identifiers = [module.eks.oidc_provider_arn]
      type        = "Federated"
    }
  }
}

resource "aws_iam_role" "backend_service_account" {
  name               = "${local.name_prefix}-backend-sa-role"
  assume_role_policy = data.aws_iam_policy_document.eks_oidc_assume_role.json

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "backend_s3_access" {
  role       = aws_iam_role.backend_service_account.name
  policy_arn = aws_iam_policy.s3_media_access.arn
}

resource "aws_iam_policy" "s3_media_access" {
  name        = "${local.name_prefix}-s3-media-access"
  description = "Allow access to S3 media bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetObjectVersion",
          "s3:PutObjectAcl"
        ]
        Resource = [
          aws_s3_bucket.media.arn,
          "${aws_s3_bucket.media.arn}/*"
        ]
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_policy" "ses_send_email" {
  name        = "${local.name_prefix}-ses-send-email"
  description = "Allow sending emails via SES"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail"
        ]
        Resource = "*"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "backend_ses_access" {
  role       = aws_iam_role.backend_service_account.name
  policy_arn = aws_iam_policy.ses_send_email.arn
}

resource "aws_iam_policy" "sns_push_notifications" {
  name        = "${local.name_prefix}-sns-push-notifications"
  description = "Allow sending push notifications via SNS"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sns:Publish",
          "sns:CreatePlatformEndpoint",
          "sns:GetEndpointAttributes",
          "sns:SetEndpointAttributes"
        ]
        Resource = "*"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "backend_sns_access" {
  role       = aws_iam_role.backend_service_account.name
  policy_arn = aws_iam_policy.sns_push_notifications.arn
}

resource "aws_iam_policy" "cloudwatch_metrics" {
  name        = "${local.name_prefix}-cloudwatch-metrics"
  description = "Allow publishing custom CloudWatch metrics"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "cloudwatch:GetMetricData",
          "cloudwatch:ListMetrics"
        ]
        Resource = "*"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "backend_cloudwatch_access" {
  role       = aws_iam_role.backend_service_account.name
  policy_arn = aws_iam_policy.cloudwatch_metrics.arn
}

# ============================================
# IAM Role for RDS Enhanced Monitoring
# ============================================
resource "aws_iam_role" "rds_enhanced_monitoring" {
  name = "${local.name_prefix}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  role       = aws_iam_role.rds_enhanced_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ============================================
# IAM Role for Node Group
# ============================================
resource "aws_iam_policy" "eks_node_additional" {
  name        = "${local.name_prefix}-eks-node-additional"
  description = "Additional permissions for EKS worker nodes"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:DescribeTags",
          "ec2:DescribeVolumes",
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = "*"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "eks_node_additional" {
  role       = module.eks.eks_managed_node_groups["main"].iam_role_name
  policy_arn = aws_iam_policy.eks_node_additional.arn
}

# ============================================
# IAM Role for Github Actions (CI/CD)
# ============================================
resource "aws_iam_role" "github_actions" {
  name = "${local.name_prefix}-github-actions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringLike = {
            "token.actions.githubusercontent.com:sub": "repo:it-connect-matrimony/*"
          }
        }
        Principal = {
          Federated = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

data "aws_caller_identity" "current" {}

resource "aws_iam_role_policy" "github_actions" {
  name = "${local.name_prefix}-github-actions-policy"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "eks:DescribeCluster",
          "eks:ListClusters",
          "eks:AccessKubernetesApi"
        ]
        Resource = module.eks.cluster_arn
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]
        Resource = [
          aws_ecr_repository.backend.arn,
          aws_ecr_repository.web.arn,
          aws_ecr_repository.admin.arn,
          aws_ecr_repository.mobile.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.backups.arn,
          "${aws_s3_bucket.backups.arn}/*"
        ]
      }
    ]
  })
}

# ============================================
# EKS Service Account with IAM Role
# ============================================
resource "aws_eks_access_entry" "backend" {
  cluster_name      = module.eks.cluster_name
  principal_arn     = aws_iam_role.backend_service_account.arn
  kubernetes_groups = ["backend"]
  type              = "STANDARD"
}

resource "aws_eks_access_policy_association" "backend" {
  cluster_name  = module.eks.cluster_name
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSViewPolicy"
  principal_arn = aws_iam_role.backend_service_account.arn
  access_scope {
    type = "namespace"
    namespaces = ["it-connect"]
  }
}
