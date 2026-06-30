# Security Architecture

## OWASP Top 10 Implementation

| # | OWASP Risk | Implementation |
|---|------------|---------------|
| A01 | Broken Access Control | Role-based guards (admin, super-admin), JWT validation per endpoint |
| A02 | Cryptographic Failures | bcrypt (12 rounds) for passwords, TLS 1.2+ in transit, AES-256 at rest |
| A03 | Injection | TypeORM parameterized queries, class-validator whitelist, `forbidNonWhitelisted` |
| A04 | Insecure Design | Rate limiting, account lockout, 2FA, email verification |
| A05 | Security Misconfiguration | Helmet.js headers, CORS restrictions, no debug in prod |
| A06 | Vulnerable Components | `npm audit` in CI, Trivy image scanning, dependency updates |
| A07 | Auth Failures | JWT with short expiry (15m), refresh token rotation, OAuth 2.0 |
| A08 | Data Integrity Failures | Payment webhook signature verification, CSRF via SameSite cookies |
| A09 | Logging Failures | Structured JSON logging, CloudWatch, audit trail for admin actions |
| A10 | SSRF | Outbound HTTP restricted, URL validation for webhook callbacks |

## Authentication & Authorization

### Password Policy
- Minimum 8 characters, maximum 72
- Must contain: uppercase, lowercase, number, special character
- bcrypt hashing with 12 salt rounds
- Rate limited login attempts (10 req/min)
- Account lockout after 5 failed attempts (15 min cooldown)

### JWT Token Structure
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "user",
  "iat": 1700000000,
  "exp": 1700000900
}
```

- **Access Token**: 15-minute expiry, signed with `JWT_SECRET`
- **Refresh Token**: 7-day expiry, signed with `JWT_REFRESH_SECRET`
- **Token rotation**: Old refresh tokens invalidated on refresh
- **Storage**: Refresh tokens stored in Redis with TTL

### Role-Based Access Control
| Role | Permissions |
|------|------------|
| `user` | Own profile CRUD, search, interests, chat |
| `admin` | User management, reports, tickets, content moderation |
| `super_admin` | All admin + role changes, settings, impersonation |

### Guards
```typescript
// JWT guard - validates access token
@UseGuards(JwtAuthGuard)

// Admin guard - checks admin role
@UseGuards(JwtAuthGuard, AdminGuard)

// Super admin guard - checks super_admin role
@UseGuards(JwtAuthGuard, SuperAdminGuard)

// Public endpoint (no auth required)
@Public()
```

## Data Encryption

### In Transit
- **All API traffic**: TLS 1.2+ via ACM certificates
- **WebSocket**: WSS (WebSocket Secure)
- **Database connections**: SSL/TLS for MySQL
- **Redis connections**: TLS with AUTH token enabled
- **ElastiCache**: In-transit encryption enabled
- **OpenSearch**: HTTPS enforced, node-to-node encryption

### At Rest
| Data Store | Encryption Method |
|------------|------------------|
| RDS MySQL | AES-256 via AWS KMS |
| ElastiCache Redis | Encryption at rest via KMS |
| OpenSearch | Encryption at rest via KMS |
| S3 Media | AES-256 (SSE-S3) |
| S3 Logs | AES-256 (SSE-S3) |
| S3 Backups | AES-256 (SSE-S3) |

### Password Storage
- Algorithm: bcrypt
- Salt rounds: 12
- One-way hash only (no reversibility)
- No plaintext storage

## API Security

### Rate Limiting

| Scope | Limit | Window | Implementation |
|-------|-------|--------|---------------|
| Global API | 100 requests | 60 seconds | `@nestjs/throttler` |
| Auth (login) | 10 requests | 60 seconds | Custom guard |
| Auth (register) | 5 requests | 60 seconds | Custom guard |
| OTP sending | 3 requests | 300 seconds | Redis-based |
| Password reset | 3 requests | 300 seconds | Redis-based |
| OTP verification | 5 requests | 300 seconds | Redis-based |

### CORS Configuration
```typescript
app.enableCors({
  origin: ['https://itconnectmatrimony.com', 'https://admin.itconnectmatrimony.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});
```

### Security Headers (Helmet.js)
```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
```

### Input Validation
- **Whitelist validation**: Unknown properties stripped via `whitelist: true`
- **DTO validation**: `class-validator` decorators on all DTOs
- **Type transformation**: Automatic type coercion via `class-transformer`
- **File validation**: MIME type check, size limits (photos: 5MB, videos: 50MB, chat: 10MB)
- **HTML sanitization**: Strip HTML tags from text input to prevent XSS

## File Upload Security

| Restriction | Value |
|-------------|-------|
| Photo formats | JPG, JPEG, PNG, WebP |
| Video formats | MP4, WebM |
| Max photo size | 5MB |
| Max video size | 50MB |
| Max chat file size | 10MB |
| S3 bucket | Private (no public access) |
| Access | CloudFront signed URLs / OAC |
| Moderation | AI-based + manual review queue |

## Session Management

- **Stateless**: JWT access tokens contain all session data
- **Refresh token rotation**: Each refresh invalidates previous token
- **Concurrent sessions**: Multiple devices supported via user-scoped rooms
- **Logout**: Invalidates refresh token in Redis
- **Admin termination**: Super admins can terminate any user session
- **Device tracking**: Device info stored in user record
- **IP logging**: IP address captured on login

## Audit Logging

### Events Logged
- All admin actions (user management, content moderation)
- Payment transactions (creation, verification, refunds)
- User status changes (activate, suspend, ban)
- Role changes
- Profile moderation actions
- Report handling
- Data export requests (GDPR)
- Account deletion

### Audit Log Format
```json
{
  "actorId": "admin-uuid",
  "action": "UPDATE_USER_STATUS",
  "targetId": "user-uuid",
  "targetType": "user",
  "changes": { "status": { "from": "active", "to": "suspended" } },
  "reason": "Community guidelines violation",
  "ipAddress": "203.0.113.1",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## GDPR Compliance

### User Rights
| Right | Implementation |
|-------|---------------|
| Right to be informed | Privacy policy at registration |
| Right of access | `GET /gdpr/data` - export all user data |
| Right to rectification | Profile edit endpoints |
| Right to erasure | `DELETE /users/me` with hard delete option |
| Right to restrict processing | Privacy settings per data category |
| Right to data portability | GDPR data export in JSON format |
| Right to object | Opt-out for promotional communications |
| Rights related to automation | No automated decision-making |

### Data Retention Policies

| Data Type | Retention Period | Cleanup Action |
|-----------|-----------------|----------------|
| Active user profiles | Indefinite (until deletion request) | - |
| Deleted accounts | 90 days (grace period) | Permanent deletion |
| Chat messages | 5 years (or until account deletion) | Anonymization |
| Payment records | 7 years (legal requirement) | Archival with masking |
| Audit logs | 3 years | Archival |
| Session logs | 90 days | Deletion |
| Activity logs | 12 months | Aggregation |
| OTP codes | 5 minutes (TTL) | Automatic Redis expiry |
| Password reset tokens | 15 minutes (TTL) | Automatic Redis expiry |
| Refresh tokens | 7 days (TTL) | Automatic Redis expiry |
