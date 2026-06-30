# Docker Setup Guide

## Prerequisites

- Docker Engine 24+
- Docker Compose V2+

## Docker Images

The platform has four Docker images defined in `infrastructure/docker/`:

| Image | Dockerfile | Base Image | Exposed Port |
|-------|-----------|------------|-------------|
| `it-connect-backend` | `Dockerfile.backend` | `node:20-alpine` | 4000 |
| `it-connect-web` | `Dockerfile.web` | `node:20-alpine` | 3000 |
| `it-connect-admin` | `Dockerfile.admin` | `node:20-alpine` | 3001 |
| `nginx` | `nginx/Dockerfile` | `nginx:alpine` | 80, 443 |

## Dockerfile

### Backend (`infrastructure/docker/Dockerfile.backend`)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm ci
COPY . .
RUN npm run build:backend

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache tini curl
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./
EXPOSE 4000
USER node
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main"]
```

### Web (`infrastructure/docker/Dockerfile.web`)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY web/package.json ./web/
RUN npm ci
COPY . .
RUN npm run build:web

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/web/.next ./.next
COPY --from=builder /app/web/public ./public
COPY --from=builder /app/web/package.json ./
COPY --from=builder /app/web/node_modules ./node_modules
EXPOSE 3000
USER node
CMD ["npm", "run", "start"]
```

### Admin (`infrastructure/docker/Dockerfile.admin`)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY admin/package.json ./admin/
RUN npm ci
COPY . .
RUN npm run build --prefix admin

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/admin/.next ./.next
COPY --from=builder /app/admin/public ./public
COPY --from=builder /app/admin/package.json ./
COPY --from=builder /app/admin/node_modules ./node_modules
EXPOSE 3000
USER node
CMD ["npm", "run", "start"]
```

## Docker Compose (`infrastructure/docker/docker-compose.yml`)

### Services

| Service | Image | Depends On | Purpose |
|---------|-------|-----------|---------|
| `mysql` | `mysql:8.0` | - | Database |
| `redis` | `redis:7-alpine` | - | Cache & Queue |
| `elasticsearch` | `elasticsearch:8.11.0` | - | Search engine |
| `rabbitmq` | `rabbitmq:3-management` | - | Message broker |
| `backend` | Custom build | mysql, redis, elasticsearch, rabbitmq | API server |
| `web` | Custom build | backend | Next.js frontend |
| `admin` | Custom build | backend | Admin panel |
| `nginx` | Custom build | web, admin, backend | Reverse proxy |

## Quick Start

### Build and Run All Services

```bash
# Clone repository
git clone https://github.com/your-org/it-connect-matrimony.git
cd it-connect-matrimony

# Copy environment file
cp .env.example .env

# Build and start all services
docker compose -f infrastructure/docker/docker-compose.yml up -d --build

# Check service status
docker compose -f infrastructure/docker/docker-compose.yml ps

# View logs
docker compose -f infrastructure/docker/docker-compose.yml logs -f backend
```

### Stop Services

```bash
docker compose -f infrastructure/docker/docker-compose.yml down

# Remove volumes (WARNING: destroys data)
docker compose -f infrastructure/docker/docker-compose.yml down -v
```

### Run Individual Service

```bash
# Run only backend with its dependencies
docker compose -f infrastructure/docker/docker-compose.yml up -d mysql redis elasticsearch rabbitmq
docker compose -f infrastructure/docker/docker-compose.yml up -d backend

# Run only frontend
docker compose -f infrastructure/docker/docker-compose.yml up -d web
```

## Volumes

| Volume Name | Mount Point | Service | Purpose |
|-------------|-------------|---------|---------|
| `mysql-data` | `/var/lib/mysql` | mysql | Database persistence |
| `redis-data` | `/data` | redis | Cache persistence |
| `elasticsearch-data` | `/usr/share/elasticsearch/data` | elasticsearch | Search index persistence |
| `rabbitmq-data` | `/var/lib/rabbitmq` | rabbitmq | Queue persistence |
| `backend-uploads` | `/app/uploads` | backend | Uploaded files |
| `backend-logs` | `/app/logs` | backend | Application logs |
| `nginx-cache` | `/var/cache/nginx` | nginx | Cache |
| `nginx-logs` | `/var/log/nginx` | nginx | Access/error logs |

## Health Checks

All services include Docker health checks:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' it-connect-backend

# Wait for healthy
docker wait it-connect-mysql
```

## Networks

All services connect to `it-connect-network` (bridge driver):
```bash
# Inspect network
docker network inspect it-connect-network
```

## Logging

Default logging configuration:
```yaml
x-logging: &default-logging
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## Production Build

```bash
# Build optimized production images
docker compose -f infrastructure/docker/docker-compose.yml build --no-cache

# Push to ECR
docker tag it-connect-backend:latest $ECR_REGISTRY/backend:latest
docker push $ECR_REGISTRY/backend:latest
```
