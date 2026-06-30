# API Overview

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:4000/api/v1` |
| Staging | `https://api.staging.itconnectmatrimony.com/api/v1` |
| Production | `https://api.itconnectmatrimony.com/api/v1` |

The API prefix is configured via the `API_PREFIX` environment variable (default: `api/v1`).

## Authentication

Most endpoints require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Token Types

| Token | Duration | Usage |
|-------|----------|-------|
| Access Token | 15 minutes | All authenticated requests |
| Refresh Token | 7 days | Generate new access tokens |

### Token Payload
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "user",
  "iat": 1700000000,
  "exp": 1700000900
}
```

## Rate Limiting

Rate limiting is applied globally using `@nestjs/throttler`:

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General API | 100 requests | 60 seconds |
| Auth (login, register) | 10 requests | 60 seconds |
| OTP sending | 3 requests | 300 seconds |
| Password reset | 3 requests | 300 seconds |

Rate limit headers are returned in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000100
```

When exceeded, a `429 Too Many Requests` response is returned:
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "error": "RATE_LIMIT_EXCEEDED",
  "statusCode": 429,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/auth/login"
}
```

## Pagination

All list endpoints support pagination through query parameters:

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | - | Page number (1-based) |
| `limit` | integer | 20 | 100 | Items per page |
| `sortBy` | string | `createdAt` | - | Field to sort by |
| `sortOrder` | string | `DESC` | - | `ASC` or `DESC` |

### Paginated Response Format
```json
{
  "success": true,
  "message": "Items retrieved successfully",
  "data": [...],
  "meta": {
    "total": 245,
    "page": 1,
    "limit": 20,
    "totalPages": 13,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "ERROR_CODE",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/resource"
}
```

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "statusCode": 422,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/auth/register",
  "errors": {
    "email": ["Invalid email format"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `TOKEN_INVALID` | 400/401 | Token is invalid |
| `NOT_FOUND` | 404 | Resource not found |
| `ALREADY_EXISTS` | 409 | Resource already exists |
| `USER_ALREADY_EXISTS` | 409 | Email/phone already registered |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## API Versioning

Versioning is handled via URL prefix:

- Current version: `v1`
- Format: `/api/v1/{resource}`
- Deprecated versions will be supported for 6 months after new version release
- Breaking changes announced via changelog 30 days in advance

## Standard Response Wrapper

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Empty Success
```json
{
  "success": true,
  "message": "Operation completed successfully"
}
```

## Cross-Origin Resource Sharing (CORS)

```typescript
// CORS configuration from main.ts
app.enableCors({
  origin: ['https://itconnectmatrimony.com', 'https://www.itconnectmatrimony.com', 'https://admin.itconnectmatrimony.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});
```

## Security Headers

The following security headers are set via `helmet` middleware:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'`
- `Referrer-Policy: strict-origin-when-cross-origin`
