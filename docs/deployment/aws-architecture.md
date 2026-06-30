# AWS Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud                                      │
│                                                                             │
│  ┌──────────────────────────── VPC (10.0.0.0/16) ───────────────────────┐  │
│  │                                                                       │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │  │
│  │  │    AZ: ap-s-1a   │  │    AZ: ap-s-1b  │  │    AZ: ap-s-1c  │       │  │
│  │  │                  │  │                  │  │                  │       │  │
│  │  │  ┌───────────┐   │  │  ┌───────────┐   │  │  ┌───────────┐   │       │  │
│  │  │  │ Public    │   │  │  │ Public    │   │  │  │ Public    │   │       │  │
│  │  │  │ Subnet    │   │  │  │ Subnet    │   │  │  │ Subnet    │   │       │  │
│  │  │  │ 10.0.1.0/24│  │  │  │ 10.0.2.0/24│  │  │  │ 10.0.3.0/24│  │       │  │
│  │  │  │           │   │  │  │           │   │  │  │           │   │       │  │
│  │  │  │ NAT GW  │   │  │  │ NAT GW  │   │  │  │ NAT GW  │   │       │  │
│  │  │  │ ALB     │   │  │  │ ALB     │   │  │  │ ALB     │   │       │  │
│  │  │  └───────────┘   │  │  └───────────┘   │  │  └───────────┘   │       │  │
│  │  │                  │  │                  │  │                  │       │  │
│  │  │  ┌───────────┐   │  │  ┌───────────┐   │  │  ┌───────────┐   │       │  │
│  │  │  │ Private   │   │  │  │ Private   │   │  │  │ Private   │   │       │  │
│  │  │  │ Subnet    │   │  │  │ Subnet    │   │  │  │ Subnet    │   │       │  │
│  │  │  │ 10.0.10.0/24│  │  │  │10.0.20.0/24│  │  │  │10.0.30.0/24│  │       │  │
│  │  │  │           │   │  │  │           │   │  │  │           │   │       │  │
│  │  │  │ EKS Nodes│   │  │  │ EKS Nodes│   │  │  │ EKS Nodes│   │       │  │
│  │  │  │ Backend  │   │  │  │ Backend  │   │  │  │ Backend  │   │       │  │
│  │  │  │ Web/Admin│   │  │  │ Web/Admin│   │  │  │ Web/Admin│   │       │  │
│  │  │  └───────────┘   │  │  └───────────┘   │  │  └───────────┘   │       │  │
│  │  │                  │  │                  │  │                  │       │  │
│  │  │  ┌───────────┐   │  │  ┌───────────┐   │  │  ┌───────────┐   │       │  │
│  │  │  │ Database  │   │  │  │ Database  │   │  │  │ Database  │   │       │  │
│  │  │  │ Subnet    │   │  │  │ Subnet    │   │  │  │ Subnet    │   │       │  │
│  │  │  │10.0.100.0/24│  │  │  │10.0.200.0/24│  │  │  │10.0.300.0/24│       │  │
│  │  │  │           │   │  │  │           │   │  │  │           │   │       │  │
│  │  │  │ RDS       │   │  │  │ RDS       │   │  │  │ RDS       │   │       │  │
│  │  │  │ (Primary) │   │  │  │ (Standby) │   │  │  │ (Read     │   │       │  │
│  │  │  │           │   │  │  │           │   │  │  │  Replica) │   │       │  │
│  │  │  │ ElastiCache│  │  │  │ ElastiCache│  │  │  │ ElastiCache│  │       │  │
│  │  │  │ (Primary) │   │  │  │ (Replica) │   │  │  │ (Replica) │   │       │  │
│  │  │  └───────────┘   │  │  └───────────┘   │  │  └───────────┘   │       │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘       │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                      Global Services                                     │  │
│  │                                                                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │  Route 53    │  │  CloudFront  │  │     WAF      │  │     ACM      │ │  │
│  │  │  (DNS)       │  │  (CDN)       │  │  (Firewall)  │  │  (SSL/TLS)   │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │  │
│  │                                                                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                    │  │
│  │  │   S3 Media   │  │  S3 Logs     │  │  S3 Backups  │                    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                    │  │
│  │                                                                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                    │  │
│  │  │  CloudWatch  │  │  AWS Sentry  │  │  ECR         │                    │  │
│  │  │  (Monitoring)│  │  (Errors)    │  │  (Images)    │                    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                    │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## VPC Configuration

| Component | Value |
|-----------|-------|
| **VPC CIDR** | `10.0.0.0/16` |
| **Availability Zones** | 3 (`ap-south-1a`, `ap-south-1b`, `ap-south-1c`) |
| **Public Subnets** | `10.0.1.0/24`, `10.0.2.0/24`, `10.0.3.0/24` |
| **Private Subnets** | `10.0.10.0/24`, `10.0.20.0/24`, `10.0.30.0/24` |
| **Database Subnets** | `10.0.100.0/24`, `10.0.200.0/24`, `10.0.300.0/24` |
| **NAT Gateways** | 1 per AZ (prod) / 1 shared (non-prod) |
| **VPC Endpoints** | S3 Gateway Endpoint, DynamoDB Gateway Endpoint |

