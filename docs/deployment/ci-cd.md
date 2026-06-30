# CI/CD Pipeline Guide

## Overview

The CI/CD pipeline is implemented using GitHub Actions and automates the process of testing, building, and deploying the IT Connect Matrimony platform.

## Pipeline Stages

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│   Code   │──▶│   Test   │──▶│  Build   │──▶│  Deploy  │──▶|  Verify  │
│   Push   │   │          │   │  Docker  │   │  Staging │   │  Smoke   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                              │
                                                     (Manual Approval)
                                                              │
                                                              ▼
                                                    ┌──────────┐   ┌──────────┐
                                                    │  Deploy  │──▶│  Verify  │
                                                    │  Canary  │   │  Prod    │
                                                    └──────────┘   └──────────┘
```

## GitHub Actions Workflow

### File: `.github/workflows/deploy.yml`

```yaml
name: Deploy IT Connect Matrimony

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: ap-south-1
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.ap-south-1.amazonaws.com
  K8S_NAMESPACE: it-connect

jobs:
  # ============== TEST ==============
  test-backend:
    name: Test Backend
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: testpassword
          MYSQL_DATABASE: it_connect_test
        ports:
          - 3306:3306
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint:backend
      - run: npx tsc --noEmit -p backend/tsconfig.json
      - run: npm run test:backend
        env:
          DB_HOST: localhost
          DB_PORT: 3306
          DB_USERNAME: root
          DB_PASSWORD: testpassword
          DB_DATABASE: it_connect_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          JWT_SECRET: test-jwt-secret
          JWT_REFRESH_SECRET: test-refresh-secret

  test-web:
    name: Test Web Frontend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint:web
      - run: npm run test:web
        env:
          NEXT_PUBLIC_API_URL: http://localhost:4000/api/v1

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'
      - name: Run npm audit
        run: npm audit --audit-level=high

  # ============== BUILD ==============
  build-and-push:
    name: Build & Push Docker Images
    needs: [test-backend, test-web, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      - name: Login to Amazon ECR
        uses: aws-actions/amazon-ecr-login@v2
      - name: Build and tag backend image
        run: |
          docker build -f infrastructure/docker/Dockerfile.backend \
            -t $ECR_REGISTRY/backend:${{ github.sha }} \
            -t $ECR_REGISTRY/backend:latest .
      - name: Build and tag web image
        run: |
          docker build -f infrastructure/docker/Dockerfile.web \
            -t $ECR_REGISTRY/web:${{ github.sha }} \
            -t $ECR_REGISTRY/web:latest .
      - name: Build and tag admin image
        run: |
          docker build -f infrastructure/docker/Dockerfile.admin \
            -t $ECR_REGISTRY/admin:${{ github.sha }} \
            -t $ECR_REGISTRY/admin:latest .
      - name: Push images to ECR
        run: |
          docker push -a $ECR_REGISTRY/backend
          docker push -a $ECR_REGISTRY/web
          docker push -a $ECR_REGISTRY/admin

  # ============== DEPLOY STAGING ==============
  deploy-staging:
    name: Deploy to Staging
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --region $AWS_REGION \
            --name it-connect-matrimony-staging-cluster
      - name: Deploy backend
        run: |
          kubectl set image deployment/backend \
            backend=$ECR_REGISTRY/backend:${{ github.sha }} \
            -n $K8S_NAMESPACE
      - name: Deploy web
        run: |
          kubectl set image deployment/web \
            web=$ECR_REGISTRY/web:${{ github.sha }} \
            -n $K8S_NAMESPACE
      - name: Deploy admin
        run: |
          kubectl set image deployment/admin \
            admin=$ECR_REGISTRY/admin:${{ github.sha }} \
            -n $K8S_NAMESPACE
      - name: Verify deployment
        run: |
          kubectl rollout status deployment/backend -n $K8S_NAMESPACE --timeout=5m
          kubectl rollout status deployment/web -n $K8S_NAMESPACE --timeout=5m
          kubectl rollout status deployment/admin -n $K8S_NAMESPACE --timeout=5m
      - name: Run smoke tests
        run: |
          curl -f https://staging.api.itconnectmatrimony.com/api/v1/health
          curl -f https://staging.itconnectmatrimony.com

  # ============== DEPLOY PRODUCTION ==============
  deploy-production:
    name: Deploy to Production
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://itconnectmatrimony.com
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --region $AWS_REGION \
            --name it-connect-matrimony-prod-cluster
      - name: Canary deploy backend (10%)
        run: |
          kubectl set image deployment/backend-canary \
            backend=$ECR_REGISTRY/backend:${{ github.sha }} \
            -n $K8S_NAMESPACE
      - name: Wait 5 minutes
        run: sleep 300
      - name: Promote to full backend rollout
        run: |
          kubectl set image deployment/backend \
            backend=$ECR_REGISTRY/backend:${{ github.sha }} \
            -n $K8S_NAMESPACE
      - name: Deploy web
        run: |
          kubectl set image deployment/web \
            web=$ECR_REGISTRY/web:${{ github.sha }} \
            -n $K8S_NAMESPACE
      - name: Deploy admin
        run: |
          kubectl set image deployment/admin \
            admin=$ECR_REGISTRY/admin:${{ github.sha }} \
            -n $K8S_NAMESPACE
      - name: Run database migrations
        run: |
          kubectl exec deployment/backend -n $K8S_NAMESPACE -- \
            npm run migration:run
      - name: Verify production deployment
        run: |
          kubectl rollout status deployment/backend -n $K8S_NAMESPACE --timeout=10m
          kubectl rollout status deployment/web -n $K8S_NAMESPACE --timeout=5m
      - name: Post-deploy smoke tests
        run: |
          ./infrastructure/scripts/smoke-test.sh
      - name: Report deployment
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Deployment to production ${{ job.status }}: ${{ github.sha }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## GitHub Environments

### Staging
- **Required reviewers**: None
- **Wait timer**: None
- **Deployment branch**: main

### Production
- **Required reviewers**: 1 (senior dev or lead)
- **Wait timer**: 5 minutes
- **Deployment branch**: main
- **Secrets**: AWS prod credentials, prod env vars

## Repository Secrets Required

| Secret Name | Description |
|-------------|-------------|
| `AWS_ACCOUNT_ID` | AWS Account ID for ECR |
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `SLACK_WEBHOOK_URL` | Slack channel webhook for notifications |

## Local CI Simulation

```bash
# Run same checks locally as CI would
npm run lint
npx tsc --noEmit
npm run test
npm run test:integration
npm run audit
```

## Deployment Script (`infrastructure/scripts/deploy.sh`)

```bash
#!/bin/bash
set -euo pipefail

ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}

echo "Deploying ${ENVIRONMENT} with tag ${IMAGE_TAG}"

# Update deployments
for service in backend web admin; do
  kubectl set image deployment/${service} \
    ${service}=${ECR_REGISTRY}/${service}:${IMAGE_TAG} \
    -n it-connect
done

# Run migrations (backend only)
kubectl exec deployment/backend -n it-connect -- npm run migration:run

# Wait for rollout
for service in backend web admin; do
  kubectl rollout status deployment/${service} -n it-connect --timeout=5m
done

# Run smoke tests
curl -sf https://${ENVIRONMENT}.api.itconnectmatrimony.com/api/v1/health
echo "Deployment to ${ENVIRONMENT} completed successfully"
```
