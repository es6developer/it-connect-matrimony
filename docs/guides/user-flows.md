# User Flow Diagrams

## Registration Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Visit   │     │ Fill     │     │ Submit   │     │ Verify   │     │ Create   │
│  Landing │────▶│ Register │────▶│ & Check  │────▶│ Email    │────▶│ Profile  │
│  Page    │     │ Form     │     │ Validity │     │ (Click   │     │ (Wizard) │
└──────────┘     └──────────┘     └──────────┘     │  Link)   │     └──────────┘
                                                    └──────────┘
       │                                                 │
       │  ┌─────────────────────────────┐                │
       │  │ Validation:                 │                │
       │  │ - Email format & uniqueness │                │
       │  │ - Phone format (optional)   │                │
       │  │ - Password strength         │                │
       │  │ - Required fields present   │                │
       │  └─────────────────────────────┘                │
       ▼                                                 ▼
┌──────────────────────────┐                ┌──────────────────────────┐
│ Duplicate Email/Phone   ?│──YES──▶ Error  │                          │
│ (409 Conflict)           │        Message │  OR: Skip email verify   │
└──────────────────────────┘                │  with phone OTP login    │
       │ NO                                 └──────────────────────────┘
       ▼
┌──────────────────────────┐
│  User created            │
│  Status: PENDING         │
│  Email verification sent │
└──────────────────────────┘
```

### Alternative Flow: Phone OTP Registration
```
1. Enter phone number → Request OTP
2. Receive OTP via SMS
3. Enter OTP → Verify → Account created (ACTIVE status)
4. User can add email later for verification
```

## Profile Creation Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Start    │     │ Basic    │     │Profession-│     │Education │     │ Family   │
│ Wizard   │────▶│ Info     │────▶│ al        │────▶│ Details  │────▶│ Details  │
└──────────┘     │(Step 1)  │     │(Step 2)  │     │(Step 3)  │     │(Step 4)  │
                 └──────────┘     └──────────┘     └──────────┘     └──────────┘

                  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
                  │ Lifestyle│     │ Languages│     │Horoscope │     │Partner   │
                  │(Step 5)  │────▶│(Step 6)  │────▶│(Step 7)  │────▶│Prefer-   │
                  └──────────┘     └──────────┘     └──────────┘     │ences     │
                                                                     │(Step 8)  │
                  ┌──────────┐     ┌──────────┐                      └──────────┘
                  │ Profile  │     │ Photo    │                           │
                  │ Preview  │◀────│ Upload   │◀─────────────────────────┘
                  │(Step 10) │     │(Step 9)  │
                  └──────────┘     └──────────┘
                       │
                       ▼
                  ┌──────────┐
                  │ Profile  │
                  │ Published│
                  │ +100%    │
                  │ Complete │
                  └──────────┘
```

### Profile Sections
| Step | Section | Fields | Required |
|------|---------|--------|----------|
| 1 | Basic | marital status, height, weight, religion, community, location, about | Yes |
| 2 | Professional | occupation, organization, income, work mode | Yes |
| 3 | Education | degree, field, institution, year | No |
| 4 | Family | family type, status, values, siblings | No |
| 5 | Lifestyle | diet, smoking, drinking, hobbies | No |
| 6 | Languages | languages with proficiency | No |
| 7 | Horoscope | rashi, nakshatra, manglik, time/place of birth | No |
| 8 | Preferences | partner age range, education, income, location, etc. | No |
| 9 | Photos | Profile photos (at least 1, up to 10) | Yes (1) |
| 10 | Preview | Final review before publishing | - |

## Search & Discovery Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │ Apply    │     │ Browse   │     │ View     │     │ Send     │
│ Visits   │────▶│ Filters  │────▶│ Search   │────▶│ Profile  │────▶│ Interest │
│ Search   │     │          │     │ Results  │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                                          │
                    ┌──────────────────────────────────────────────────────┘
                    │                     │                     │
                    ▼                     ▼                     ▼
           ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
           │ Save Search  │    │ View Photo   │    │ Share        │
           │ (bookmark)   │    │ Gallery      │    │ Profile      │
           └──────────────┘    └──────────────┘    └──────────────┘
```

### Available Filters (20+)
| Category | Filters |
|----------|---------|
| Basic | Gender, Age range, Marital status |
| Religion | Religion, Mother tongue, Community, Sub-community, Gothra |
| Location | Country, State, City, Citizenship |
| Professional | Education, Occupation, Organization, Annual income, Work mode |
| Lifestyle | Diet, Smoking, Drinking, Hobbies |
| Physical | Height range, Weight range, Body type, Complexion, Physical status |
| Profile | Has photo, Is verified, Online now |

## Interest & Match Flow

```
User A finds User B's profile
            │
            ▼
    ┌───────────────┐
    │ A sends       │
    │ interest to B │
    │ with message  │
    └───────┬───────┘
            │
            ▼
    ┌──────────────────────────────────┐
    │ Notification sent to User B:     │
    │ "You received an interest from A"│
    └──────────────────────────────────┘
            │
            ▼
        ┌───────┐
        │  B    │
        │views  │
        │interest│
        └───┬───┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
┌──────────┐  ┌──────────┐
│ Accept   │  │ Decline  │
└────┬─────┘  └────┬─────┘
     │             │
     ▼             ▼
┌──────────┐  ┌──────────┐
│ Match    │  │ Interest │
│ Created! │  │ Closed   │
│          │  │          │
│ Both     │  │ B can    │
│ notified │  │ change   │
│          │  │ later    │
│ Can chat │  │          │
└──────────┘  └──────────┘
```

### Interest States
```
Sent ──▶ Accepted ──▶ Match Created
  │                      │
  ├──▶ Declined          ├──▶ Chat enabled
  │                      │
  └──▶ Withdrawn         └──▶ Can unmatch
