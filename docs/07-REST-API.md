# 07-REST-API.md

**Version:** 1.0.0
**Status:** Draft
**Reference:** PRD v1.0, SRS v1.0

---

# Table of Contents

1. [API Overview](#1-api-overview)
2. [Conventions](#2-conventions)
3. [Authentication](#3-authentication)
4. [Auth Endpoints](#4-auth-endpoints)
5. [User Endpoints](#5-user-endpoints)
6. [Project Endpoints](#6-project-endpoints)
7. [Media & Upload Endpoints](#7-media--upload-endpoints)
8. [AI Endpoints](#8-ai-endpoints)
9. [Timeline Endpoints](#9-timeline-endpoints)
10. [Rendering Endpoints](#10-rendering-endpoints)
11. [Publishing Endpoints](#11-publishing-endpoints)
12. [Billing Endpoints](#12-billing-endpoints)
13. [Analytics Endpoints](#13-analytics-endpoints)
14. [Notification Endpoints](#14-notification-endpoints)
15. [WebSocket Events](#15-websocket-events)
16. [Admin Endpoints](#16-admin-endpoints)

---

# 1. API Overview

## Base URL

```
Production:  https://api.aivideoclipper.com/api/v1
Staging:     https://staging-api.aivideoclipper.com/api/v1
Local:       http://localhost:3000/api/v1
```

## Content Type

```
Content-Type: application/json
Accept: application/json
```

## API Versioning

```
Version embedded in URL path: /api/v1/

Breaking changes → new version (v2)
Non-breaking → same version
```

---

# 2. Conventions

## 2.1 HTTP Methods

| Method | Usage |
|--------|-------|
| GET | Retrieve resource(s) |
| POST | Create resource / trigger action |
| PATCH | Partial update resource |
| PUT | Full replace resource |
| DELETE | Soft delete resource |

## 2.2 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK — Success |
| 201 | Created — Resource created |
| 202 | Accepted — Async job accepted |
| 204 | No Content — Success, no body |
| 400 | Bad Request — Validation error |
| 401 | Unauthorized — Missing/invalid token |
| 403 | Forbidden — Insufficient permissions |
| 404 | Not Found — Resource doesn't exist |
| 409 | Conflict — Duplicate resource |
| 422 | Unprocessable Entity — Business rule violation |
| 429 | Too Many Requests — Rate limited |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## 2.3 Standard Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  },
  "requestId": "req_abc123"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email format is invalid",
    "details": [
      {
        "field": "email",
        "message": "Must be valid email address"
      }
    ],
    "requestId": "req_abc123"
  }
}
```

## 2.4 Error Codes

```
AUTH_INVALID_CREDENTIALS
AUTH_TOKEN_EXPIRED
AUTH_TOKEN_INVALID
AUTH_EMAIL_EXISTS
AUTH_EMAIL_NOT_VERIFIED

USER_NOT_FOUND
USER_SUSPENDED

PROJECT_NOT_FOUND
PROJECT_LIMIT_EXCEEDED

UPLOAD_FAILED
UPLOAD_SIZE_EXCEEDED
UPLOAD_FORMAT_UNSUPPORTED
UPLOAD_CHUNK_INVALID

AI_JOB_NOT_FOUND
AI_PROVIDER_UNAVAILABLE
AI_PROCESSING_FAILED

CREDIT_INSUFFICIENT
SUBSCRIPTION_EXPIRED
SUBSCRIPTION_REQUIRED

RATE_LIMIT_EXCEEDED
VALIDATION_ERROR
NOT_FOUND
FORBIDDEN
INTERNAL_ERROR
```

## 2.5 Pagination

```
Query Parameters:
  page      — Page number (default: 1)
  pageSize  — Items per page (default: 20, max: 100)
  sortBy    — Sort field (default: created_at)
  sortOrder — asc | desc (default: desc)

Response includes meta object with pagination info.
```

## 2.6 Filtering

```
Common filters:
  status     — Filter by status
  search     — Full-text search
  dateFrom   — ISO 8601 datetime
  dateTo     — ISO 8601 datetime
```

## 2.7 Rate Limiting

```
Headers returned on every response:
  X-RateLimit-Limit:     100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset:     1690000000

Limits by endpoint type:
  Auth endpoints:       10 req/min per IP
  AI endpoints:         30 req/min per user
  Upload endpoints:     100 req/min per user
  General API:          1000 req/min per user
  Payment endpoints:    5 req/min per user
```

---

# 3. Authentication

## 3.1 Bearer Token

All authenticated endpoints require:

```
Authorization: Bearer <access_token>
```

## 3.2 Token Structure

```
Access Token (JWT):
  • Lifetime: 15 minutes
  • Contains: userId, email, role, permissions
  • Signed: RS256

Refresh Token:
  • Lifetime: 30 days
  • Rotation: New refresh token on each use
  • Stored: Hashed in database (user_sessions)
```

---

# 4. Auth Endpoints

## POST /auth/register

Register a new user account.

```
Request:
{
  "email": "user@example.com",
  "username": "creator123",
  "password": "SecurePass123!",
  "displayName": "Content Creator"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "creator123",
    "status": "pending",
    "emailVerificationRequired": true
  }
}

Response 409:
{
  "success": false,
  "error": {
    "code": "AUTH_EMAIL_EXISTS",
    "message": "Email already registered"
  }
}
```

## POST /auth/login

```
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "Content Creator",
      "avatarUrl": null,
      "subscription": { "plan": "free" },
      "wallet": { "balance": 100 }
    }
  }
}
```

## POST /auth/refresh

```
Request:
{
  "refreshToken": "eyJ..."
}

Response 200:
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",  // new rotated token
    "expiresIn": 900
  }
}
```

## POST /auth/logout

```
Headers: Authorization: Bearer <token>

Response 204: No Content
```

## POST /auth/logout-all

Revoke all sessions across all devices.

```
Response 204: No Content
```

## POST /auth/forgot-password

```
Request:
{
  "email": "user@example.com"
}

Response 200:
{
  "success": true,
  "data": {
    "message": "If email exists, reset link sent"
  }
}
```

## POST /auth/reset-password

```
Request:
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123!"
}

Response 200:
{
  "success": true,
  "data": {
    "message": "Password reset successful"
  }
}
```

## POST /auth/verify-email

```
Request:
{
  "token": "verification_token_from_email"
}

Response 200:
{
  "success": true,
  "data": {
    "message": "Email verified successfully"
  }
}
```

## GET /auth/oauth/google

```
Redirects to Google OAuth consent screen.
```

## GET /auth/oauth/google/callback

```
Query: code, state

Response 200: (same as login response)
```

## GET /auth/oauth/github

```
Redirects to GitHub OAuth consent screen.
```

## GET /auth/oauth/github/callback

```
Query: code, state

Response 200: (same as login response)
```

---

# 5. User Endpoints

## GET /users/me

Get current user profile.

```
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "creator123",
    "displayName": "Content Creator",
    "bio": "Making viral content daily",
    "avatarUrl": "https://...",
    "timezone": "Asia/Jakarta",
    "locale": "id",
    "status": "active",
    "emailVerified": true,
    "createdAt": "2026-01-01T00:00:00Z",
    "subscription": {
      "plan": "pro",
      "status": "active",
      "endDate": "2026-12-31T00:00:00Z"
    },
    "wallet": {
      "balance": 500,
      "currency": "USD"
    }
  }
}
```

## PATCH /users/me

Update profile.

```
Request:
{
  "displayName": "Updated Name",
  "bio": "New bio text",
  "timezone": "Asia/Jakarta",
  "locale": "id"
}

Response 200: (updated user object)
```

## POST /users/me/avatar

Upload avatar.

```
Request: multipart/form-data
  file: <image binary>

Response 200:
{
  "success": true,
  "data": {
    "avatarUrl": "https://..."
  }
}
```

## PUT /users/me/password

Change password.

```
Request:
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}

Response 200:
{
  "success": true,
  "data": { "message": "Password changed" }
}
```

## DELETE /users/me

Soft delete account.

```
Request:
{
  "password": "confirm_password",
  "reason": "optional feedback"
}

Response 204: No Content
```

## GET /users/me/preferences

## PATCH /users/me/preferences

## GET /users/me/notifications/settings

## PATCH /users/me/notifications/settings

## GET /users/me/sessions

List active sessions.

```
Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "device": "Windows Desktop",
      "browser": "Chrome 120",
      "ipAddress": "203.142.82.1",
      "location": "Jakarta, ID",
      "lastActive": "2026-07-16T10:00:00Z",
      "current": true
    }
  ]
}
```

## DELETE /users/me/sessions/:sessionId

Revoke specific session.

---

# 6. Project Endpoints

## GET /projects

List user's projects.

```
Query: page, pageSize, status, search, sortBy, sortOrder

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Podcast Episode 1",
      "description": "...",
      "thumbnailUrl": "https://...",
      "status": "ready",
      "stats": {
        "mediaCount": 2,
        "clipCount": 15,
        "renderCount": 8
      },
      "createdAt": "2026-07-01T00:00:00Z",
      "updatedAt": "2026-07-15T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 45 }
}
```

## POST /projects

```
Request:
{
  "title": "My New Project",
  "description": "Podcast clipping project",
  "settings": {
    "targetPlatform": "tiktok",
    "aspectRatio": "9:16",
    "clipMinDuration": 15,
    "clipMaxDuration": 60
  }
}

