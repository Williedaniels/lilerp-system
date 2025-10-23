# LILERP API Documentation

## 🔗 Base URL

```sh
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication using JWT tokens.

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "phone": "+231123456789",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "phone": "+231123456789",
    "role": "user"
  }
}
```

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "phone": "+231123456789",
  "password": "password123",
  "name": "John Doe",
  "village": "Ganta"
}
```

## IVR Endpoints

### Voice Webhook

```http
POST /ivr/voice
Content-Type: application/x-www-form-urlencoded

# Twilio sends voice call data
CallSid=CA123456789
From=+231123456789
To=+231987654321
Digits=1
```

**Response (TwiML):**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Thank you for reporting a land dispute. Please describe your location after the beep.</Say>
    <Record maxLength="60" action="/api/ivr/recording" />
</Response>
```

### SMS Webhook

```http
POST /ivr/sms
Content-Type: application/x-www-form-urlencoded

MessageSid=SM123456789
From=+231123456789
To=+231987654321
Body=Emergency at Ganta village
```

### Recording Handler

```http
POST /ivr/recording
Content-Type: application/x-www-form-urlencoded

CallSid=CA123456789
RecordingUrl=https://api.twilio.com/recordings/RE123456789
RecordingDuration=45
```

## Incident Management

### Create Incident

```http
POST /incidents
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "Land Boundary Dispute",
  "urgency": "Medium",
  "location": "Ganta Village, Nimba County",
  "description": "Boundary dispute with neighbor over ancestral land",
  "coordinates": {
    "latitude": 7.2334,
    "longitude": -8.9772
  }
}
```

**Response:**

```json
{
  "success": true,
  "incident": {
    "id": 123,
    "type": "Land Boundary Dispute",
    "urgency": "Medium",
    "status": "Open",
    "location": "Ganta Village, Nimba County",
    "description": "Boundary dispute with neighbor over ancestral land",
    "coordinates": {
      "latitude": 7.2334,
      "longitude": -8.9772
    },
    "reporterId": 1,
    "createdAt": "2025-09-26T10:30:00Z",
    "updatedAt": "2025-09-26T10:30:00Z"
  }
}
```

### Get Incidents

```http
GET /incidents?page=1&limit=10&status=Open&urgency=High
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "incidents": [
    {
      "id": 123,
      "type": "Land Boundary Dispute",
      "urgency": "Medium",
      "status": "Open",
      "location": "Ganta Village",
      "createdAt": "2025-09-26T10:30:00Z",
      "reporter": {
        "name": "John Doe",
        "phone": "+231123456789"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Get Single Incident

```http
GET /incidents/123
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "incident": {
    "id": 123,
    "type": "Land Boundary Dispute",
    "urgency": "Medium",
    "status": "Open",
    "location": "Ganta Village, Nimba County",
    "description": "Boundary dispute with neighbor over ancestral land",
    "coordinates": {
      "latitude": 7.2334,
      "longitude": -8.9772
    },
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "phone": "+231123456789",
      "village": "Ganta"
    },
    "responses": [
      {
        "id": 1,
        "message": "Chief has been notified and will visit tomorrow",
        "responderId": 2,
        "responder": {
          "name": "Chief Moses",
          "role": "Traditional Chief"
        },
        "createdAt": "2025-09-26T11:00:00Z"
      }
    ],
    "createdAt": "2025-09-26T10:30:00Z",
    "updatedAt": "2025-09-26T11:00:00Z"
  }
}
```

### Update Incident Status

```http
PUT /incidents/123/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "In Progress",
  "notes": "Traditional chief is investigating the matter"
}
```

## Responder Management

### Get Responders

```http
GET /responders?type=chief&location=Nimba
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "responders": [
    {
      "id": 1,
      "name": "Chief Moses Karnley",
      "role": "Traditional Chief",
      "phone": "+231987654321",
      "email": "chief.moses@example.com",
      "location": "Ganta District",
      "isActive": true,
      "specialties": ["Land Disputes", "Community Mediation"]
    }
  ]
}
```

### Create Responder

```http
POST /responders
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Chief Moses Karnley",
  "role": "Traditional Chief",
  "phone": "+231987654321",
  "email": "chief.moses@example.com",
  "location": "Ganta District",
  "specialties": ["Land Disputes", "Community Mediation"]
}
```

### Notify Responders

```http
POST /responders/notify
Authorization: Bearer <token>
Content-Type: application/json

