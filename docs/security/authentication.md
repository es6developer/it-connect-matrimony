# Authentication Security Deep Dive

## JWT Token Structure

### Access Token
```
Header:    { "alg": "HS256", "typ": "JWT" }
Payload:   { "sub": "user-uuid", "email": "user@example.com", "role": "user", "iat": 1700000000, "exp": 1700000900 }
Signature: HMAC-SHA256(base64url(header) + "." + base64url(payload), JWT_SECRET)
```

### Refresh Token
```
Header:    { "alg": "HS256", "typ": "JWT" }
Payload:   { "sub": "user-uuid", "email": "user@example.com", "role": "user", "iat": 1700000000, "exp": 1700604800 }
Signature: HMAC-SHA256(base64url(header) + "." + base64url(payload), JWT_REFRESH_SECRET)
```

## Token Expiration and Refresh

### Token Lifecycle
```
Registration/Login
  ├── Generate access_token (15m) + refresh_token (7d)
  ├── Store refresh_token in Redis (`refresh:{uuid}`) with 7d TTL
  └── Return both tokens to client

API Request
  ├── Client sends access_token in Authorization header
  ├── JwtAuthGuard validates token (checks signature, expiry)
  └── If valid → proceed; if expired → return 401

Token Refresh
  ├── Client sends refresh_token to POST /auth/refresh-token
  ├── Server validates refresh_token signature
  ├── Server checks refresh_token matches stored in Redis
  ├── If valid:
  │   ├── Generate new access_token + refresh_token
  │   ├── Invalidate old refresh_token in Redis
  │   ├── Store new refresh_token in Redis
  │   └── Return new tokens
  └── If invalid/expired → return 401

Logout
  └── Delete refresh_token from Redis
```

### Token Security Measures
- **Short-lived access tokens**: 15 minutes limits exposure window
- **Refresh token rotation**: Each use invalidates previous token
- **Redis-backed storage**: Enables server-side revocation
- **Separate signing keys**: Different secrets for access vs refresh tokens
- **No sensitive data in payload**: Only UUID, email, role

## OAuth 2.0 Flow (Google/LinkedIn)

### Google OAuth Flow
```
Client                                Backend                          Google
  │                                      │                               │
  │  1. Client uses Google Sign-In SDK   │                               │
  │     to get access_token              │                               │
  │──────────────────────────────────────│                               │
  │  2. POST /auth/social/google         │                               │
  │     { accessToken }                  │                               │
  │──────────────────────────────────────▶                               │
  │                                      │  3. GET /oauth2/v3/userinfo  │
  │                                      │     Authorization: Bearer... │
  │                                      │──────────────────────────────▶│
  │                                      │  4. User profile response    │
  │                                      │◀───────────────────────────── │
  │                                      │                               │
  │                                      │  5. Find or create user      │
  │                                      │     by email/oauthId         │
  │                                      │                               │
  │  6. Return user + JWT tokens         │                               │
  │◀─────────────────────────────────────│                               │
```

### Token Verification
```typescript
// Google token verification
private async verifyGoogleToken(accessToken: string) {
  const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return {
    id: response.data.sub,
    email: response.data.email,
    firstName: response.data.given_name,
    lastName: response.data.family_name,
  };
}

// LinkedIn token verification
private async verifyLinkedInToken(accessToken: string) {
  const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return {
    id: response.data.sub,
    email: response.data.email, // Fallback to email API
    firstName: response.data.given_name,
    lastName: response.data.family_name,
  };
}
```

## Two-Factor Authentication (2FA)

### Setup Flow
```
1. User requests 2FA setup → POST /auth/2fa/setup
2. Server generates TOTP secret via speakeasy
3. Secret stored in user record (twoFactorSecret field)
4. Returns secret + QR code data URL
5. User scans QR with authenticator app (Google Auth, Authy, etc.)
6. User enters TOTP token → POST /auth/2fa/verify
7. Server validates token with speakeasy.totp.verify()
8. If valid: enables 2FA, generates 8 recovery codes
9. Recovery codes displayed once (stored hashed in DB)
```

### Login with 2FA
```
1. POST /auth/login (email + password)
2. If 2FA enabled → returns { requiresTwoFactor: true, userId }
3. POST /auth/2fa/login (userId + TOTP token)
4. Server verifies TOTP token
5. If valid → returns JWT tokens
```

### TOTP Configuration
```typescript
const secret = speakeasy.generateSecret({
  name: `IT Connect Matrimony (${user.email})`,
  issuer: 'IT Connect Matrimony',
});

const verified = speakeasy.totp.verify({
  secret: user.twoFactorSecret,
  encoding: 'base32',
  token: userInputToken,
  window: 1, // Allow 30s before/after for clock drift
});
```

### Recovery Codes
- 8 recovery codes generated on 2FA enable
- Each code is a UUID-like string (e.g., `AB12-CD34-EF56-GH78`)
- One-time use per code
- User can regenerate codes

## Password Policies

### Creation Rules
```
- Minimum length: 8 characters
- Maximum length: 72 characters (bcrypt limitation)
- Must contain at least:
  - 1 uppercase letter (A-Z)
  - 1 lowercase letter (a-z)
  - 1 digit (0-9)
  - 1 special character (!@#$%^&*()_+-=[]{};':"\\|,.<>/?)
```

### Storage
```typescript
const salt = await bcrypt.genSalt(12); // 2^12 rounds
const hash = await bcrypt.hash(password, salt);
```

### Verification
```typescript
const isValid = await bcrypt.compare(inputPassword, storedHash);
// bcrypt.compare is intentionally slow (adaptive) to resist brute-force
```

## Account Lockout

### Lockout Policy
| Threshold | Action | Duration |
|-----------|--------|----------|
| 5 failed login attempts | Account locked | 15 minutes |
| 10 failed login attempts | Account suspended | Manual admin review |
| 15 failed login attempts | Account blocked | Indefinite |

### Rate Limiting Per Account
```
Failed attempt count stored in Redis:
  Key: `lockout:{email}`
  Value: { count: number, lastAttempt: timestamp }
  TTL: 15 minutes

On failure:
  1. Increment failed attempt counter
  2. If counter >= 5:
     - Return ACCOUNT_LOCKED error
     - Set status to inactive
     - Notify user via email

On success:
  1. Clear failed attempt counter
  2. Reset login attempts
```

### Brute Force Protection
- Rate limiting per IP (100 req/min general, 10 req/min auth)
- Rate limiting per account (10 attempts/min)
- Progressive delay on repeated failures
- OTP verification rate-limited per phone number
- CAPTCHA integration on registration (planned)
