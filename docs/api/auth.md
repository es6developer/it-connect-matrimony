# Auth API

All endpoints prefixed with: `/api/v1/auth`

## POST /auth/register

Register a new user account.

### Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "StrongP@ss1",
  "phone": "+919876543210",
  "gender": "male",
  "dateOfBirth": "1995-06-15"
}
```

### Validation Rules

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `firstName` | string | Yes | 2-50 characters |
| `lastName` | string | Yes | 2-50 characters |
| `email` | string | Yes | Valid email, max 255 chars |
| `password` | string | Yes | 8-72 chars, must contain uppercase, lowercase, number, special character |
| `phone` | string | No | Valid phone number (E.164 format) |
| `gender` | enum | Yes | `male`, `female`, `other` |
| `dateOfBirth` | string | Yes | Format: `YYYY-MM-DD` |

### Success Response (201)
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+919876543210",
      "gender": "male",
      "dateOfBirth": "1995-06-15",
      "role": "user",
      "status": "pending",
      "emailVerifiedAt": null,
      "phoneVerifiedAt": null,
      "profileCompletionPercentage": 0,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### Error Responses
- **409**: Email or phone already registered
- **422**: Validation errors (password requirements not met, invalid email format, etc.)

---

## POST /auth/login

Login with email and password.

### Request Body

```json
{
  "email": "john.doe@example.com",
  "password": "StrongP@ss1"
}
```

### Success Response (200) - Normal Login
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "status": "active"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### Success Response (200) - 2FA Required
```json
{
  "success": true,
  "message": "2FA verification required",
  "data": {
    "requiresTwoFactor": true,
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Error Responses
- **401**: Invalid credentials
- **401**: Account is suspended/blocked/inactive
- **401**: Email not verified

---

## POST /auth/login/otp

Send OTP for phone number login.

### Request Body

```json
{
  "phone": "+919876543210"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### Notes
- OTP is 6 digits, valid for 5 minutes
- OTP sent via SMS (Twilio)
- Rate limited: 3 requests per phone per 5 minutes

---

## POST /auth/login/otp/verify

Verify OTP and login/register via phone.

### Request Body

```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "phone": "+919876543210"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### Error Responses
- **400**: Invalid OTP
- **400**: OTP has expired

---

## POST /auth/verify-email

Verify email address with token.

### Request Body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Error Responses
- **400**: Invalid or expired token

---

## POST /auth/resend-verification-email

Resend email verification link.

### Request Body

```json
{
  "email": "john.doe@example.com"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

---

## POST /auth/forgot-password

Request password reset email.

### Request Body

```json
{
  "email": "john.doe@example.com"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

### Notes
- Always returns success to prevent email enumeration
- Reset token valid for 15 minutes
- Token stored in Redis, single-use

---

## POST /auth/reset-password

Reset password with token.

### Request Body

```json
{
  "token": "reset-token-uuid",
  "password": "NewStr0ng@Pass"
}
```

### Validation Rules
- `password`: Same rules as registration (8-72 chars, must contain uppercase, lowercase, number, special character)

### Success Response (200)
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Error Responses
- **400**: Invalid or expired reset token

---

## POST /auth/refresh-token

Refresh access token using refresh token. Requires the refresh token to be sent via `Authorization: Bearer <refresh_token>` header.

### Headers
```
Authorization: Bearer <refresh_token>
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Token Rotation
- Old refresh token is invalidated
- New refresh token pair is issued
- Refresh tokens stored in Redis with 7-day TTL

---

## POST /auth/logout

Logout user and invalidate refresh token. Requires valid access token.

### Headers
```
Authorization: Bearer <access_token>
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## POST /auth/2fa/setup

Set up two-factor authentication. Requires valid access token.

### Headers
```
Authorization: Bearer <access_token>
```

### Success Response (200)
```json
{
  "success": true,
  "message": "2FA setup initiated. Verify with a TOTP token to enable.",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,..."
  }
}
```

---

## POST /auth/2fa/verify

Verify and enable 2FA with TOTP token.

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body

```json
{
  "token": "123456"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "2FA verification successful",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

---

## POST /auth/2fa/disable

Disable two-factor authentication. Requires current password.

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body

```json
{
  "password": "CurrentPassword123"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "2FA disabled successfully"
}
```

---

## POST /auth/2fa/login

Verify 2FA token during login flow (after login returns `requiresTwoFactor: true`).

### Request Body

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "123456"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "2FA login successful",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

---

## POST /auth/social/google

Login or register with Google OAuth.

### Request Body

```json
{
  "accessToken": "google-oauth-access-token"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Social login successful",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### Flow
1. Client obtains Google OAuth access token via Google Sign-In SDK
2. Backend verifies token via `https://www.googleapis.com/oauth2/v3/userinfo`
3. If user exists by email or OAuth ID, login; otherwise create account

---

## POST /auth/social/linkedin

Login or register with LinkedIn OAuth.

### Request Body

```json
{
  "accessToken": "linkedin-oauth-access-token"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Social login successful",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### Flow
1. Client obtains LinkedIn OAuth access token via LinkedIn Sign-In SDK
2. Backend verifies token via `https://api.linkedin.com/v2/userinfo`
3. Email fetched from `/v2/emailAddress` if not in userinfo response
4. If user exists by email or OAuth ID, login; otherwise create account

---

## POST /auth/verify-mobile

Verify mobile number (marks phone as verified). Requires valid access token.

### Headers
```
Authorization: Bearer <access_token>
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Mobile number verified successfully"
}
```
