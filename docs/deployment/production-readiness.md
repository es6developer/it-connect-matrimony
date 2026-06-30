# Production Readiness Guide

## Performance Benchmarks

### API Performance Targets

| Endpoint Type | p50 | p95 | p99 | Throughput |
|--------------|-----|-----|-----|-----------|
| Auth (register, login) | < 200ms | < 500ms | < 1000ms | 100 req/s |
| Profile reads (cached) | < 10ms | < 50ms | < 100ms | 1000 req/s |
| Profile reads (uncached) | < 50ms | < 200ms | < 500ms | 500 req/s |
| Profile writes | < 100ms | < 300ms | < 500ms | 100 req/s |
| Search (Elasticsearch) | < 50ms | < 300ms | < 500ms | 200 req/s |
| Interest actions | < 100ms | < 300ms | < 500ms | 50 req/s |
| Chat message send | < 50ms | < 100ms | < 200ms | 500 req/s |
| Chat message history | < 50ms | < 200ms | < 300ms | 200 req/s |
| Payment create | < 200ms | < 500ms | < 1000ms | 20 req/s |
| Payment verify | < 100ms | < 300ms | < 500ms | 50 req/s |
| Notification fetch | < 50ms | < 200ms | < 300ms | 300 req/s |
| Admin dashboard | < 500ms | < 2000ms | < 5000ms | 5 req/s |

### WebSocket Performance

| Metric | Target |
|--------|--------|
| Concurrent connections | 50,000 |
| Connection time | < 500ms |
| Message delivery latency (p95) | < 100ms |
| Message throughput | 10,000 msg/s |
| Reconnection time | < 2s |

### Database Performance

| Metric | Target | Measurement |
|--------|--------|------------|
| MySQL connections | < 200 active | SHOW STATUS LIKE 'Threads_connected' |
| Query latency (p95) | < 50ms | Performance Insights / slow_query_log |
| Replica lag | < 5s | SHOW SLAVE STATUS |
| Redis cache hit ratio | > 80% | INFO stats: keyspace_hits / (keyspace_hits + keyspace_misses) |
| Elasticsearch query latency | < 100ms p95 | Search endpoints monitoring |

### Frontend Performance

| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.5s |
| First Input Delay (FID) | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Time to Interactive (TTI) | < 3.5s |
| Bundle size (initial JS) | < 300KB |
| Lighthouse score | > 90 |

## Scalability Targets

### Vertical Scaling Limits (Single Instance)

| Component | Single Instance Limit | Bottleneck |
|-----------|----------------------|------------|
| NestJS API | 5,000 req/s | Node.js event loop |
| MySQL | 500 concurrent connections | Connection pool, CPU |
| Redis | 100,000 ops/s | Single-threaded CPU |
| Elasticsearch | 5,000 qps/node | CPU, I/O |
| WebSocket | 10,000 concurrent | Memory, FD limits |

### Horizontal Scaling

| Component | Scaling Strategy | Max Instances |
|-----------|-----------------|---------------|
| Backend API | HPA (CPU > 70%, Memory > 80%) | 20 pods |
| Web Frontend | HPA (CPU > 70%) | 10 pods |
| Admin Panel | HPA (CPU > 70%) | 5 pods |
| MySQL | Read replicas (up to 5) | 1 primary + 5 replicas |
| Redis | Cluster mode with replicas | 3 shards + 3 replicas |
| Elasticsearch | Add data nodes | 10 data nodes + 3 masters |
| BullMQ Workers | Increase concurrency | 10 per queue |

### Capacity for 1M Users

| Metric | Value |
|--------|-------|
| Total registered users | 1,000,000 |
| Daily active users (DAU) | 100,000 (10%) |
| Monthly active users (MAU) | 300,000 (30%) |
| Concurrent online users | 15,000 |
| API requests per day | ~10M |
| Peak requests per second | ~500 |
| Messages per day | ~500,000 |
| Interests per day | ~50,000 |
| New matches per day | ~10,000 |
| Search queries per day | ~200,000 |
| Database size | ~200GB |
| Media storage | ~5TB (S3) |
| Daily data growth | ~2GB |

## Monitoring Dashboards

### Grafana Dashboard Metrics