## EKS Cluster

| Component | Configuration |
|-----------|--------------|
| **Cluster Version** | 1.28+ |
| **Node Groups** | 2-10 nodes (auto-scaling) |
| **Instance Types** | `t3.large`, `c6i.large` (compute), `r6i.large` (memory) |
| **Disk Size** | 100GB gp3 |
| **Capacity Type** | On-Demand |
| **Cluster Endpoint** | Private (prod), Public + Private (non-prod) |
| **Encryption** | Secrets encryption with KMS |

### Resource Requests/Limits
```yaml
# Backend
resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    cpu: 2000m
    memory: 2Gi

# Web/Admin (Next.js)
resources:
  requests:
    cpu: 250m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 1Gi
```

## RDS MySQL

| Component | Value |
|-----------|-------|
| **Engine** | MySQL 8.0.35 |
| **Instance Class** | `db.r6g.large` (prod) / `db.t3.medium` (dev) |
| **Storage** | 100GB gp3, auto-scaling to 500GB |
| **Multi-AZ** | Enabled (prod) |
| **Read Replicas** | Up to 5 (for read-heavy workloads) |
| **Backup Retention** | 35 days |
| **Deletion Protection** | Enabled (prod) |
| **Performance Insights** | Enabled (7 days retention) |
| **Enhanced Monitoring** | Enabled (60s interval) |

## ElastiCache Redis

| Component | Value |
|-----------|-------|
| **Engine** | Redis 7.1 |
| **Node Type** | `cache.r6g.large` (prod) / `cache.t3.medium` (dev) |
| **Shards** | 1 (with replicas) |
| **Replicas per Shard** | 1 (2 for prod) |
| **Multi-AZ** | Enabled (prod) |
| **Auto-failover** | Enabled |
| **Encryption** | At-rest (KMS) + In-transit (TLS) |
| **Snapshot Retention** | 7 days |

## OpenSearch (Elasticsearch)

| Component | Value |
|-----------|-------|
| **Engine** | OpenSearch 2.11 |
| **Instance Type** | `r6g.large.search` |
| **Instance Count** | 3 (prod) / 1 (dev) |
| **Dedicated Master** | 3 `t3.small.search` (prod) |
| **EBS Volume** | 100GB gp3 per node |
| **Encryption** | At-rest + Node-to-node |
| **Advanced Security** | Internal user database |

## S3 Storage

| Bucket | Purpose | Versioning | Public Access |
|--------|---------|------------|---------------|
| `it-connect-media-{env}` | User photos, videos, chat files | Enabled | Blocked (CloudFront OAC) |
| `it-connect-logs-{env}` | Application logs, CloudFront logs | Enabled | Blocked |
| `it-connect-backups-{env}` | Database backups, config backups | Enabled | Blocked |

## CloudFront CDN

| Configuration | Value |
|--------------|-------|
| **Origins** | S3 media bucket (via OAC) |
| **Default TTL** | 24 hours |
| **Max TTL** | 365 days |
| **Price Class** | PriceClass_All (or PriceClass_100 for India-only) |
| **SSL** | Custom SSL via ACM |
| **HTTP Version** | HTTP/2 + HTTP/3 |
| **WAF** | AWS WAF with rate limiting + SQL injection protection |

## Route53 DNS

| Record Type | Name | Target |
|-------------|------|--------|
| A | `itconnectmatrimony.com` | CloudFront / ALB |
| A | `www.itconnectmatrimony.com` | CloudFront / ALB |
| A | `api.itconnectmatrimony.com` | ALB |
| A | `admin.itconnectmatrimony.com` | ALB |
| A | `media.itconnectmatrimony.com` | CloudFront |

## WAF Configuration

- Rate-based rules: 2000 requests per 5 minutes per IP
- SQL injection prevention
- Cross-site scripting prevention
- IP reputation lists (AWSManagedRules)
- Common rule set (OWASP top 10)
- Allow-listed IPs for admin access

## Auto-Scaling

| Resource | Metric | Scale Out | Scale In |
|----------|--------|-----------|----------|
| EKS Node Group | CPU | > 70% for 3 min | < 30% for 10 min |
| Backend HPA | CPU | > 70% | < 40% |
| Backend HPA | Memory | > 80% | < 50% |
| Web HPA | CPU | > 70% | < 40% |
| RDS Storage | Free Storage | - | > 80% triggers alert |
| ElastiCache | CPU | > 75% for 5 min | < 30% for 15 min |

## Cost Optimization (for 1M users)

| Service | Monthly Est. | Optimization |
|---------|-------------|--------------|
| EKS (10x r6i.large) | ~$3,000 | Spot instances for non-critical, right-sizing |
| RDS (r6g.large Multi-AZ) | ~$500 | Read replicas only during peak |
| ElastiCache (r6g.large) | ~$300 | Cluster mode for higher throughput |
| OpenSearch (3x r6g.large) | ~$600 | Dedicated master only needed >5 nodes |
| S3 (100TB) | ~$2,300 | Lifecycle policies, IA tier |
| CloudFront (100TB) | ~$2,000 | Price class optimization |
| NAT Gateway (3x) | ~$100 | Single NAT for non-prod |
| Total | ~$8,800/mo | |
