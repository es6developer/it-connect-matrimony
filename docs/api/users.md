# Users API

All endpoints prefixed with: `/api/v1/users`

Authentication: Bearer token required for all endpoints except `GET /users/:id`.

## GET /users/me

Get the authenticated user's profile.

### Headers
```
Authorization: Bearer <access_token>
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+919876543210",
    "gender": "male",
    "dateOfBirth": "1995-06-15",
    "role": "user",
    "status": "active",
    "emailVerifiedAt": "2024-01-15T10:05:00.000Z",
    "phoneVerifiedAt": null,
    "isTwoFactorEnabled": false,
    "profileCompletionPercentage": 45,
    "lastLoginAt": "2024-01-15T10:00:00.000Z",
    "lastActiveAt": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

## PATCH /users/me

Update the authenticated user's profile.

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+919876543211",
  "gender": "male",
  "dateOfBirth": "1995-06-15"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

## DELETE /users/me

Deactivate (soft delete) the authenticated user's account.

### Headers
```
Authorization: Bearer <access_token>
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Account deactivated successfully"
}
```

## GET /users/:id

Get a user's public profile by UUID.

### Success Response (200)
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "male",
    "dateOfBirth": "1995-06-15"
  }
}
```

## GET /users

Search users with filters.

### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `gender` | string | Filter by gender |
| `ageMin` | integer | Minimum age |
| `ageMax` | integer | Maximum age |
| `religion` | string | Filter by religion |
| `motherTongue` | string | Filter by mother tongue |
| `country` | string | Filter by country |
| `state` | string | Filter by state |
| `city` | string | Filter by city |
| `maritalStatus` | string | Filter by marital status |
| `education` | string | Filter by education |
| `occupation` | string | Filter by occupation |
| `minIncome` | number | Minimum annual income |
| `maxIncome` | number | Maximum annual income |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 20, max: 100) |

### Success Response (200)
Standard paginated response with user data array.

## PATCH /users/me/settings

Update user settings (notification preferences, privacy settings).

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "notificationPreferences": {
    "email": true,
    "push": true,
    "sms": false
  },
  "privacy": {
    "showPhotoToNonSubscribers": false,
    "showOnlineStatus": true
  }
}
```

Success Response (200): Settings updated.

## GET /users/me/activity

Get the authenticated user's activity log (paginated).

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |

### Success Response (200)
```json
{
  "success": true,
  "message": "Activity log retrieved successfully",
  "data": [
    {
      "id": 1,
      "type": "login",
      "metadata": {},
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true
  }
}
```
