# Production Launch Checklist

## Pre-Launch Verification

### Infrastructure
- [ ] **SSL certificates configured** - ACM certificate issued and auto-renewing
- [ ] **Domain and DNS configured** - Route53 records for main domain, www, api, admin, media
- [ ] **CDN configured** - CloudFront distribution active with S3 origin (OAC)
- [ ] **WAF configured** - Rate limiting, SQL injection, XSS rules active
- [ ] **DDoS protection** - AWS Shield Standard (or Advanced for prod)

### Database
- [ ] **Backup strategy verified** - Automated daily snapshots, 35-day retention
- [ ] **Point-in-time recovery tested** - Restored from backup to verify
- [ ] **Read replicas configured** - At least 2 read replicas for production
- [ ] **Connection pooling** - Max connections set appropriately
- [ ] **Slow query monitoring** - Slow query log enabled, threshold 2s
- [ ] **Database migrations tested** - `npm run migration:run` verified on staging
- [ ] **Rollback plan** - Migration revert tested

### Monitoring & Alerting
- [ ] **CloudWatch alarms configured** - CPU > 80%, Memory > 80%, 5xx > 5%
- [ ] **Log aggregation configured** - CloudWatch Logs with structured JSON logging
- [ ] **Error tracking (Sentry) configured** - DSN set, error grouping verified
- [ ] **Uptime monitoring** - External monitoring (Pingdom/StatusCake) configured
- [ ] **Alert notifications** - Slack webhook, PagerDuty, or email alerts configured
- [ ] **Dashboard created** - Grafana dashboard with key metrics
- [ ] **SLO/SLA defined** - 99.9% uptime target

### Security
- [ ] **Security audit completed** - Penetration testing results reviewed
- [ ] **Rate limiting configured** - Per endpoint and global limits active
- [ ] **CORS configured** - Only production domains allowed
- [ ] **Security headers verified** - Helmet.js active: HSTS, CSP, X-Frame-Options
- [ ] **OWASP top 10 mitigated** - All categories addressed
- [ ] **Secrets management** - AWS Secrets Manager, no secrets in code or env files
- [ ] **Dependency audit** - `npm audit` passed with 0 high/critical vulnerabilities

### Deployment
- [ ] **CI/CD pipeline verified** - Full pipeline runs to production
- [ ] **Rollback tested** - `kubectl rollout undo` verified
- [ ] **Auto-scaling configured** - HPA min/max replicas + node auto-scaling
- [ ] **Readiness probes** - HTTP health checks on `/api/v1/health`
- [ ] **Graceful shutdown** - SIGTERM handling verified
- [ ] **Canary deployment** - 10% → 100% traffic shift tested

### Performance
- [ ] **Load testing completed** - k6 test: 10k concurrent users, sustained for 30 min
- [ ] **Stress testing completed** - 2x expected peak load
- [ ] **Performance benchmarks met**:
  - API: p95 < 200ms (reads), p95 < 500ms (writes)
  - Search: p95 < 300ms
  - WebSocket: p95 < 100ms delivery
- [ ] **Caching verified** - Redis cache-aside pattern for profile reads
- [ ] **Database indexing verified** - All queries use indexes (EXPLAIN analyzed)
- [ ] **Bundle size optimized** - Frontend bundles < 300KB initial load

### Email Deliverability
- [ ] **SPF record configured** - DNS TXT record for sending domain
- [ ] **DKIM configured** - DomainKeys Identified Mail signature set up
- [ ] **DMARC configured** - Domain-based Message Authentication policy set
- [ ] **SMTP credentials verified** - SendGrid or SMTP relay working
- [ ] **Email templates tested** - Verification, password reset, notifications working
- [ ] **Bounce handling** - Hard bounce suppression list configured

### Payments
- [ ] **Payment gateway configured in production mode** - Razorpay/Stripe live keys
- [ ] **Webhook endpoints verified** - Payment events received and processed
- [ ] **Refund flow tested** - Full refund lifecycle verified
- [ ] **Subscription billing tested** - Recurring payments, prorated upgrades
- [ ] **Coupon system verified** - Code generation, validation, expiry
- [ ] **Invoice generation tested** - PDF invoice delivery

### Push Notifications
- [ ] **Firebase project configured** - FCM credentials uploaded
- [ ] **APNs configured** - Apple Push Notification service (for iOS)
- [ ] **Push notification flows tested** - Match, message, interest alerts
- [ ] **Device token management** - Registration, refresh, removal

### Privacy & Compliance
- [ ] **GDPR compliance verified** - Data export, deletion, consent flows tested
- [ ] **Privacy policy published** - Available on platform, linked in footer
- [ ] **Terms of service published** - Legal agreement accessible
- [ ] **Cookie consent** - Cookie banner implemented
- [ ] **Data retention policy enforced** - Automated cleanup jobs active
- [ ] **Disaster recovery plan tested** - Full DR exercise completed

### Documentation
- [ ] **API documentation** - Swagger UI accessible and accurate
- [ ] **Runbooks created** - Incident response, deployment, rollback procedures
- [ ] **Architecture documentation updated** - Current state documented
- [ ] **Onboarding guide** - New developer setup instructions

## Launch Day

### Pre-Launch (24 hours before)
- [ ] Final verification deployment to production
- [ ] Check all monitoring dashboards
- [ ] Verify backup ran successfully
- [ ] Verify SSL certificates are valid
- [ ] Notify stakeholders of launch timeline

### Launch Window
- [ ] Enable production traffic via DNS change
- [ ] Monitor CloudWatch dashboards closely
- [ ] Watch Sentry for new errors
- [ ] Manually test core user flows:
  - [ ] Registration → Email verification → Login
  - [ ] Profile creation → Photo upload
  - [ ] Search → Send interest → Accept → Chat
  - [ ] Subscription → Payment → Premium features
- [ ] Monitor error rates (goal: < 0.1% error rate)
- [ ] Monitor response times (goal: p95 < 200ms)

### Post-Launch (First 72 hours)
- [ ] Stay on-call for immediate issues
- [ ] Monitor database connection pool usage
- [ ] Watch for memory leaks
- [ ] Monitor auto-scaling events
- [ ] Check payment webhook processing
- [ ] Review all error logs daily
- [ ] Verify backup completion

## Post-Launch (First Month)

- [ ] Performance review - Compare actual vs target metrics
- [ ] Cost optimization review - Rightsizing infrastructure
- [ ] User feedback analysis - Feature requests and bugs
- [ ] Security review - Re-check OWASP compliance
- [ ] Database performance - Slow query optimization
- [ ] CDN cache hit ratio optimization
- [ ] SEO audit - Search engine indexing