#### Backend Performance Panel
```
┌─────────────────────────────────────────────────────────────────┐
│  Backend API Performance                                         │
├─────────────────────────────────────────────────────────────────┤
│  Request Rate: 245 req/s  │  Error Rate: 0.3% │ P95: 185ms    │
│  Active Requests: 1,234   │  5xx: 12/min      │ P99: 450ms    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─── Request Rate ───────────────────────────────────────┐     │
│  │  ██████████████████████████████████▁▁▁▁▁▁▁▁▁▁▁▁       │     │
│  └────────────────────────────────────────────────────────┘     │
│  ┌─── Response Time (p95) ───────────────────────────────┐     │
│  │  ████████████████▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁      │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

#### Endpoint-Specific Panels
- Auth endpoints (success rate, latency)
- Search endpoints (query volume, latency)
- Chat endpoints (message volume, delivery latency)
- Payment endpoints (success rate, revenue)
- WebSocket endpoints (connections, messages/s)

#### Infrastructure Panel
```
┌─────────────────────────────────────────────────────────────────┐
│  Infrastructure                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Pods: 12/20 running │ CPU: 62% │ Memory: 71% │ Disk: 45%     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─── EKS Node CPU ───────────────────────────────────────┐     │
│  │  ██████████████████████████████████▁▁▁▁▁▁▁▁▁▁▁▁▁       │     │
│  └────────────────────────────────────────────────────────┘     │
│  ┌─── EKS Node Memory ────────────────────────────────────┐     │
│  │  ████████████████████████████████████████▁▁▁▁▁▁▁▁▁     │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

#### Database Panel
- MySQL: connections, query latency (p95), replica lag, slow queries
- Redis: hit rate, memory usage, ops/s, connected clients
- Elasticsearch: query latency, indexing rate, shard health

#### Business Metrics Panel
- New registrations (daily, weekly, monthly)
- Active users (DAU, WAU, MAU)
- Total matches, interests sent
- Revenue (MRR, ARPU)
- Subscription conversion rate
- Churn rate

### CloudWatch Alarms

| Alarm | Metric | Threshold | Action |
|-------|--------|-----------|--------|
| High Error Rate | 5xx count | > 5% in 5 min | PagerDuty critical |
| High Latency | p95 response time | > 1s for 5 min | PagerDuty high |
| High CPU | EKS node CPU | > 80% for 10 min | Auto-scaling trigger |
| High Memory | EKS node memory | > 85% for 10 min | Auto-scaling trigger |
| Database CPU | RDS CPU | > 80% for 5 min | PagerDuty high |
| Database Storage | RDS free storage | < 10GB | PagerDuty warning |
| Replica Lag | RDS replica lag | > 30s | PagerDuty warning |
| Redis Memory | ElastiCache memory | > 80% | PagerDuty warning |
| Certificate Expiry | ACM days to expiry | < 30 days | Email notification |
| Disk Usage | EBS volume usage | > 80% | PagerDuty warning |

## Incident Response Plan

### Severity Levels

| Level | Definition | Response Time | Example |
|-------|-----------|---------------|---------|
| **P0** | Complete platform outage or data loss | < 15 min | Database down, S3 inaccessible |
| **P1** | Major feature unavailable, degraded performance | < 30 min | Login broken, payment failures |
| **P2** | Partial feature degradation | < 2 hours | Search slow, notifications delayed |
| **P3** | Minor bug, cosmetic issue | < 24 hours | Profile image alignment, typo |
| **P4** | Feature request, non-critical | Next sprint | Enhancement, new filter option |

### Incident Response Process

```
1. DETECTION
   ├── Automated (CloudWatch alarm, Sentry alert)
   └── Manual (user report, team member observation)

2. TRIAGE (within 5 min)
   ├── Determine severity level
   ├── Assign incident commander
   └── Create incident channel (#incident-xxx in Slack)

3. MITIGATION (within target response time)
   ├── Rollback recent deployment if applicable
   ├── Scale up resources if capacity issue
   ├── Enable maintenance mode if needed
   └── Redirect traffic if regional issue

4. RESOLUTION
   ├── Apply permanent fix
   ├── Verify fix in staging
   └── Deploy to production

5. POST-MORTEM (within 48 hours)
   ├── Timeline of events
   ├── Root cause analysis
   ├── Action items to prevent recurrence
   └── Share with team
```

### Incident Communication

```yaml
P0/P1 Incidents:
  - Slack: #incidents channel (immediate)
  - Email: Leadership team (within 30 min)
  - Status page: Update public status page (within 15 min)
  - Users: In-app notification if widespread

P2 Incidents:
  - Slack: #incidents channel
  - Email: Development team standup

P3/P4 Incidents:
  - Jira ticket (next sprint planning)
```

## Backup and Disaster Recovery

### Backup Schedule

