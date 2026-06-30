# Microservices Architecture

## Service Boundaries and Responsibilities

### Auth Service
```
Module:    backend/src/modules/auth/
Port:      Internal via gateway
Database:  MySQL (users, sessions) + Redis (OTP, refresh tokens, rate limits)
```
- User registration with email/password
- Login with email/password, phone OTP, or social accounts
- JWT access + refresh token management
- 2FA setup and verification (TOTP via speakeasy)
- Email verification flow
- Password reset flow
- OAuth 2.0 integration (Google, LinkedIn)
- Account lockout after failed attempts
- Session management

### User Service
```
Module:    backend/src/modules/users/
Database:  MySQL (users, activity_logs)
```
- User CRUD operations
- Profile settings (notification preferences, privacy)
- Activity logging
- Account deactivation (soft delete)
- User search with filters

### Profile Service
```
Module:    backend/src/modules/profiles/
Submodules: education, families, lifestyle, horoscope, photos, videos, social-links, languages
Database:  MySQL (profiles, photos, videos, education_details, family_details, 
           lifestyle_details, horoscope_details, languages, partner_preferences,
           professional_details, profile_views)
```
- Complete profile management (basic, professional, education, family, lifestyle)
- Photo upload/delete/primary photo management
- Video upload management
- Horoscope details (astro details, manglik, etc.)
- Partner preference settings
- Profile completion percentage calculation
- Profile visibility settings (incognito mode)
- Public profile view tracking
- Photo moderation (AI + manual)

### Matchmaking Service
```
Module:    backend/src/modules/matchmaking/
Submodules: search, interests, matches, recommendations
Database:  MySQL (interests, matches, daily_recommendations, saved_searches, search_history)
           Elasticsearch (profile search index)
```
- Profile search with 15+ filters (age, religion, education, income, etc.)
- Interest sending, accepting, declining, canceling
- Match creation when interests are mutual
- Daily recommendations based on compatibility score
- Compatibility scoring algorithm
- Saved searches
- Search history tracking

### Chat Service
```
Module:    backend/src/modules/chat/
Database:  MySQL (conversations, conversation_participants, messages)
WebSocket: Socket.IO namespace /chat
```
- Conversation management (create, get, delete)
- Message sending and retrieval (paginated)
- Real-time messaging via WebSocket
- Typing indicators
- Read receipts
- File/image sharing in chat
- Message reporting
- Conversation soft delete

### Payment Service
```
Module:    backend/src/modules/payments/
Integrations: Razorpay, Stripe
Database:  MySQL (payments)
```
- Payment order creation
- Payment verification
- Refund processing
- Webhook handling (Razorpay, Stripe)
- Payment status tracking

### Subscription Service
```
Module:    backend/src/modules/subscriptions/
Database:  MySQL (subscriptions)
```
- Plan management (Free, Basic, Premium, VIP)
- Subscription creation and activation
- Subscription upgrade/downgrade
- Subscription cancellation
- Auto-renewal handling
- Grace period management

### Coupon Service
```
Module:    backend/src/modules/coupons/
Database:  MySQL (coupons, coupon_redemptions)
```
- Coupon code generation
- Coupon validation
- Usage tracking
- Expiry management

### Notification Service
```
Module:    backend/src/modules/notifications/
Processors: notification.processor.ts
Services:  email.service.ts, push-notification.service.ts, sms.service.ts, whatsapp.service.ts
Database:  MySQL (notifications, device_tokens, notification_templates)
Queues:    BullMQ (email, sms, push, notification)
```
- In-app notification creation and retrieval
- Push notifications via Firebase Cloud Messaging (FCM)
- Email notifications via SendGrid/SMTP
- SMS notifications via Twilio
- WhatsApp notifications
- Device token management
- Notification preferences
- Notification templates

### Admin Service
```
Module:    backend/src/modules/admin/
Subcontrollers: dashboard, users-admin, profiles, payments-admin, subscriptions-admin,
                reports, tickets, verifications, blogs-admin, settings, audit-logs, analytics
Database:  MySQL (admin_users, audit_logs, site_settings)
```
- Dashboard analytics
- User management (list, status, role, impersonate, force delete)
- Profile management
- Payment management (list, refund)
- Subscription management
- Report management (list, status, action)
- Support ticket management
- Verification management
- Blog CRUD
- Site settings management
- Audit log viewing
- Analytics and reporting

### Analytics Service
```
Module:    backend/src/modules/analytics/
Database:  MySQL (analytics views/queries)
```
- Platform-wide metrics
- User growth tracking
- Revenue analytics
- Engagement metrics
- Conversion funnel analysis

### GDPR Service
```
Module:    backend/src/modules/gdpr/
Database:  MySQL (gdpr_consents, data_retention_logs)
```
- Consent management
- Data export requests
- Account deletion (GDPR right to erasure)
- Data retention policy enforcement