Response 201: (project object)
```

## GET /projects/:id

## PATCH /projects/:id

## DELETE /projects/:id

Soft delete.

## POST /projects/:id/duplicate

## POST /projects/:id/archive

## POST /projects/:id/restore

## GET /projects/:id/settings

## PATCH /projects/:id/settings

## GET /projects/:id/history

Project edit history.

## GET /projects/:id/export

Export project as JSON for backup.

---

# 7. Media & Upload Endpoints

## POST /uploads

Create upload session.

```
Request:
{
  "projectId": "uuid",
  "filename": "podcast.mp4",
  "fileSize": 5368709120,
  "mimeType": "video/mp4",
  "checksumSha256": "abc123..."
}

Response 201:
{
  "success": true,
  "data": {
    "uploadId": "uuid",
    "chunkSize": 10485760,
    "totalChunks": 512,
    "uploadUrls": [
      "https://storagesigned.url/chunk/1",
      "https://storagesigned.url/chunk/2"
    ]
  }
}
```

## POST /uploads/:id/chunks

Upload a chunk.

```
Request: multipart/form-data or raw binary
  chunkNumber: 1
  data: <chunk binary>

Response 200:
{
  "success": true,
  "data": {
    "chunkNumber": 1,
    "uploadedChunks": 1,
    "totalChunks": 512,
    "progress": 0.19
  }
}
```

## GET /uploads/:id

Get upload status.

## POST /uploads/:id/complete

Signal upload complete.

```
Response 202:
{
  "success": true,
  "data": {
    "uploadId": "uuid",
    "status": "processing",
    "mediaFileId": null,
    "message": "Upload complete, processing media"
  }
}
```

## POST /uploads/:id/cancel

Cancel ongoing upload.

## GET /projects/:id/media

List media files in project.

```
Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "filename": "podcast.mp4",
      "mediaType": "video",
      "durationMs": 3600000,
      "status": "ready",
      "video": {
        "width": 1920,
        "height": 1080,
        "fps": 30,
        "codec": "h264"
      },
      "thumbnailUrl": "https://...",
      "proxyUrl": "https://...",
      "createdAt": "2026-07-01T00:00:00Z"
    }
  ]
}
```

## GET /media/:id

Get media file details.

## GET /media/:id/stream

Get signed URL for streaming.

## DELETE /media/:id

Remove media from project.

## GET /media/:id/waveform

Get audio waveform data.

---

# 8. AI Endpoints

## POST /ai/jobs

Create a new AI job.

```
Request:
{
  "projectId": "uuid",
  "jobType": "transcribe",
  "mediaFileId": "uuid",
  "options": {
    "language": "auto",
    "provider": "automatic"
  }
}

