# Deployment Overview

## Environment Strategy

| Environment | Domain | Purpose | Infrastructure |
|-------------|--------|---------|---------------|
| **dev** | `dev.api.itconnectmatrimony.com` | Active development | Shared k8s namespace, scaled-down RDS |
| **staging** | `staging.api.itconnectmatrimony.com` | QA, integration testing | Full stack, smaller instances |
| **prod** | `api.itconnectmatrimony.com` | Production | Multi-AZ, auto-scaling, full redundancy |

### Configuration Management
- Environment-specific `.env` files: `.env.development`, `.env.staging`, `.env.production`
- Secrets stored in AWS Secrets Manager, not in environment variables
- Terraform workspaces for infrastructure state isolation

## Deployment Workflow

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│  Developer │───▶│   GitHub   │───▶│  CI/CD     │───▶│  Staging   │
│  Commits   │    │   Push     │    │  Pipeline  │    │  Deploy    │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
                                          │
                                          ▼
                                    ┌────────────┐
                                    │  Manual    │
                                    │  Approval  │
                                    └────────────┘
                                          │
                                          ▼
                                    ┌────────────┐
                                    │ Production │
                                    │  Deploy    │
                                    └────────────┘
```

### Deployment Steps
1. Developer creates PR with changes
2. CI runs lint, type check, unit tests, integration tests
3. PR merged to `main` branch
4. CI/CD pipeline triggers:
   - Build Docker images
   - Push to ECR
   - Deploy to staging
   - Run E2E tests on staging
   - Manual approval gate for production
   - Canary deploy to production (10% traffic → 50% → 100%)
   - Smoke tests on production

## CI/CD Pipeline Overview

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Type check
        run: npx tsc --noEmit
      - name: Unit tests
        run: npm run test
      - name: Integration tests
        run: npm run test:integration

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      - name: Build and push backend
        run: |
          docker build -f infrastructure/docker/Dockerfile.backend \
            -t $ECR_REGISTRY/backend:${{ github.sha }} .
          docker push $ECR_REGISTRY/backend:${{ github.sha }}
      - name: Build and push web
        run: |
          docker build -f infrastructure/docker/Dockerfile.web \
            -t $ECR_REGISTRY/web:${{ github.sha }} .
          docker push $ECR_REGISTRY/web:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to staging
        run: |
          kubectl set image deployment/backend \
            backend=$ECR_REGISTRY/backend:${{ github.sha }}
          kubectl set image deployment/web \
            web=$ECR_REGISTRY/web:${{ github.sha }}

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production (canary)
        run: ./infrastructure/scripts/deploy.sh
```

## Rollback Strategy

### Automated Rollback Triggers
- **Health check failure**: >20% of pods unhealthy for >30s
- **Error rate spike**: >5% 5xx errors in 5-minute window
- **Latency degradation**: p95 latency >1s for read endpoints
- **E2E test failure**: Post-deployment smoke tests fail

### Rollback Steps
```bash
# Rollback Kubernetes deployment to previous version
kubectl rollout undo deployment/backend -n it-connect
kubectl rollout undo deployment/web -n it-connect
kubectl rollout undo deployment/admin -n it-connect

# Verify rollback
kubectl rollout status deployment/backend -n it-connect

# Rollback database migration (if applicable)
npm run migration:revert
```

### Rollback Types
| Type | Time | Method |
|------|------|--------|
| **Kubernetes** | < 2 min | `kubectl rollout undo` |
| **Database** | < 10 min | Migration revert |
| **Full infra** | < 30 min | Terraform rollback |
