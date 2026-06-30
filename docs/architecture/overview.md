# System Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Clients                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐              │
│  │ Web App  │  │ Admin    │  │ Mobile   │  │ 3rd-Party    │              │
│  │ (Next.js)│  │ (Next.js)│  │ (React   │  │ Integrations │              │
│  │ :3000    │  │ :3001    │  │  Native) │  │              │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘              │
│       │             │             │                │                      │
├───────┴─────────────┴─────────────┴────────────────┴──────────────────────┤
│                          CDN (CloudFront)                                  │
│                          WAF (Web Application Firewall)                    │
├────────────────────────────────────────────────────────────────────────────┤
│                         API Gateway (Nginx/ALB)                            │
│                    ┌──────────────────────────────┐                       │
│                    │     Rate Limiting / Auth     │                       │
│                    └─────────────┬────────────────┘                       │
├──────────────────────────────────┼─────────────────────────────────────────┤
│                    ┌─────────────┴────────────────┐                       │
│                    │    REST API (NestJS)         │                       │
│                    │    WebSocket (Socket.IO)     │                       │
│                    └─────────────┬────────────────┘                       │
├──────────────────────────────────┼─────────────────────────────────────────┤
│                    ┌─────────────┴────────────────┐                       │
│                    │      Microservices Layer     │                       │
│  ┌───────┐ ┌──────┐ ┌────────┐ ┌───────────┐ ┌──┴────┐ ┌────────┐       │
│  │ Auth  │ │User  │ │Profile │ │Matchmaking│ │ Chat  │ │Payment│       │
│  │Service│ │Service│ │Service │ │ Service   │ │Service│ │Service│       │
│  └───┬───┘ └──┬───┘ └───┬────┘ └─────┬─────┘ └───┬───┘ └───┬────┘       │
│  ┌───┴───┐ ┌──┴────┐ ┌──┴────┐ ┌─────┴─────┐ ┌───┴───┐ ┌───┴────┐       │
│  │Notif  │ │Admin  │ │Search │ │Recommend  │ │Media  │ │Coupon  │       │
│  │Service│ │Service│ │Service│ │ Engine    │ │Service│ │Service │       │
│  └───┬───┘ └──┬───┘ └───┬───┘ └─────┬─────┘ └───┬───┘ └───┬────┘       │
└──────┼────────┼─────────┼───────────┼───────────┼─────────┼──────────────┘
       │        │         │           │           │         │
┌──────┼────────┼─────────┼───────────┼───────────┼─────────┼──────────────┐
│      │        │         │           │           │         │              │
│  ┌───┴────────┴─────────┴───────────┴───────────┴─────────┴────┐        │
│  │                    Event Bus (BullMQ/Redis)                  │        │
│  │            Queues: email | sms | push | notification         │        │
│  └──────────────────────────────┬──────────────────────────────┘        │
│                                 │                                       │
│  ┌──────────────────────────────┴──────────────────────────────┐        │
│  │                     Data Layer                               │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐              │        │
│  │  │  MySQL   │  │  Redis   │  │ Elasticsearch │              │        │
│  │  │ (RDS)    │  │(Cache+   │  │ (Search)     │              │        │
│  │  │ Multi-AZ │  │ Pub/Sub) │  │              │              │        │
│  │  └──────────┘  └──────────┘  └──────────────┘              │        │
│  │                                                              │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐              │        │
│  │  │   S3     │  │CloudFront│  │ CloudWatch    │              │        │
│  │  │ (Media)  │  │  (CDN)   │  │ (Monitoring)  │              │        │
│  │  └──────────┘  └──────────┘  └──────────────┘              │        │
│  └─────────────────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────────────────┘
```

## Microservices Breakdown

The platform is built as a modular monolith using NestJS, designed to be extracted into independent microservices as scale demands.

| Service | Responsibility | Database | Communication |
|---------|---------------|----------|---------------|
| **Auth Service** | Registration, login, OTP, 2FA, OAuth, JWT management | MySQL (users, sessions) + Redis (OTP, refresh tokens) | REST + BullMQ (email/sms queues) |
| **User Service** | User CRUD, settings, activity tracking | MySQL (users, activity logs) | REST |
| **Profile Service** | Profile management, photos, videos, preferences, horoscope | MySQL (profiles, photos, videos, partner_preferences, education, family, lifestyle, horoscope, languages) | REST + BullMQ (notification queue) |
| **Matchmaking Service** | Search, interests, matches, compatibility scoring | MySQL (interests, matches) + Elasticsearch | REST + BullMQ |
| **Recommendation Engine** | AI-based daily recommendations, compatibility scoring | MySQL (daily_recommendations) + Redis | REST + BullMQ (cron jobs) |
| **Chat Service** | Conversations, messages, WebSocket real-time | MySQL (conversations, messages) + Redis (presence) | REST + WebSocket (Socket.IO) |
| **Payment Service** | Orders, payment verification, webhooks (Razorpay/Stripe) | MySQL (payments, subscriptions) | REST |
| **Subscription Service** | Plan management, coupons, upgrades | MySQL (subscriptions, coupons, coupon_redemptions) | REST + BullMQ |
| **Notification Service** | Push (FCM), Email (SendGrid/SMTP), SMS (Twilio), WhatsApp | MySQL (notifications, device_tokens, notification_templates) | BullMQ consumers |
| **Admin Service** | User management, reports, tickets, analytics, settings | MySQL | REST (admin-guarded) |
| **Media Service** | File upload, S3 integration, photo moderation | S3 + MySQL (photos, videos) | REST |
| **Analytics Service** | Dashboard metrics, user stats, platform KPIs | MySQL | REST |
| **GDPR Service** | Consent management, data export, account deletion | MySQL (gdpr_consents) | REST |

## Data Flow

### User Registration Flow
```
Client → Auth Service (POST /auth/register)
  → Validate input
  → Check email/phone uniqueness
  → Hash password (bcrypt, salt rounds: 12)
  → Create user in MySQL
  → Generate JWT token pair
  → Push email verification job to BullMQ
  → Return user + tokens
  → BullMQ → Email Service → Send verification email
