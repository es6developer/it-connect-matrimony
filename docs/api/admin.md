# Admin API

All endpoints prefixed with: `/api/v1/admin`

All admin endpoints require JWT Bearer token with `admin` or `super_admin` role.

---

## Dashboard

### GET /admin/dashboard

Get platform-wide analytics dashboard data.

**Roles**: admin, super_admin

#### Success Response (200)
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "totalUsers": 150000,
    "newUsersToday": 250,
    "activeUsersToday": 12000,
    "totalMatches": 45000,
    "totalInterestsSent": 200000,
    "totalRevenue": 50000000,
    "activeSubscriptions": 25000,
    "pendingVerifications": 500,
    "openTickets": 150,
    "pendingReports": 45,
    "userGrowth": { "daily": [120, 145, 160, ...], "weekly": [800, 950, ...] },
    "revenueChart": { "monthly": [400000, 450000, ...] }
  }
}
```

---

## Users Management

### GET /admin/users

List all users with filters.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name or email |
| `status` | string | Filter by status |
| `role` | string | Filter by role |
| `page` | integer | Page number |
| `limit` | integer | Items per page |

### GET /admin/users/:id

Get detailed user information by UUID.

### PATCH /admin/users/:id/status

Update user status.

**Roles**: admin, super_admin

```json
{
  "status": "suspended",
  "reason": "Community guidelines violation"
}
```

### PATCH /admin/users/:id/role

Update user role.

**Roles**: super_admin only

```json
{
  "role": "moderator"
}
```

### DELETE /admin/users/:id

Permanently delete a user (force delete).

**Roles**: super_admin only

### POST /admin/users/:id/impersonate

Generate an impersonation token to log in as a user for support.

**Roles**: super_admin only

---

## Profiles Management

### GET /admin/profiles

List all profiles with filters and verification status.

### PATCH /admin/profiles/:id/verification

Verify a user's profile/document.
```json
{
  "type": "identity",
  "status": "approved",
  "notes": "Identity document verified"
}
```

---

## Payments Management

### GET /admin/payments
List all payments with filters (status, gateway, date range).

### POST /admin/payments/:id/refund
Process a refund for a specific payment.

---

## Subscriptions Management

### GET /admin/subscriptions
List all subscriptions with filters.

### PATCH /admin/subscriptions/:id
Manually update a user's subscription.

---

## Reports

### GET /admin/reports

List all user reports with filters.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `pending`, `under_review`, `resolved`, `dismissed` |
| `page` | integer | Page number |
| `limit` | integer | Items per page |

### GET /admin/reports/:id

Get report details including reporter, reported user, and history.

### PATCH /admin/reports/:id/status

Update report status.
```json
{
  "status": "under_review",
  "notes": "Investigating the reported content"
}
```

### POST /admin/reports/:id/action

Take action on the reported user.
```json
{
  "action": "suspend",
  "reason": "Repeated harassment complaints confirmed"
}
```

| Action | Effect |
|--------|--------|
| `warn` | Send warning to user |
| `suspend` | Temporary suspension |
| `ban` | Permanent ban |
| `dismiss` | No action needed |

---

## Support Tickets

### GET /admin/tickets

List all support tickets with filters.

### GET /admin/tickets/:id

Get ticket details with replies.

### PATCH /admin/tickets/:id/status

Update ticket status (`open`, `in_progress`, `resolved`, `closed`).

### POST /admin/tickets/:id/reply

Reply to a support ticket.

---

## Verifications

### GET /admin/verifications

List all pending verification requests.

### POST /admin/verifications/:id/action

Approve or reject a verification request.
```json
{
  "action": "approve",
  "notes": "Documents verified successfully"
}
```

---

## Blog Management

### GET /admin/blogs
### POST /admin/blogs
### PATCH /admin/blogs/:id
### DELETE /admin/blogs/:id

Full CRUD for blog posts (help articles, success stories).

---

## Site Settings

### GET /admin/settings

Get all site settings (public and private).

### PATCH /admin/settings

Update site settings.
```json
{
  "site_name": "IT Connect Matrimony",
  "maintenance_mode": false,
  "free_interest_limit": 5,
  "max_photos_per_user": 10,
  "otp_expiry_seconds": 300
}
```

---

## Audit Logs

### GET /admin/audit-logs

View platform audit logs with filters:
- Admin actions
- User status changes
- Payment operations
- Profile moderation actions

---

## Analytics

### GET /admin/analytics/users

User analytics: growth, retention, demographics.

### GET /admin/analytics/revenue

Revenue analytics: MRR, ARPU, conversion rates.

### GET /admin/analytics/matching

Matching analytics: match rate, interest acceptance rate, active users.