Response 202:
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "queued",
    "estimatedCredits": 5,
    "estimatedDuration": 120,
    "queuePosition": 3
  }
}
```

## POST /ai/pipeline

Run full AI pipeline on media.

```
Request:
{
  "projectId": "uuid",
  "mediaFileId": "uuid",
  "workflow": "default",
  "options": {
    "targetPlatform": "tiktok",
    "aspectRatio": "9:16",
    "clipCount": 10,
    "generateSubtitles": true,
    "generateThumbnails": true,
    "generateContent": true,
    "languages": ["en"]
  }
}

Response 202:
{
  "success": true,
  "data": {
    "pipelineId": "uuid",
    "jobs": [
      { "jobId": "uuid", "jobType": "transcribe" },
      { "jobId": "uuid", "jobType": "scene_detection" },
      ...
    ],
    "estimatedTotalCredits": 35,
    "estimatedTotalDuration": 300
  }
}
```

## GET /ai/jobs

List AI jobs.

```
Query: projectId, jobType, status, page, pageSize
```

## GET /ai/jobs/:id

Get job details and status.

```
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "jobType": "transcribe",
    "status": "running",
    "progress": 45,
    "provider": "openrouter",
    "model": "whisper-large-v3",
    "startedAt": "2026-07-16T10:00:00Z",
    "estimatedCompletion": "2026-07-16T10:02:00Z",
    "retryCount": 0
  }
}
```

## POST /ai/jobs/:id/cancel

Cancel running job.

## GET /ai/jobs/:id/result

Get job result.

```
Response 200 (for transcript):
{
  "success": true,
  "data": {
    "resultType": "transcript",
    "language": "en",
    "confidence": 0.96,
    "segments": [
      {
        "start": 0,
        "end": 3500,
        "text": "Welcome to today's podcast...",
        "speaker": "Speaker 1",
        "confidence": 0.98
      }
    ]
  }
}
```

## GET /projects/:id/clips

Get detected clips with scores.

```
Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "startMs": 15000,
      "endMs": 55000,
      "durationMs": 40000,
      "viralScore": 92,
      "rank": 1,
      "rankReason": "Strong hook + high emotion",
      "title": "This secret changed everything",
      "thumbnailUrl": "https://...",
      "hasSubtitle": true,
      "hasReframe": true,
      "aspectRatio": "9:16"
    }
  ]
}
```

## GET /projects/:id/transcripts

## GET /projects/:id/subtitles

## POST /projects/:id/subtitles

Generate subtitles for clips.

## GET /projects/:id/thumbnails

## GET /ai/providers

List available AI providers.

```
Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "openrouter",
      "name": "OpenRouter",
      "status": "healthy",
      "models": 25,
      "capabilities": ["transcribe", "translate", "generate"]
    }
  ]
}
```

---

# 9. Timeline Endpoints

## GET /projects/:id/timeline

Get project timeline.

```
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "durationMs": 60000,
    "fps": 30,
    "width": 1080,
    "height": 1920,
    "tracks": [
      {
        "id": "uuid",
        "type": "video",
        "name": "Main Video",
        "clips": [
          {
            "id": "uuid",
            "startMs": 0,
            "endMs": 30000,
            "mediaFileId": "uuid",
            "properties": {}
          }
        ]
      },
      {
        "id": "uuid",
        "type": "subtitle",
        "name": "Captions",
        "clips": []
      }
    ]
  }
}
```

## PUT /projects/:id/timeline

Save full timeline state (autosave).

## POST /projects/:id/timeline/tracks

Add track.

## PATCH /timeline/tracks/:id

## DELETE /timeline/tracks/:id

## POST /timeline/tracks/:id/clips

Add clip to track.

## PATCH /timeline/clips/:id

## DELETE /timeline/clips/:id

## POST /timeline/clips/:id/split

```
Request:
{
  "positionMs": 15000
}
```

## POST /projects/:id/timeline/undo

## POST /projects/:id/timeline/redo

---

# 10. Rendering Endpoints

## GET /render/presets

List render presets.

## POST /render/jobs

Create render job.

```
Request:
{
  "projectId": "uuid",
  "clipId": "uuid",
  "presetId": "uuid",
  "settings": {
    "format": "mp4",
    "resolution": "1080p",
    "fps": 30,
    "codec": "h264",
    "includeSubtitle": true,
    "includeWatermark": false
  },
  "renderType": "local"
}

