# Profiles API

All endpoints prefixed with: `/api/v1/profiles`

All endpoints require JWT Bearer token authentication (except `GET /profiles/:id` which is public).

## GET /profiles/me

Get the authenticated user's complete profile including all detail sections.

### Headers
```
Authorization: Bearer <access_token>
```

### Success Response (200)
Returns the full profile with basic info, professional details, education, family, lifestyle, languages, horoscope, preferences, and photos.

## PUT /profiles/me/basic

Update basic profile information.

### Request Body (`BasicProfileDto`)
```json
{
  "maritalStatus": "never_married",
  "height": 175,
  "weight": 70,
  "bodyType": "average",
  "complexion": "fair",
  "physicalStatus": "normal",
  "bloodGroup": "O+",
  "religion": "hindu",
  "motherTongue": "hindi",
  "community": "brahmin",
  "subCommunity": "kanyakubj",
  "gothra": "bhardwaj",
  "country": "india",
  "state": "uttar_pradesh",
  "city": "lucknow",
  "citizenship": "india",
  "about": "I am a software engineer working at a top tech company..."
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Basic profile updated",
  "data": { ... }
}
```

## PUT /profiles/me/professional

Update professional details.

### Request Body
```json
{
  "highestEducation": "bachelors",
  "college": "Indian Institute of Technology",
  "employedIn": "private",
  "occupation": "Software Engineer",
  "organization": "Google",
  "annualIncome": 2500000,
  "workMode": "remote"
}
```

## PUT /profiles/me/education

Update education details (array of records).

### Request Body
```json
[
  {
    "degree": "B.Tech",
    "field": "Computer Science",
    "institution": "IIT Bombay",
    "year": 2017
  }
]
```

## PUT /profiles/me/family

Update family details.

### Request Body
```json
{
  "familyType": "nuclear",
  "familyStatus": "upper_middle_class",
  "familyValues": "moderate",
  "familyLocation": "lucknow",
  "fatherOccupation": "business",
  "motherOccupation": "homemaker",
  "brothers": 1,
  "sisters": 1
}
```

## PUT /profiles/me/lifestyle

Update lifestyle details.

### Request Body
```json
{
  "diet": "vegetarian",
  "smoking": "no",
  "drinking": "no",
  "hobbies": ["reading", "traveling", "hiking"]
}
```

## PUT /profiles/me/languages

Update languages spoken.

### Request Body
```json
{
  "languages": [
    { "name": "hindi", "proficiency": "native" },
    { "name": "english", "proficiency": "fluent" }
  ]
}
```

## PUT /profiles/me/horoscope

Update horoscope/astro details.

### Request Body
```json
{
  "rashi": "mesha",
  "nakshatra": "ashwini",
  "manglik": false,
  "timeOfBirth": "10:30",
  "placeOfBirth": "lucknow",
  "zodiac": "aries"
}
```

## PUT /profiles/me/preferences

Update partner preferences.

### Request Body
```json
{
  "ageMin": 25,
  "ageMax": 32,
  "heightMin": 160,
  "heightMax": 180,
  "maritalStatus": ["never_married"],
  "religion": ["hindu"],
  "motherTongue": ["hindi", "english"],
  "community": ["brahmin"],
  "education": ["bachelors", "masters"],
  "occupation": ["software_engineer", "product_manager"],
  "annualIncomeMin": 1000000,
  "diet": ["vegetarian"],
  "smoking": ["no"],
  "drinking": ["no"],
  "country": ["india"],
  "state": ["uttar_pradesh"]
}
```

## POST /profiles/me/photos

Upload a profile photo (multipart/form-data).

### Headers
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

### Request Body
| Field | Type | Description |
|-------|------|-------------|
| `photo` | file | Image file (JPG, PNG, max 5MB) |

### Success Response (201)
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "id": 1,
    "url": "https://media.itconnectmatrimony.com/photos/abc123.jpg",
    "isPrimary": false
  }
}
```

## DELETE /profiles/me/photos/:id

Delete a profile photo.

Success Response: 204 No Content

## PUT /profiles/me/photos/:id/primary

Set a photo as the primary profile photo.

## POST /profiles/me/videos

Upload a profile video (multipart/form-data).

| Field | Type | Description |
|-------|------|-------------|
| `video` | file | Video file (MP4, max 50MB) |

## DELETE /profiles/me/videos/:id

Delete a profile video.

Success Response: 204 No Content

## GET /profiles/:id

View a public profile by user ID.

This endpoint records a profile view for analytics.

### Success Response (200)
Returns the public profile view (limited fields compared to own profile).

## GET /profiles/me/completion

Get profile completion percentage.

### Success Response (200)
```json
{
  "completionPercentage": 75
}
```

Completion is calculated based on how many profile sections are filled (basic, professional, education, family, lifestyle, languages, horoscope, preferences, photos).