### Health Service
```
Module:    backend/src/modules/health/
```
- Health check endpoints for k8s probes
- Readiness and liveness checks
- Dependency health (MySQL, Redis, Elasticsearch)

### Webhook Service
```
Module:    backend/src/modules/webhooks/
```
- Payment gateway webhook processing
- External integration webhooks

## Inter-Service Communication

### REST API
Services communicate primarily through REST endpoints within the NestJS application. All services share the same HTTP server and are routed through the global prefix `api/v1`.

### WebSocket (Socket.IO)
The chat service uses WebSocket for real-time bidirectional communication:
- **Namespace**: `/chat`
- **Authentication**: JWT verification on connection
- **Transports**: WebSocket (primary), polling (fallback)
- **Redis adapter** for horizontal scaling across multiple instances
- **Events**:
  - `connection/`disconnect` - Lifecycle
  - `conversation:join` / `conversation:leave` - Room management
  - `message:send` - Send message
  - `message:new` - Broadcast to room
  - `message:typing` / `message:stop-typing` - Typing indicators
  - `message:read` - Read receipts

### BullMQ (Message Queue)
Async communication via BullMQ queues backed by Redis:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BullMQ Architecture                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Producer Services          Queues                 Consumer Services    │
│  ┌────────────────┐    ┌──────────────┐    ┌──────────────────────┐     │
│  │ Auth Service   │───▶│ email        │───▶│ Email Service        │     │
│  └────────────────┘    └──────────────┘    └──────────────────────┘     │
│  ┌────────────────┐    ┌──────────────┐    ┌──────────────────────┐     │
│  │ Auth Service   │───▶│ sms          │───▶│ SMS Service          │     │
│  └────────────────┘    └──────────────┘    └──────────────────────┘     │
│  ┌────────────────┐    ┌──────────────┐    ┌──────────────────────┐     │
│  │ All Services   │───▶│ notification │───▶│ Notification Service │     │
│  └────────────────┘    └──────────────┘    └──────────────────────┘     │
│  ┌────────────────┐    ┌──────────────┐    ┌──────────────────────┐     │
│  │ Chat Service   │───▶│ push         │───▶│ Push Service (FCM)   │     │
│  └────────────────┘    └──────────────┘    └──────────────────────┘     │
│  ┌────────────────┐    ┌──────────────┐    ┌──────────────────────┐     │
│  │ Profile Service│───▶│ photo-       │───▶│ Photo Moderation     │     │
│  │                │    │ moderation   │    │                      │     │
│  └────────────────┘    └──────────────┘    └──────────────────────┘     │
│  ┌────────────────┐    ┌──────────────┐    ┌──────────────────────┐     │
│  │ Scheduler      │───▶│ data-        │───▶│ Data Retention Job   │     │
│  │                │    │ retention    │    │                      │     │
│  └────────────────┘    └──────────────┘    └──────────────────────┘     │
│  ┌────────────────┐    ┌──────────────┐    ┌──────────────────────┐     │
│  │ Scheduler      │───▶│ matchmaking  │───▶│ Compatibility Calc   │     │
│  └────────────────┘    └──────────────┘    └──────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Queue Configuration** (`bull.module.ts`):
```typescript
BullModule.forRoot({
  connection: {
    host: config.get<string>('redis.host'),
    port: config.get<number>('redis.port'),
    password: config.get<string>('redis.password') || undefined,
  },
});
```

**Job Retry Strategy**:
- Default attempts: 3
- Backoff: Exponential (5s, 10s, 20s)
- Failed jobs logged to CloudWatch
- Dead-letter queue for persistent failures

## Service Discovery

In Kubernetes, services discover each other via DNS-based service discovery:

```
backend-service.namespace.svc.cluster.local:4000
web-service.namespace.svc.cluster.local:3000
mysql-service.namespace.svc.cluster.local:3306
redis-service.namespace.svc.cluster.local:6379
```

For the modular monolith, services are organized as NestJS modules and discovery is handled internally via dependency injection. When extracted to separate services, Kubernetes DNS + Envoy sidecar proxy would be used.

## Circuit Breaker Pattern

Implemented at the HTTP client level for inter-service calls:

```typescript
// Conceptual circuit breaker configuration
{
  timeout: 5000,         // 5 second timeout
  errorThreshold: 50,     // 50% error rate opens circuit
  resetTimeout: 30000,    // 30 seconds before half-open
  maxRetries: 3,
  fallback: (err) => fallbackResponse(err)
}
```

### Affected Services
- **Payment Gateway** calls (Razorpay/Stripe API)
- **S3 uploads** with retry on network errors
- **External OAuth** verification (Google, LinkedIn)
- **Email/SMS delivery** via third-party providers

## Database Per Service Pattern

While currently a modular monolith sharing a single MySQL instance, the schema is designed with clear ownership boundaries:

| Service | Owned Tables | Access Pattern |
|---------|-------------|----------------|
| Auth | users, sessions, verification_records | Direct TypeORM |
| User | users (profile fields), activity_logs | Direct TypeORM |
| Profile | profiles, photos, videos, education_details, family_details, lifestyle_details, horoscope_details, languages, partner_preferences, professional_details, profile_views | Direct TypeORM |
| Matchmaking | interests, matches, daily_recommendations, saved_searches, search_history | Direct TypeORM |
| Chat | conversations, conversation_participants, messages | Direct TypeORM |
| Payment | payments, subscriptions, coupons, coupon_redemptions | Direct TypeORM |
| Notification | notifications, device_tokens, notification_templates | Direct TypeORM |
| Admin | admin_users, audit_logs, site_settings | Direct TypeORM |

**Foreign keys are enforced** within MySQL to maintain referential integrity. When extracting to separate databases, the pattern would use:
- **API composition** at the gateway level
- **Eventual consistency** via BullMQ events
- **CQRS** for read models

## Caching Strategy with Redis

Redis is used for multiple purposes:

### Use Cases

| Purpose | Key Pattern | TTL | Notes |
|---------|------------|-----|-------|
| OTP Storage | `otp:{phone}` | 5 min | Auto-delete after verification |
| Refresh Tokens | `refresh:{uuid}` | 7 days | Rotated on each refresh |
| Password Reset | `reset:{token}` | 15 min | Single-use, deleted after reset |
| Rate Limiting | `ratelimit:{ip}:{endpoint}` | Window-based | Per route configuration |
| Session Cache | `session:{uuid}` | 30 min | Active session tracking |
| Profile Cache | `profile:{userId}` | 15 min | Cache-aside for profile reads |
| Search Results | `search:{hash}` | 5 min | Paginated search result cache |
| WebSocket Presence | `presence:{userId}` | Real-time | Connection status tracking |
| Device Tokens | `device:{userId}` | Persistent | Push notification targets |
| BullMQ Jobs | bull:* | Job-based | Queue message persistence |
| Rate Limit Counters | `rl:{userId}:{action}` | Configurable | Per-action limits |

### Cache-Aside Pattern
```typescript
async function getCachedProfile(userId: string) {
  const cached = await redis.get(`profile:${userId}`);
  if (cached) return JSON.parse(cached);

  const profile = await profileRepository.findOne({ where: { uuid: userId } });
  if (profile) {
    await redis.setex(`profile:${userId}`, 900, JSON.stringify(profile));
  }
  return profile;
}
```

### Redis Configuration
- **Instance**: AWS ElastiCache for Redis 7.1 (clustered mode)
- **Encryption**: In-transit (TLS) and at-rest encryption enabled
- **Auth token**: Required for all connections
- **Auto-failover**: Enabled with Multi-AZ
- **Snapshot retention**: 7 days

## Search with Elasticsearch

### Indexed Data
Profiles are indexed in Elasticsearch for full-text and filtered search:

**Index**: `profiles`

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "integer" },
      "uuid": { "type": "keyword" },
      "firstName": { "type": "text", "analyzer": "standard" },
      "lastName": { "type": "text", "analyzer": "standard" },
      "gender": { "type": "keyword" },
      "dateOfBirth": { "type": "date", "format": "yyyy-MM-dd" },
      "age": { "type": "integer" },
      "religion": { "type": "keyword" },
      "motherTongue": { "type": "keyword" },
      "community": { "type": "keyword" },
      "subCommunity": { "type": "keyword" },
      "gothra": { "type": "keyword" },
      "maritalStatus": { "type": "keyword" },
      "height": { "type": "integer" },
      "weight": { "type": "integer" },
      "bodyType": { "type": "keyword" },
      "complexion": { "type": "keyword" },
      "physicalStatus": { "type": "keyword" },
      "diet": { "type": "keyword" },
      "smoking": { "type": "keyword" },
      "drinking": { "type": "keyword" },
      "education": { "type": "text", "analyzer": "standard" },
      "occupation": { "type": "text", "analyzer": "standard" },
      "annualIncome": { "type": "long" },
      "country": { "type": "keyword" },
      "state": { "type": "keyword" },
      "city": { "type": "keyword" },
      "citizenship": { "type": "keyword" },
      "hasPhoto": { "type": "boolean" },
      "isVerified": { "type": "boolean" },
      "isActive": { "type": "boolean" },
      "createdAt": { "type": "date" },
      "lastActiveAt": { "type": "date" }
    }
  }
}
```

### Sync Strategy
- **Initial sync**: Full database load on deployment
- **Incremental sync**: TypeORM entity subscriber (`profile.subscriber.ts`) triggers index updates
- **Bulk reindex**: Cron job for data consistency
- **Write concern**: `wait_for` for critical profile updates