Response 202:
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "queued",
    "estimatedCredits": 10,
    "estimatedDuration": 180
  }
}
```

## GET /render/jobs

List render jobs.

## GET /render/jobs/:id

```
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "encoding",
    "progress": 65,
    "renderType": "local",
    "startedAt": "2026-07-16T10:00:00Z",
    "export": null
  }
}
```

## POST /render/jobs/:id/cancel

## GET /render/jobs/:id/export

Get render export download URL.

```
Response 200:
{
  "success": true,
  "data": {
    "downloadUrl": "https://signed.url/download.mp4",
    "filename": "clip_001.mp4",
    "sizeBytes": 52428800,
    "expiresAt": "2026-07-16T12:00:00Z"
  }
}
```

## POST /render/batch

Batch render multiple clips.

```
Request:
{
  "projectId": "uuid",
  "clipIds": ["uuid", "uuid", "uuid"],
  "presetId": "uuid"
}
```

---

# 11. Publishing Endpoints

## GET /publish/accounts

List connected social accounts.

```
Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "platform": "youtube",
      "username": "@mychannel",
      "displayName": "My Channel",
      "avatarUrl": "https://...",
      "isConnected": true
    }
  ]
}
```

## GET /publish/oauth/youtube

Initiate YouTube OAuth.

## GET /publish/oauth/youtube/callback

## GET /publish/oauth/tiktok

## GET /publish/oauth/tiktok/callback

## DELETE /publish/accounts/:id

Disconnect social account.

## POST /publish/jobs

Publish or schedule a clip.

```
Request:
{
  "projectId": "uuid",
  "renderExportId": "uuid",
  "accountId": "uuid",
  "title": "This secret changed everything",
  "description": "Full description here...",
  "tags": ["#viral", "#fyp", "#podcast"],
  "privacyStatus": "public",
  "schedule": null,
  "publishNow": true
}

