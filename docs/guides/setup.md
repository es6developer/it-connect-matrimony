# Local Development Setup Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x+ | Runtime |
| npm | 10.x+ | Package manager |
| Docker Desktop | 24+ | Database services |
| Git | Latest | Version control |
| MySQL 8.0 CLI | 8.0+ | Database client (optional) |
| Redis CLI | 7.x+ | Cache client (optional) |
| NestJS CLI | Latest | Code scaffolding (`npm i -g @nestjs/cli`) |

## Clone & Install

```bash
# Clone repository
git clone https://github.com/your-org/it-connect-matrimony.git
cd it-connect-matrimony

# Install all workspace dependencies
npm install

# Verify installation
npm ls
```

## Database Setup

### Start Docker Services
```bash
# Start all backend services (MySQL, Redis, Elasticsearch, RabbitMQ)
docker compose -f infrastructure/docker/docker-compose.yml up -d mysql redis elasticsearch rabbitmq

# Verify services are healthy
docker compose -f infrastructure/docker/docker-compose.yml ps

# Expected output:
#   it-connect-mysql          healthy
#   it-connect-redis           healthy
#   it-connect-elasticsearch   healthy
#   it-connect-rabbitmq        healthy
```

### Initialize Database
```bash
# Option 1: Using the full schema SQL
mysql -h localhost -u root -prootpassword it_connect < database/schemas/complete-schema.sql

# Option 2: Using TypeORM migrations (preferred for development)
cp .env.example .env.development
cd backend
npm run migration:run
npm run seed              # Optional: seed sample data
```

## Environment Variables

### Backend (.env.development)
```bash
# Application
NODE_ENV=development
PORT=4000
API_PREFIX=api/v1
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
LOG_LEVEL=debug

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=rootpassword
DB_DATABASE=it_connect

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Elasticsearch
ELASTICSEARCH_HOST=http://localhost:9200
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=

# JWT
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_EXPIRY=15m
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
JWT_REFRESH_EXPIRY=7d

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# AWS S3 (optional for local dev - use local filesystem fallback)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=it-connect-matrimony-uploads

# Payment Gateways (sandbox keys)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Email (SendGrid or SMTP)
SENDGRID_API_KEY=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@itconnectmatrimony.com
SMTP_FROM_NAME=IT Connect Matrimony

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Push Notifications (Firebase)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# Error Tracking
SENTRY_DSN=
```

## Running Backend

```bash
cd backend

# Development mode (hot reload)
npm run start:dev

# Or with debugger
npm run start:debug

# Production build
npm run build
npm run start:prod
```

The backend runs at **http://localhost:4000**
API available at **http://localhost:4000/api/v1**
Swagger docs at **http://localhost:4000/api/v1/docs**

## Running Web Frontend

```bash
cd web

# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build
npm run start
```

The web frontend runs at **http://localhost:3000**

## Running Admin Panel

```bash
cd admin

# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build
npm run start
```

The admin panel runs at **http://localhost:3001**

## Running Mobile App (React Native)

```bash
cd mobile

# Install dependencies
npm install

# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## Running Tests

```bash
# All tests
npm test

# Backend tests
npm run test:backend

# Web tests
npm run test:web

# Specific test file
cd backend
npx jest test/unit/auth.service.spec.ts

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Load tests (requires k6)
npm run test:load

# Test with coverage
npm run test -- --coverage
```

## Useful Commands

```bash
# Lint code
npm run lint

# Format code
npm run format

# TypeScript type checking
npx tsc --noEmit

# Generate NestJS resource
cd backend
nest generate module resources/chat
nest generate service resources/chat
nest generate controller resources/chat

# Generate database migration
npm run migration:generate -- src/database/migrations/AddProfileFields

# Run pending migrations
npm run migration:run

# Seed database
npm run seed

# Docker management
npm run docker:up       # Start all Docker services
npm run docker:down     # Stop all Docker services
```

## Troubleshooting

### Docker port conflicts
```bash
# Check what's using ports
lsof -i :3306
lsof -i :6379
lsof -i :9200

# Change Docker port mapping in docker-compose.yml if needed
```

### MySQL connection refused
```bash
# Wait for MySQL to be ready
docker logs -f it-connect-mysql

# Verify MySQL is running
mysql -h localhost -u root -prootpassword -e "SELECT 1"
```

### Redis connection issues
```bash
docker logs it-connect-redis
redis-cli ping  # Should return "PONG"
```

### Elasticsearch memory issues
```bash
# Increase Docker memory limit in Docker Desktop settings
# Or reduce ES heap in docker-compose: ES_JAVA_OPTS=-Xms1g -Xmx1g
```

### Node modules issues
```bash
# Clean install
rm -rf node_modules
npm install

# Clear npm cache
npm cache clean --force
```