```

## Chat Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Match   │     │ Open     │     │ Send     │     │ Real-time │
│ Created  │────▶│ Chat     │────▶│ Message  │────▶│ Delivery  │
└──────────┘     │ Window   │     │(REST or  │     │(WebSocket)│
                 └──────────┘     │ WebSocket)│    └──────────┘
                                  └──────────┘          │
                                                         │
                    ┌────────────────────────────────────┘
                    │              │              │
                    ▼              ▼              ▼
           ┌──────────────┐ ┌──────────┐ ┌──────────────┐
           │ Typing       │ │ File/    │ │ Read         │
           │ Indicator    │ │ Image    │ │ Receipt      │
           │ (WebSocket)  │ │ Upload   │ │ (WebSocket)  │
           └──────────────┘ └──────────┘ └──────────────┘
```

### WebSocket Events Sequence
```
1. Client connects with JWT →
2. Server authenticates, joins user:{uuid} room
3. Client emits conversation:join { conversationId }
4. Server joins conversation:{id} room
5. Client emits message:send { conversationId, content }
6. Server saves message to DB
7. Server broadcasts message:new to conversation room
8. Recipient receives message in real-time
9. Client emits message:read { conversationId }
10. Server broadcasts message:read to conversation room
```

## Subscription Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Browse  │     │ Select   │     │ Apply    │     │ Choose   │
│  Plans   │────▶│ Plan     │────▶│ Coupon   │────▶│ Gateway  │
└──────────┘     │(Basic/   │     │(optional)│     │(Razorpay/│
                 │ Premium/ │     └──────────┘     │ Stripe)  │
                 │ VIP)     │                      └──────────┘
                 └──────────┘                           │
                                                         ▼
                                                  ┌──────────┐
                                                  │ Payment  │
                                                  │ Gateway  │
                                                  │ Checkout │
                                                  └────┬─────┘
                                                       │
                                            ┌──────────┴──────────┐
                                            │                     │
                                            ▼                     ▼
                                     ┌────────────┐      ┌────────────┐
                                     │ Payment    │      │ Payment    │
                                     │ Successful │      │ Failed     │
                                     └──────┬─────┘      └────────────┘
                                            │                   │
                                            ▼                   ▼
                                     ┌────────────┐      ┌────────────┐
                                     │ Subscription│     │ Retry /   │
                                     │ Activated   │     │ Change Plan│
                                     │ (30/90/365  │     └────────────┘
                                     │  days)      │
                                     └──────┬────-┘
                                            │
                                     ┌──────┴──────┐
                                     │             │
                                     ▼             ▼
                               ┌──────────┐ ┌──────────┐
                               │ Auto-    │ │ Cancel   │
                               │ Renew    │ │ (ends at │
                               │ (on)     │ │ period)  │
                               └──────────┘ └──────────┘
```

### Plan Features

| Feature | Free | Basic (₹499/mo) | Premium (₹999/mo) | VIP (₹2,499/mo) |
|---------|------|-----------------|-------------------|------------------|
| Daily interests | 5 | Unlimited | Unlimited | Unlimited |
| Chat | ✗ | ✓ | ✓ | ✓ |
| Photo upload | 3 | 10 | 10 | 20 |
| Advanced filters | ✗ | ✗ | ✓ | ✓ |
| Profile badge | ✗ | ✗ | Premium | VIP |
| Priority support | ✗ | ✗ | ✓ | ✓ |
| Incognito mode | ✗ | ✗ | ✗ | ✓ |
| Profile boost | ✗ | ✗ | ✗ | ✓ |
| Relationship manager | ✗ | ✗ | ✗ | ✓ |
| See who viewed you | Last 5 | Last 20 | All | All + timestamps |

## Admin Moderation Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Report  │     │ Report   │     │ Review   │     │ Take     │
│  Created │────▶│ Assigned │────▶│ Evidence │────▶│ Action   │
│  by User │     │ (auto)   │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘     └────┬─────┘
                                                          │
                                      ┌───────────────────┼───────────────────┐
                                      │                   │                   │
                                      ▼                   ▼                   ▼
                               ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                               │ Warn User    │  │ Suspend      │  │ Ban User     │
                               │ (message)    │  │ (7-30 days)  │  │ (permanent)  │
                               └──────────────┘  └──────────────┘  └──────────────┘
                                      │                   │                   │
                                      └───────────────────┼───────────────────┘
                                                          │
                                                          ▼
                                                   ┌──────────────┐
                                                   │ Report       │
                                                   │ Resolved     │
                                                   │ + Audit Log  │
                                                   └──────────────┘
```

### Admin Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  Admin Dashboard                                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Users    │  │ Active   │  │ New Users│  │ Revenue  │   │
│  │ 150,000  │  │ 12,000   │  │ 250 today│  │ ₹5,00,000│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │ User Growth Chart (Last 30 days)                       │ │
│  │ ████████████████████████████████████████████████████   │ │
│  └────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Pending Actions:                                           │
│  ■ 45 New Reports to review                                │
│  ■ 150 Pending Photo Verifications                         │
│  ■ 12 Open Support Tickets                                 │
│  ■ 5 Pending Refund Requests                               │
└─────────────────────────────────────────────────────────────┘
```

### Report Types
| Type | Description | Auto-Action |
|------|-------------|-------------|
| Fake profile | Suspicious or fraudulent profile | Flag for review |
| Inappropriate photo | NSFW or offensive images | Auto-hide photo, flag for review |
| Harassment | Abusive messages or behavior | Log evidence, notify admin |
| Spam | Promotional or spam content | Auto-hide, flag user |
| Impersonation | Pretending to be someone else | Immediate suspension |
| Underage | User below minimum age | Immediate suspension |