Response 202:
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "publishing"
  }
}
```

## POST /publish/jobs (Scheduled)

```
Request:
{
  ...
  "publishNow": false,
  "schedule": "2026-07-20T18:00:00Z"
}
```

## GET /publish/jobs

List publish jobs.

## GET /publish/jobs/:id

## POST /publish/jobs/:id/retry

Retry failed publish.

## DELETE /publish/jobs/:id

Cancel scheduled publish.

---

# 12. Billing Endpoints

## GET /billing/wallet

Get wallet balance.

```
Response 200:
{
  "success": true,
  "data": {
    "balance": 500,
    "reservedBalance": 20,
    "availableBalance": 480,
    "currency": "USD",
    "totalEarned": 1500,
    "totalSpent": 1000
  }
}
```

## GET /billing/wallet/transactions

```
Query: page, pageSize, type, dateFrom, dateTo

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "consumed",
      "state": "completed",
      "amount": -5,
      "balanceBefore": 505,
      "balanceAfter": 500,
      "description": "Subtitle generation",
      "reference": { "type": "ai_job", "id": "uuid" },
      "createdAt": "2026-07-16T10:00:00Z"
    }
  ]
}
```

## GET /billing/plans

List subscription plans.

```
Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "free",
      "name": "Free",
      "monthlyPrice": 0,
      "yearlyPrice": 0,
      "creditAllocation": 100,
      "features": [...]
    },
    {
      "id": "uuid",
      "code": "pro",
      "name": "Pro",
      "monthlyPrice": 29,
      "yearlyPrice": 290,
      "creditAllocation": 2000,
      "features": [...]
    }
  ]
}
```

## GET /billing/subscription

Get current subscription.

## POST /billing/subscription

Subscribe to a plan.

```
Request:
{
  "planId": "uuid",
  "billingCycle": "monthly",
  "paymentMethodId": "uuid",
  "couponCode": "LAUNCH20"
}

Response 200:
{
  "success": true,
  "data": {
    "subscription": { ... },
    "payment": { "id": "uuid", "status": "pending" }
  }
}
```

## PATCH /billing/subscription

Upgrade/downgrade plan.

## DELETE /billing/subscription

Cancel subscription.

## POST /billing/credits/purchase

Buy credits.

```
Request:
{
  "amount": 500,
  "paymentMethodId": "uuid"
}
```

## GET /billing/payments

List payment history.

## GET /billing/payments/:id

## GET /billing/payments/:id/invoice

Download invoice PDF.

## GET /billing/invoices

List all invoices.

## POST /billing/coupon/validate

```
Request:
{
  "code": "LAUNCH20",
  "planId": "uuid"
}

Response 200:
{
  "success": true,
  "data": {
    "valid": true,
    "discountType": "percentage",
    "discountValue": 20,
    "discountedPrice": 23.2
  }
}
```

## POST /billing/webhook/:provider

Webhook endpoint for payment providers (Stripe, etc.).

```
No auth required (verified by signature)
```

---

# 13. Analytics Endpoints

## GET /analytics/overview

```
Response 200:
{
  "success": true,
  "data": {
    "totalProjects": 45,
    "totalClips": 320,
    "totalRenders": 180,
    "totalCreditsUsed": 4500,
    "creditsUsedThisMonth": 800,
    "aiJobsThisMonth": 240,
    "totalPublishCount": 95
  }
}
```

## GET /analytics/usage

Usage over time.

```
Query: period (daily|monthly), dateFrom, dateTo, metric

