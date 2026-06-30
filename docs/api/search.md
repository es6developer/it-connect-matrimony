# Search & Matchmaking API

Endpoints are organized under search, interests, matches, and recommendations. All require JWT Bearer token.

## Search

### GET /search

Search profiles with filters. Powered by Elasticsearch for fast, filtered results.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Free-text search (name, occupation, etc.) |
| `gender` | enum | `male`, `female`, `other` |
| `ageMin` | integer | Minimum age |
| `ageMax` | integer | Maximum age |
| `religion` | string | Religion filter |
| `motherTongue` | string | Mother tongue filter |
| `community` | string | Community/caste |
| `maritalStatus` | enum | `never_married`, `divorced`, `widowed`, `separated` |
| `country` | string | Country |
| `state` | string | State |
| `city` | string | City |
| `education` | string | Education keyword |
| `occupation` | string | Occupation keyword |
| `minIncome` | number | Minimum annual income |
| `maxIncome` | number | Maximum annual income |
| `diet` | enum | `vegetarian`, `non_vegetarian`, `vegan`, `jain` |
| `smoking` | enum | `yes`, `no`, `occasionally` |
| `drinking` | enum | `yes`, `no`, `socially` |
| `hasPhoto` | boolean | Only profiles with photos |
| `isVerified` | boolean | Only verified profiles |
| `onlineNow` | boolean | Only currently online users |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 20, max: 100) |
| `sortBy` | string | Sort field: `age`, `createdAt`, `lastActiveAt` |
| `sortOrder` | string | `ASC` or `DESC` |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Search results",
  "data": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "Jane",
      "lastName": "Doe",
      "age": 28,
      "religion": "hindu",
      "motherTongue": "hindi",
      "occupation": "Software Engineer",
      "city": "bangalore",
      "state": "karnataka",
      "hasPhoto": true,
      "isVerified": false,
      "lastActiveAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 234,
    "page": 1,
    "limit": 20,
    "totalPages": 12,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Saved Searches

#### POST /search/saved
Save a search query for later use.
```json
{
  "name": "Bangalore IT Professionals",
  "filters": { "city": "bangalore", "occupation": "software_engineer" }
}
```

#### GET /search/saved
Get all saved searches for the current user.

#### DELETE /search/saved/:id
Delete a saved search.

### Search History

#### GET /search/history
Get search history (paginated).

#### DELETE /search/history
Clear all search history.

---

## Interests

### POST /interests

Send an interest to another user.

#### Request Body
```json
{
  "toUserId": 42,
  "message": "Hi, I liked your profile. Would you like to connect?"
}
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Interest sent successfully",
  "data": {
    "id": 1,
    "fromUserId": 1,
    "toUserId": 42,
    "status": "sent",
    "message": "Hi, I liked your profile...",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### GET /interests/sent
Get all interests sent by the current user (paginated).

### GET /interests/received
Get all interests received by the current user (paginated).

### PATCH /interests/:id/accept
Accept an interest. Creates a match record automatically.

### PATCH /interests/:id/reject
Reject an interest.

### PATCH /interests/:id/cancel
Cancel a sent interest (only if status is `sent`).

### GET /interests/:id
Get interest details.

---

## Matches

### GET /matches
Get all matches for the current user (paginated).

### GET /matches/new
Get matches created today.

### GET /matches/suggestions
Get AI-based match suggestions. Uses compatibility scoring algorithm.

| Query Parameter | Type | Default | Description |
|----------------|------|---------|-------------|
| `limit` | integer | 10 | Number of suggestions |

### GET /matches/:id
Get match details.

### DELETE /matches/:id
Unmatch a user. Removes the match but keeps conversation.

Success Response: 204 No Content

---

## Recommendations

### GET /recommendations/daily
Get daily match recommendations. Recommendations are computed via cron job and cached per user.

### POST /recommendations/dismiss
Dismiss a specific recommendation to improve future suggestions.

#### Request Body
```json
{
  "recommendationId": 42
}
```

---

## Compatibility Scoring

The matchmaking system calculates a compatibility score between users based on:

| Factor | Weight | Description |
|--------|--------|-------------|
| Age compatibility | 15% | Age difference preference matching |
| Location | 10% | Same city/state preference |
| Religion/Community | 15% | Religious and community alignment |
| Education | 10% | Educational background match |
| Occupation | 10% | Career field compatibility |
| Income range | 5% | Income bracket similarity |
| Lifestyle | 15% | Diet, smoking, drinking habits |
| Family values | 10% | Family type, values alignment |
| Horoscope | 5% | Astrological compatibility (if both provided) |
| Mutual interests | 5% | Hobbies and interests overlap |

Scores range from 0-100%. Suggestions show profiles with >60% compatibility by default.