```

### Interest & Match Flow
```
User A sends interest to User B
  → POST /interests → Interests Service
  → Create interest record (status: sent)
  → Push notification job to BullMQ
  → BullMQ → Notification Service
    → Push notification to User B (FCM)
    → In-app notification
    → Email notification (optional)

User B accepts interest
  → PATCH /interests/:id/accept
  → Update interest status (accepted)
  → Create match record
  → Push notification to User A
  → Both users can now chat
```

### Chat Flow (WebSocket)
```
Client connects to WebSocket → Socket.IO handshake with JWT
  → Authentication middleware verifies JWT
  → Client joins user room (user:{uuid})
  → Client joins conversation room (conversation:{id})
  → Send message: message:send event
  → Chat Service saves to MySQL
  → Server emits message:new to conversation room
  → BullMQ → Push notification to offline users
```

## Event-Driven Architecture (BullMQ)

The platform uses BullMQ for background job processing and async communication:

```
┌─────────────────────────────────────────────────────┐
│                    BullMQ Queues                     │
├─────────────────────────────────────────────────────┤
│  Queue Name        │ Consumers                      │
├─────────────────────────────────────────────────────┤
│  email             │ Email Service (SendGrid/SMTP)  │
│  sms               │ SMS Service (Twilio)           │
│  push              │ Push Notification (Firebase)   │
│  notification      │ In-app notification creation   │
│  matchmaking       │ Compatibility scoring          │
│  photo-moderation  │ AI-based photo moderation      │
│  data-retention    │ GDPR data cleanup jobs         │
│  analytics         │ Event tracking & aggregation   │
└─────────────────────────────────────────────────────┘
```

### Queue Configuration
- **Connection**: Redis with failover support
- **Default job options**: `attempts: 3`, `backoff: { type: 'exponential', delay: 5000 }`
- **Concurrency**: 5-10 processors per queue based on workload
- **Job scheduling**: BullMQ repeatable jobs for daily recommendations, data retention, subscription expiry

## API Gateway Pattern

Nginx acts as the API Gateway / reverse proxy:

```
Client → Nginx (port 80/443) → Backend (port 4000)
                               → Web (port 3000)
                               → Admin (port 3001)
```

### Gateway Responsibilities
- **SSL/TLS termination** (ACM certificates, auto-renewal)
- **Request routing** based on path
- **Rate limiting** (per IP, per endpoint)
- **Request logging** (morgan format)
- **Static file serving** (uploads, public assets)
- **Gzip compression**
- **Security headers** (helmet middleware)

## Scalability Design

| Aspect | Strategy |
|--------|----------|
| **Compute** | Horizontal scaling via Kubernetes HPA (CPU > 70%, Memory > 80%) |
| **Database** | RDS read replicas (up to 5), connection pooling, sharding ready |
| **Cache** | Redis cluster with read replicas, cache-aside pattern |
| **Search** | Elasticsearch cluster with dedicated master + data nodes |
| **Media** | S3 + CloudFront CDN with edge caching |
| **Session** | Stateless JWT, Redis for refresh token store |
| **Queue** | BullMQ with Redis, worker concurrency tuning |
| **WebSocket** | Socket.IO adapter with Redis for multi-instance broadcasting |
| **CDN** | CloudFront for static assets, media files with long TTL |

### Performance Targets
- **API response time**: < 200ms p95 for read, < 500ms p95 for writes
- **Search queries**: < 300ms p95
- **WebSocket message delivery**: < 100ms p95
- **Concurrent users**: 50,000 per EKS cluster
- **Daily active users**: 100,000+
- **Total users**: 1M+