{
  "incidentId": 123,
  "responderIds": [1, 2, 3],
  "message": "Urgent land dispute requires immediate attention",
  "methods": ["sms", "call", "email"]
}
```

## Response Management

### Add Response

```http
POST /incidents/123/responses
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I will visit the location tomorrow morning to mediate",
  "estimatedArrival": "2025-09-27T08:00:00Z",
  "actionTaken": "Scheduled mediation session"
}
```

**Response:**

```json
{
  "success": true,
  "response": {
    "id": 1,
    "incidentId": 123,
    "responderId": 2,
    "message": "I will visit the location tomorrow morning to mediate",
    "estimatedArrival": "2025-09-27T08:00:00Z",
    "actionTaken": "Scheduled mediation session",
    "createdAt": "2025-09-26T11:30:00Z"
  }
}
```

### Get Responses

```http
GET /incidents/123/responses
Authorization: Bearer <token>
```

## Analytics & Reports

### Dashboard Statistics

```http
GET /analytics/dashboard
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalIncidents": 156,
    "openIncidents": 23,
    "resolvedIncidents": 133,
    "averageResponseTime": "1.5 hours",
    "incidentsByType": {
      "Land Boundary Dispute": 89,
      "Property Conflict": 34,
      "Inheritance Dispute": 23,
      "Violence/Threats": 10
    },
    "incidentsByUrgency": {
      "High": 15,
      "Medium": 67,
      "Low": 74
    },
    "responsesByLocation": {
      "Ganta": 45,
      "Sanniquellie": 32,
      "Tappita": 28,
      "Other": 51
    }
  }
}
```

### Monthly Report

```http
GET /analytics/monthly?year=2025&month=9
Authorization: Bearer <token>
```

## Notification System

### Send Notification

```http
POST /notifications/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipients": ["+231123456789", "+231987654321"],
  "message": "New land dispute reported in your area",
  "type": "sms",
  "priority": "high",
  "incidentId": 123
}
```

### Get Notification History

```http
GET /notifications?page=1&limit=20
Authorization: Bearer <token>
```

## Location Services

### Geocode Address

```http
POST /location/geocode
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "Ganta Village, Nimba County, Liberia"
}
```

**Response:**

```json
{
  "success": true,
  "coordinates": {
    "latitude": 7.2334,
    "longitude": -8.9772
  },
  "formattedAddress": "Ganta, Nimba County, Liberia"
}
```

### Reverse Geocode

```http
POST /location/reverse-geocode
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 7.2334,
  "longitude": -8.9772
}
```

## Search & Filtering

### Search Incidents

```http
GET /search/incidents?q=boundary&location=Ganta&dateFrom=2025-09-01&dateTo=2025-09-30
Authorization: Bearer <token>
```

### Advanced Filters

```http
POST /incidents/filter
Authorization: Bearer <token>
Content-Type: application/json

{
  "filters": {
    "type": ["Land Boundary Dispute", "Property Conflict"],
    "urgency": ["High", "Medium"],
    "status": ["Open", "In Progress"],
    "location": "Nimba County",
    "dateRange": {
      "start": "2025-09-01",
      "end": "2025-09-30"
    },
    "coordinates": {
      "center": {
        "latitude": 7.2334,
        "longitude": -8.9772
      },
      "radius": 10000
    }
  },
  "sort": {
    "field": "createdAt",
    "order": "desc"
  },
  "pagination": {
    "page": 1,
    "limit": 20
  }
}
```

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "phone": "Phone number is required",
      "urgency": "Urgency must be High, Medium, or Low"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Too many requests
- `SERVER_ERROR` - Internal server error

## Rate Limiting

All endpoints are rate limited:

- **Authentication:** 5 requests per minute
- **IVR Webhooks:** 100 requests per minute
- **General API:** 60 requests per minute
- **Search/Analytics:** 30 requests per minute

Rate limit headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1632150000
```

## Webhooks

### Incident Status Change

```http
POST https://your-webhook-url.com/incident-status
Content-Type: application/json

{
  "event": "incident.status_changed",
  "data": {
    "incidentId": 123,
    "oldStatus": "Open",
    "newStatus": "Resolved",
    "changedBy": {
      "id": 2,
      "name": "Chief Moses",
      "role": "Traditional Chief"
    },
    "timestamp": "2025-09-26T15:30:00Z"
  }
}
```

### New Response Added

```http
POST https://your-webhook-url.com/new-response
Content-Type: application/json

{
  "event": "response.created",
  "data": {
    "responseId": 1,
    "incidentId": 123,
    "responder": {
      "id": 2,
      "name": "Chief Moses",
      "role": "Traditional Chief"
    },
    "message": "Mediation session scheduled for tomorrow",
    "timestamp": "2025-09-26T11:30:00Z"
  }
}
```

---

## Testing

### Test with cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+231123456789", "password": "password123"}'

# Create incident
curl -X POST http://localhost:3001/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "Land Boundary Dispute",
    "urgency": "Medium",
    "location": "Ganta Village",
    "description": "Test incident"
  }'
```

### Postman Collection

Import the provided Postman collection for comprehensive API testing.

---

**Note:** Replace `YOUR_TOKEN` with actual JWT tokens obtained from the login endpoint. All timestamps are in ISO 8601 format (UTC).
