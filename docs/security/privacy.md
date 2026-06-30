# Privacy Features

## Profile Privacy Settings

Users can control the visibility of their profile sections:

### Visibility Levels

| Setting | Options | Default |
|---------|---------|---------|
| Profile visibility | `everyone`, `registered_only`, `matched_only` | `everyone` |
| Photo visibility | `everyone`, `premium_only`, `matches_only` | `everyone` |
| Online status | `visible`, `hidden` | `visible` |
| Last active | `visible`, `hidden` | `visible` |
| Profile views | `visible`, `hidden` | `visible` |
| Search visibility | `visible`, `invisible` | `visible` |

### Incognito Mode (VIP feature)
- Browse profiles without being seen
- No profile view records created
- Online status hidden
- Available only on VIP subscription

### Blocked Users
- Blocked users cannot view profile
- Blocked users cannot send interests/messages
- Block list managed via `blocked_users` table
- Users are not notified when blocked

### Profile View Tracking
- Users can see who viewed their profile (within subscription limits)
- View history accessible in activity log
- Free users see last 5 viewers; premium users see all
- VIP users see unlimited views with timestamps

## GDPR Compliance

### Data Subject Access Request (DSAR)

Users can request all their personal data via `GET /gdpr/data`:

```json
{
  "success": true,
  "message": "Data export completed",
  "data": {
    "exportId": "export-uuid",
    "expiresAt": "2024-02-15T10:00:00.000Z",
    "categories": [
      {
        "name": "Account Information",
        "data": {
          "email": "user@example.com",
          "phone": "+919876543210",
          "firstName": "John",
          "lastName": "Doe",
          "dateOfBirth": "1995-06-15",
          "gender": "male",
          "createdAt": "2024-01-15T10:00:00.000Z"
        }
      },
      {
        "name": "Profile Data",
        "data": { "religion": "hindu", "occupation": "Software Engineer", "city": "bangalore" }
      },
      {
        "name": "Interests & Matches",
        "data": { "totalInterestsSent": 15, "totalMatches": 3 }
      },
      {
        "name": "Messages",
        "data": { "totalMessages": 234 }
      },
      {
        "name": "Payments",
        "data": { "totalPayments": 2, "totalSpent": 1998 }
      },
      {
        "name": "Activity Log",
        "data": { "lastLogin": "2024-01-15T10:00:00.000Z", "totalLogins": 45 }
      },
      {
        "name": "GDPR Consents",
        "data": { "marketingConsent": true, "dataProcessingConsent": true }
      }
    ]
  }
}
```

### Data Export Format
- Format: JSON (machine-readable, portable)
- Delivery: Secure download link (expires in 48 hours)
- Processing time: Within 30 days (typically within 24 hours)
- Includes all personal data the platform holds

### GDPR Consent Management

```typescript
// GDPR Consent entity fields
export class GdprConsent {
  id: number;
  userId: number;
  consentType: string; // 'marketing', 'data_processing', 'profile_visibility', 'location'
  isGranted: boolean;
  ipAddress: string;
  userAgent: string;
  grantedAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

Consents collected at registration:
1. Data Processing Consent (required) - To provide matchmaking services
2. Marketing Consent (optional) - For promotional communications
3. Profile Visibility Consent (required) - To show profile to other users
4. Location Data Consent (optional) - For location-based matching

## Account Deletion

### Self-Service Deletion
- `DELETE /users/me` soft-deletes the account
- 90-day grace period for reactivation
- After 90 days, permanent deletion via cron job

### Permanent Deletion Process
```
1. User requests deletion → Account status = 'deleted'
2. Immediate effects:
   - Login disabled
   - Profile hidden from search
   - Interests/matches archived
   - Conversations closed
3. 90-day grace period:
   - User can reactivate by logging in
   - Data retained for recovery
4. After 90 days:
   - Personal data permanently deleted
   - Messages anonymized (content removed, metadata kept)
   - Payment records retained (legal requirement)
   - Audit logs retained
5. Confirmation email sent after permanent deletion
```

### Types of Data Deleted
| Data Type | Deletion Action |
|-----------|----------------|
| User account | Permanently deleted |
| Profile details | Permanently deleted |
| Photos/Videos | Deleted from S3 + DB |
| Messages | Content deleted, metadata anonymized |
| Interests/Matches | Archived (no PII) |
| Device tokens | Deleted |
| Sessions | Deleted |
| Activity logs | Anonymized |
| GDPR consents | Deleted |

### Data Retained (Anonymized)
| Data Type | Retention Reason | Retention Period |
|-----------|-----------------|------------------|
| Payment records | Tax/legal compliance | 7 years |
| Audit logs | Security/legal | 3 years |
| Conversation metadata | Platform integrity | 5 years (anonymized) |
| Anonymized analytics | Product improvement | Indefinite |

## Data Retention Policies

### Automated Cleanup Jobs

| Job | Schedule | Action |
|-----|----------|--------|
| Pending account cleanup | Daily | Delete unverified accounts > 30 days old |
| Soft-deleted cleanup | Daily | Permanently delete accounts > 90 days post-deletion |
| Expired OTP cleanup | Continuous | Redis TTL auto-expiry |
| Expired sessions cleanup | Continuous | Redis TTL auto-expiry |
| Old activity logs | Monthly | Archive logs > 12 months |
| Old search history | Weekly | Delete search history > 30 days |
| Expired subscriptions | Daily | Mark subscriptions as expired, revoke benefits |
| Data retention enforcement | Weekly | Apply retention policies across all data stores |

### Notification Preferences
Users can control notification channels per type:

```json
{
  "match": { "email": true, "push": true, "sms": false },
  "message": { "email": false, "push": true, "sms": false },
  "interest": { "email": true, "push": true, "sms": false },
  "payment": { "email": true, "push": false, "sms": false },
  "promotional": { "email": false, "push": false, "sms": false },
  "reminder": { "email": true, "push": true, "sms": true }
}
```