Response 200:
{
  "success": true,
  "data": {
    "period": "daily",
    "dataPoints": [
      { "date": "2026-07-01", "creditsUsed": 50, "aiJobs": 15, "renders": 8 },
      { "date": "2026-07-02", "creditsUsed": 65, "aiJobs": 20, "renders": 12 }
    ]
  }
}
```

## GET /analytics/ai-usage

AI usage breakdown by provider/model.

## GET /analytics/render-usage

Render statistics.

## GET /analytics/credits

Credit consumption analysis.

## GET /analytics/projects/:id

Per-project analytics.

---

# 14. Notification Endpoints

## GET /notifications

List notifications.

```
Query: page, pageSize, unreadOnly

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "success",
      "title": "Render Complete",
      "message": "Your clip has been rendered successfully",
      "data": { "renderJobId": "uuid" },
      "readAt": null,
      "createdAt": "2026-07-16T10:00:00Z"
    }
  ],
  "meta": { "unreadCount": 5 }
}
```

## GET /notifications/unread-count

```
Response 200:
{
  "success": true,
  "data": { "count": 5 }
}
```

## POST /notifications/:id/read

Mark as read.

## POST /notifications/read-all

Mark all as read.

## DELETE /notifications/:id

Archive notification.

---

# 15. WebSocket Events

## Connection

```
URL: wss://api.aivideoclipper.com/ws
Auth: ?token=<access_token> or Authorization header

Events flow: Server → Client
```

## Events

### connection.established

```json
{ "event": "connection.established", "data": { "userId": "uuid" } }
```

### job.created

```json
{
  "event": "job.created",
  "data": {
    "jobId": "uuid",
    "jobType": "transcribe",
    "projectId": "uuid"
  }
}
```

### job.progress

```json
{
  "event": "job.progress",
  "data": {
    "jobId": "uuid",
    "progress": 45,
    "stage": "processing",
    "estimatedRemaining": 120000
  }
}
```

### job.completed

```json
{
  "event": "job.completed",
  "data": {
    "jobId": "uuid",
    "jobType": "transcribe",
    "resultSummary": { "segments": 120, "language": "en" },
    "creditsUsed": 5
  }
}
```

### job.failed

```json
{
  "event": "job.failed",
  "data": {
    "jobId": "uuid",
    "error": "AI_PROVIDER_TIMEOUT",
    "message": "Provider timed out, retrying...",
    "willRetry": true
  }
}
```

### upload.progress

```json
{
  "event": "upload.progress",
  "data": {
    "uploadId": "uuid",
    "progress": 0.65,
    "uploadedChunks": 332,
    "totalChunks": 512
  }
}
```

### render.progress

```json
{
  "event": "render.progress",
  "data": {
    "renderJobId": "uuid",
    "progress": 80,
    "stage": "encoding",
    "fps": 142
  }
}
```

### notification.created

```json
{
  "event": "notification.created",
  "data": {
    "id": "uuid",
    "type": "warning",
    "title": "Low Credits",
    "message": "You have 10 credits remaining"
  }
}
```

### pipeline.progress

```json
{
  "event": "pipeline.progress",
  "data": {
    "pipelineId": "uuid",
    "currentStep": 3,
    "totalSteps": 14,
    "stepName": "Speaker Detection",
    "overallProgress": 0.21
  }
}
```

---

# 16. Admin Endpoints

All admin endpoints require `role: admin`.

## GET /admin/users

List all users with filters.

## GET /admin/users/:id

## PATCH /admin/users/:id

Update user (suspend, activate, etc.).

## POST /admin/users/:id/credits/adjust

Manually adjust user credits.

## GET /admin/ai/providers

Manage AI providers.

## POST /admin/ai/providers

## PATCH /admin/ai/providers/:id

## GET /admin/ai/models

## POST /admin/ai/models

## GET /admin/ai/routing-rules

## PUT /admin/ai/routing-rules

## GET /admin/ai/health

Provider health dashboard.

## GET /admin/ai/prompts

Manage prompts.

## POST /admin/ai/prompts

## POST /admin/ai/prompts/:id/versions

Create new prompt version.

## GET /admin/analytics/system

System-wide analytics.

## GET /admin/billing/revenue

Revenue reports.

## GET /admin/system/health

System health overview.

## GET /admin/system/config

## PATCH /admin/system/config

## GET /admin/feature-flags

## PATCH /admin/feature-flags/:key

---

**Next Document:** [08-DESKTOP-ARCHITECTURE.md](08-DESKTOP-ARCHITECTURE.md)