| Component | Frequency | Type | Retention | Automated? |
|-----------|-----------|------|-----------|------------|
| MySQL (RDS) | Daily | Automated snapshot | 35 days | Yes |
| MySQL (binlog) | Continuous | Binary logs | 24 hours | Yes |
| MySQL (logical) | Daily | mysqldump to S3 | 7 days | Yes |
| Redis | Every 6 hours | RDB snapshot | 7 days | Yes |
| Elasticsearch | Daily | Snapshot to S3 | 30 days | Yes |
| S3 Media | - | Cross-region replication | 90 days (versions) | Yes |
| Kubernetes manifests | On change | Git (IaC) | Infinite | Yes |
| Terraform state | On change | S3 backend | Infinite | Yes |

### Disaster Recovery Scenarios

#### Scenario 1: Single AZ Failure (Most Likely)
```
Impact: 1 of 3 AZs unavailable
RTO: < 5 min
RPO: < 1 sec
Action: Multi-AZ auto-failover handles this automatically
- EKS reschedules pods to healthy AZs
- RDS Multi-AZ failover
- ElastiCache failover to replica
- Load balancer routes to healthy AZs
```

#### Scenario 2: Complete Region Failure (Rare)
```
Impact: Entire AWS region unavailable
RTO: < 1 hour
RPO: < 15 min
Action: Cross-region DR
- Promote cross-region RDS read replica to primary
- Update Route53 DNS to failover region
- Deploy EKS cluster in DR region via Terraform
- Restore latest DB snapshot
- Verify data integrity
```

#### Scenario 3: Data Corruption
```
Impact: Corrupted database tables
RTO: < 4 hours
RPO: < 24 hours (snapshot) / < 5 min (PITR)
Action: Point-in-time recovery
- Identify corruption timestamp
- Restore RDS to point before corruption
- Verify data integrity
- Update DNS to restored instance
- Recover any lost data from logical backups
```

#### Scenario 4: Accidental Data Deletion
```
Impact: User or admin deleted critical data
RTO: < 2 hours
RPO: < 5 min
Action:
- If soft-delete: Restore from trash (90-day window)
- If permanent: Restore from backup
- Restore individual tables if possible
- Use PITR for precise recovery
```

### DR Testing Schedule

| Test Type | Frequency | Scope |
|-----------|-----------|-------|
| Backup restoration | Monthly | Restore snapshot to staging, verify |
| Read replica promotion | Quarterly | Promote replica, verify functionality |
| Full DR exercise | Bi-annually | Simulate region failover |
| PITR test | Monthly | Restore to specific timestamp |

## Cost Estimation (1M Users)

### Monthly Infrastructure Costs

| Service | Configuration | Monthly Cost (est.) |
|---------|--------------|-------------------|
| **Compute (EKS)** | 10 x r6i.large nodes | $3,500 |
| **Database (RDS)** | db.r6g.large Multi-AZ + 2 replicas | $1,200 |
| **Cache (ElastiCache)** | cache.r6g.large cluster (2 nodes) | $400 |
| **Search (OpenSearch)** | 3 x r6g.large.search data + 3 t3.small master | $800 |
| **Storage (S3)** | 5TB media + 500GB logs + 500GB backups | $150 |
| **CDN (CloudFront)** | ~50TB transfer (images, media) | $2,500 |
| **NAT Gateway** | 3 AZs | $100 |
| **Load Balancer** | ALB | $50 |
| **Monitoring** | CloudWatch + Grafana | $200 |
| **Sentry** | Team plan | $100 |
| **Email (SendGrid)** | 500K emails/month | $50 |
| **SMS (Twilio)** | 100K SMS/month | $500 |
| **Push (Firebase)** | Free tier | $0 |
| **Total Infrastructure** | | **~$9,550/mo** |

### Third-Party Service Costs

| Service | Usage | Monthly Cost |
|---------|-------|-------------|
| Razorpay/Stripe | 2% + ₹2 per transaction | ~₹50,000 ($600) at ₹25L revenue |
| Google OAuth | Free | $0 |
| LinkedIn OAuth | Free | $0 |
| Docker Hub | Team plan | $0 (using ECR) |
| GitHub | Team plan | $0 (included) |

### Annual Cost: ~$120,000 (infrastructure) + variable transaction fees

### Cost Optimization Strategies

| Strategy | Estimated Savings |
|----------|------------------|
| Use Spot Instances for non-critical nodes | ~60% on compute (save $2,000/mo) |
| S3 lifecycle: transition old media to Standard-IA | ~40% on storage (save $60/mo) |
| CloudFront price class: limit to India/Asia | ~50% on data transfer (save $1,250/mo) |
| RDS reserved instances (1-year) | ~30% on RDS (save $360/mo) |
| Auto-scaling: scale down at night | ~20% on compute (save $700/mo) |
| Cache static API responses aggressively | Reduce backend CPU, fewer pods |

**Optimized Monthly Cost Target**: ~$6,000 - $7,000/mo
