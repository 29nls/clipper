# 05-SYSTEM-ARCHITECTURE.md

**Version:** 1.0.0
**Status:** Draft
**Reference:** PRD v1.0, SRS v1.0

---

# Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Architecture Principles](#2-architecture-principles)
3. [High-Level System Diagram](#3-high-level-system-diagram)
4. [Component Architecture](#4-component-architecture)
5. [Service Decomposition](#5-service-decomposition)
6. [Communication Patterns](#6-communication-patterns)
7. [Data Flow Diagrams](#7-data-flow-diagrams)
8. [Caching Strategy](#8-caching-strategy)
9. [Error Handling Architecture](#9-error-handling-architecture)
10. [Scaling Strategy](#10-scaling-strategy)
11. [Technology Stack](#11-technology-stack)

---

# 1. Architecture Overview

AI Video Clipper Platform adalah sistem terdistribusi yang menggabungkan:

- **Desktop Application** (Electron) untuk editing dan rendering lokal
- **Web SaaS** (Next.js) untuk manajemen akun dan cloud services
- **Backend Services** (Node.js) untuk business logic dan AI orchestration
- **AI Pipeline** untuk memproses video menjadi short clips
- **Queue System** (Redis + BullMQ) untuk async processing
- **Object Storage** untuk media files
- **PostgreSQL** sebagai primary database

Platform menggunakan **Online-First Architecture** dimana Desktop tetap memerlukan koneksi internet untuk autentikasi, AI processing, dan sinkronisasi.

---

# 2. Architecture Principles

## 2.1 Cloud Native

```
Backend sebagai layanan modular dengan API yang jelas.
Stateless services. Horizontal scaling. Container-ready.
```

## 2.2 Modular Monolith → Microservices Ready

```
Monolith modular pada MVP.
Domain dipisahkan secara logical.
Siap dipecah menjadi microservices tanpa refactor besar.
```

## 2.3 AI as a Service

```
AI adalah layanan, bukan tertanam di UI.
Desktop/Frontend tidak pernah memanggil AI Provider langsung.
Semua request melewati AI Orchestrator.
```

## 2.4 Provider Independent

```
Setiap AI provider dapat diganti tanpa mengubah business logic.
Interface abstraction untuk semua provider.
```

## 2.5 Clean Architecture

```
┌─────────────────────────────────┐
│          Presentation            │  ← Controllers, Routes
├─────────────────────────────────┤
│           Application            │  ← Use Cases, Services
├─────────────────────────────────┤
│             Domain               │  ← Entities, Business Rules
├─────────────────────────────────┤
│          Infrastructure          │  ← DB, Storage, External APIs
└─────────────────────────────────┘
```

## 2.6 Event-Driven

```
Komunikasi async antar komponen menggunakan message queue.
Setiap domain dapat bereaksi terhadap event tanpa coupling langsung.
```

---

# 3. High-Level System Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│                                                                      │
│  ┌──────────────────┐          ┌──────────────────┐                 │
│  │  Desktop App     │          │  Web SaaS        │                 │
│  │  (Electron +     │          │  (Next.js +      │                 │
│  │   React + TS)    │          │   React + TS)    │                 │
│  │                  │          │                  │                 │
│  │  • Editor        │          │  • Dashboard     │                 │
│  │  • Renderer      │          │  • Billing       │                 │
│  │  • FFmpeg        │          │  • Analytics     │                 │
│  └────────┬─────────┘          └────────┬─────────┘                 │
│           │                              │                           │
└───────────┼──────────────────────────────┼───────────────────────────┘
            │ HTTPS / WSS                  │ HTTPS / WSS
            │                              │
┌───────────▼──────────────────────────────▼───────────────────────────┐
│                     API GATEWAY LAYER                                │
│                                                                      │
│   ┌──────────────────────────────────────────────┐                  │
│   │           Nginx Reverse Proxy                 │                  │
│   │   • TLS Termination                          │                  │
│   │   • Rate Limiting                            │                  │
│   │   • Load Balancing                           │                  │
│   │   • CORS                                     │                  │
│   └──────────────────┬───────────────────────────┘                  │
│                      │                                               │
│   ┌──────────────────▼───────────────────────────┐                  │
│   │         Express.js API Server                 │                  │
│   │   • JWT Auth Middleware                       │                  │
│   │   • Request Validation                        │                  │
│   │   • Route Handler                             │                  │
│   │   • WebSocket Gateway                         │                  │
│   └──────────────────┬───────────────────────────┘                  │
│                      │                                               │
└──────────────────────┼───────────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────────┐
│                    SERVICE LAYER                                      │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Auth    │ │  User    │ │ Project  │ │  Media   │ │ Timeline │  │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  AI      │ │ Render   │ │ Publish  │ │ Billing  │ │Analytics │  │
│  │ Gateway  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │  │
│  └─────┬────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│        │                                                             │
│  ┌─────▼──────────────────────────────────────┐                     │
│  │          AI ORCHESTRATOR                    │                     │
│  │  • Provider Router                         │                     │
│  │  • Prompt Engine                           │                     │
│  │  • Credit Engine                           │                     │
│  │  • Cache Engine                            │                     │
│  │  • Fallback Manager                        │                     │
│  └─────────────────────────────────────────────┘                     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────────┐
│                   QUEUE & WORKER LAYER                                │
│                                                                      │
│   ┌──────────────────────────────────────────────┐                  │
│   │            Redis + BullMQ                     │                  │
│   │                                              │                  │
│   │  • Upload Queue    • Render Queue            │                  │
│   │  • AI Job Queue    • Publish Queue           │                  │
│   │  • Notif Queue     • Cleanup Queue           │                  │
│   │  • Analytics Queue • Dead Letter Queue       │                  │
│   └──────────────────┬───────────────────────────┘                  │
│                      │                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Worker  │ │ Worker  │ │ Worker  │ │ Worker  │ │ Worker  │      │
│  │  #1     │ │  #2     │ │  #3     │ │  #N     │ │ GPU     │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────────┐
│                     DATA LAYER                                        │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ PostgreSQL   │  │ Redis Cache  │  │ Object Storage           │  │
│  │ (Primary DB) │  │ (Cache +     │  │ • Supabase Storage       │  │
│  │              │  │  Session)    │  │ • Cloudflare R2          │  │
│  │ via Prisma   │  │              │  │ • AWS S3 (future)        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                                    │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ AI       │ │ Payment  │ │ Email    │ │ OAuth    │ │ Social   │  │
│  │ Providers│ │ Gateway  │ │ Service  │ │ Providers│ │ Platforms│  │
│  │          │ │          │ │          │ │          │ │          │  │
│  │OpenRouter│ │Stripe    │ │Resend    │ │Google    │ │YouTube   │  │
│  │NVIDIA    │ │Midtrans  │ │SES       │ │GitHub    │ │TikTok    │  │
│  │OpenCode  │ │Xendit    │ │          │ │          │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

# 4. Component Architecture

## 4.1 API Gateway

```
Responsibilities:
• TLS Termination (TLS 1.3)
• Rate Limiting (per IP, per user, per endpoint)
• Request Routing
• Load Balancing
• CORS Policy
• Compression (gzip/brotli)
• Security Headers (HSTS, CSP, X-Frame-Options)
• WebSocket Proxy
```

**Technology:** Nginx + Express.js

## 4.2 Backend API Server

```
┌───────────────────────────────────────┐
│         Express.js Application         │
├───────────────────────────────────────┤
│  Middleware Pipeline:                  │
│  • Request ID Generator                │
│  • Logger (Pino)                       │
│  • Body Parser                         │
│  • Auth Middleware (JWT)               │
│  • Rate Limiter                        │
│  • Validator (Zod)                     │
│  • Error Handler                       │
├───────────────────────────────────────┤
│  Route Handlers:                       │
│  • /api/v1/auth/*                      │
│  • /api/v1/users/*                     │
│  • /api/v1/projects/*                  │
│  • /api/v1/media/*                     │
│  • /api/v1/ai/*                        │
│  • /api/v1/render/*                    │
│  • /api/v1/publish/*                   │
│  • /api/v1/billing/*                   │
│  • /api/v1/analytics/*                 │
│  • /api/v1/notifications/*             │
│  • /ws (WebSocket)                     │
└───────────────────────────────────────┘
```

## 4.3 AI Orchestrator

```
┌───────────────────────────────────────────────┐
│              AI ORCHESTRATOR                   │
├───────────────────────────────────────────────┤
│                                               │
│  Request → [Router] → [Provider] → [Execute]  │
│                ↑              ↓                │
│          [Rule Engine]  [Fallback Mgr]         │
│                ↑              ↓                │
│          [Cost Engine]  [Retry Policy]         │
│                ↑              ↓                │
│          [Cache Engine] [Health Monitor]       │
│                                               │
└───────────────────────────────────────────────┘

Responsibilities:
• Route request ke provider yang tepat
• Estimasi biaya sebelum eksekusi
• Validasi credit cukup
• Cek cache sebelum eksekusi
• Retry dengan exponential backoff
• Fallback ke provider lain jika gagal
• Monitor health semua provider
• Log semua metrik
```

## 4.4 Queue Engine

```
Redis + BullMQ Architecture:

┌─────────────┐     ┌──────────────────────┐
│  Producer   │────▶│   Redis (BullMQ)     │
│  (API Server)│    │                      │
└─────────────┘     │  ┌────────────────┐  │
                    │  │ Upload Queue   │  │
┌─────────────┐     │  ├────────────────┤  │
│  Consumer   │◀────│  │ AI Job Queue   │  │
│  (Worker)   │     │  ├────────────────┤  │
└─────────────┘     │  │ Render Queue   │  │
                    │  ├────────────────┤  │
                    │  │ Publish Queue  │  │
                    │  ├────────────────┤  │
                    │  │ Notif Queue    │  │
                    │  ├────────────────┤  │
                    │  │ DLQ            │  │
                    │  └────────────────┘  │
                    └──────────────────────┘

Features:
• Priority queues
• Job scheduling
• Retry with backoff
• Rate limiting
• Concurrency control
• Job dependencies
```

## 4.5 Worker Cluster

```
Worker Types:
┌─────────────────────────────────────────┐
│ AI Worker                               │
│ • Processes AI jobs                     │
│ • Calls AI Orchestrator                 │
│ • Stores results                        │
│ • Deducts credits                       │
├─────────────────────────────────────────┤
│ Render Worker                           │
│ • Executes FFmpeg commands              │
│ • GPU encoding when available           │
│ • Uploads to storage                    │
│ • Updates render job status             │
├─────────────────────────────────────────┤
│ Upload Worker                           │
│ • Merges chunks                         │
│ • Validates checksum                    │
│ • Extracts metadata                     │
│ • Generates proxy/waveform              │
├─────────────────────────────────────────┤
│ Publish Worker                          │
│ • Uploads to social platforms           │
│ • Handles OAuth tokens                  │
│ • Schedules posts                       │
├─────────────────────────────────────────┤
│ Notification Worker                     │
│ • Sends emails                          │
│ • Creates in-app notifications          │
│ • Webhooks                              │
├─────────────────────────────────────────┤
│ Cleanup Worker                          │
│ • Removes expired tokens                │
│ • Cleans temp files                     │
│ • Archives old data                     │
└─────────────────────────────────────────┘
```

---

# 5. Service Decomposition

```
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE MAP                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AUTH SERVICE                                               │
│  • Register, Login, Logout                                  │
│  • OAuth (Google, GitHub)                                   │
│  • Password Reset                                           │
│  • Session Management                                       │
│  • Token Rotation                                           │
│  Tables: users, user_credentials, user_sessions, ...        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  USER SERVICE                                               │
│  • Profile Management                                       │
│  • Preferences                                              │
│  • Avatar Upload                                            │
│  Tables: profiles, preferences, avatars, ...                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  PROJECT SERVICE                                            │
│  • CRUD Projects                                            │
│  • Versioning                                               │
│  • Autosave                                                 │
│  Tables: projects, project_versions, project_settings, ...  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  MEDIA SERVICE                                              │
│  • Upload (chunk, resume)                                   │
│  • Metadata Extraction                                      │
│  • Proxy Generation                                         │
│  Tables: media_files, uploads, storage_objects, ...         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  AI GATEWAY SERVICE                                         │
│  • AI Job Management                                        │
│  • Provider Routing                                         │
│  • Prompt Management                                        │
│  • Result Storage                                           │
│  Tables: ai_jobs, ai_providers, ai_models, ...              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  RENDER SERVICE                                             │
│  • Local & Cloud Rendering                                  │
│  • FFmpeg Execution                                         │
│  • Export Management                                        │
│  Tables: render_jobs, render_queue, render_exports, ...     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  PUBLISH SERVICE                                            │
│  • Social Media Publishing                                  │
│  • Scheduling                                               │
│  • OAuth Token Management                                   │
│  Tables: social_accounts, publish_jobs, ...                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  BILLING SERVICE                                            │
│  • Credit Wallet                                            │
│  • Subscriptions                                            │
│  • Payments & Invoices                                      │
│  Tables: wallet, wallet_transactions, subscriptions, ...    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ANALYTICS SERVICE                                          │
│  • Usage Tracking                                           │
│  • Aggregation                                              │
│  • Reporting                                                │
│  Tables: analytics_events, analytics_daily, ...             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  NOTIFICATION SERVICE                                       │
│  • In-App Notifications                                     │
│  • Email                                                    │
│  • Webhooks                                                 │
│  Tables: notifications, notification_queue, ...             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 6. Communication Patterns

## 6.1 Synchronous (REST)

```
Client → API Gateway → Service → Database

Used for:
• Authentication
• CRUD operations
• Real-time queries
• File metadata

Response Time Target: < 500ms (p95)
```

## 6.2 Asynchronous (Queue)

```
Client → API → Queue → Worker → Service → Database

Used for:
• AI Processing
• Video Rendering
• File Uploads (chunk merge)
• Publishing
• Email sending

Pattern: Fire and forget with progress tracking via WebSocket
```

## 6.3 Real-Time (WebSocket)

```
Client ←→ WebSocket Gateway ←→ Redis Pub/Sub ←→ Workers

Events:
• job.created      → Notify client new job created
• job.progress     → Progress updates (0-100%)
• job.completed    → Job finished successfully
• job.failed       → Job failed
• notification.created → New notification
• upload.progress  → Upload progress
• render.progress  → Render progress
```

## 6.4 Event-Driven (Internal)

```
Domain Events emitted:
• user.registered
• user.login
• project.created
• project.deleted
• upload.completed
• ai.job.completed
• render.completed
• payment.completed
• credit.low
• subscription.expired

Listeners react without coupling:
upload.completed → triggers ai.pipeline
ai.job.completed → triggers notification
render.completed → triggers notification
```

---

# 7. Data Flow Diagrams

## 7.1 Upload + AI Processing Flow

```
[User]
  │
  │ 1. Select Video
  ▼
[Desktop/SaaS]
  │
  │ 2. POST /uploads (create session)
  ▼
[API Server]
  │
  │ 3. Return upload_id + presigned URLs
  ▼
[Desktop/SaaS]
  │
  │ 4. Upload chunks → [Object Storage]
  │
  │ 5. POST /uploads/:id/complete
  ▼
[API Server]
  │
  │ 6. Enqueue → [Upload Queue]
  ▼
[Upload Worker]
  │
  │ 7. Merge chunks, verify checksum
  │ 8. Extract metadata (FFprobe)
  │ 9. Create media_file record
  │ 10. Enqueue → [AI Job Queue]
  ▼
[AI Worker]
  │
  │ 11. AI Orchestrator routes to provider
  │ 12. Speech Recognition → Transcript
  │ 13. Scene Detection
  │ 14. Speaker Detection
  │ 15. Viral Detection + Clip Ranking
  │ 16. Subtitle Generation
  │ 17. Title/Description/Hashtag
  │ 18. Thumbnail Generation
  │
  │ (WebSocket progress → Client at each step)
  ▼
[Database]
  │
  │ 19. Store all results
  ▼
[Client]
  │
  │ 20. Display clips with scores
```

## 7.2 Rendering Flow

```
[User]
  │
  │ 1. Select clips + settings
  ▼
[Desktop]
  │
  │ 2. POST /render/jobs
  ▼
[API Server]
  │
  │ 3. Validate credits
  │ 4. Create render_job
  │ 5. Enqueue → [Render Queue]
  ▼
  ├─── Desktop Local Render ────────────────────┐
  │    6a. Download source                       │
  │    7a. FFmpeg encode (GPU/CPU)              │
  │    8a. Upload result to storage              │
  │    9a. Update job status                     │
  │                                               │
  └─── Cloud Render ─────────────────────────────┤
       6b. Worker picks up job                   │
       7b. Pull from storage                     │
       8b. FFmpeg encode                         │
       9b. Push result to storage                │
       10b. Update job status                    │
                                                   │
                                                   ▼
[WebSocket] ← progress updates (10%, 50%, 100%)
  │
  ▼
[Client] ← notification.render_completed
  │
  ▼
[User downloads or publishes]
```

## 7.3 Publishing Flow

```
[User]
  │
  │ 1. Connect YouTube/TikTok account (OAuth)
  ▼
[API Server]
  │
  │ 2. Store social_account + encrypted tokens
  ▼
[User]
  │
  │ 3. Select rendered clip
  │ 4. Add title, description, tags
  │ 5. Choose: Publish Now or Schedule
  ▼
[API Server]
  │
  │ 6. Create publish_job
  │ 7. If scheduled → store in scheduled_posts
  │ 8. If now → enqueue → [Publish Queue]
  ▼
[Publish Worker]
  │
  │ 9. Refresh OAuth token if expired
  │ 10. Upload video to platform API
  │ 11. Set metadata
  │ 12. Publish
  │ 13. Store platform_post_id
  ▼
[Notification] → publish.completed
```

---

# 8. Caching Strategy

## 8.1 Cache Layers

```
┌──────────────────────────────────────────┐
│  L1: Browser/Desktop Cache (In-Memory)   │
│  • User preferences                      │
│  • Project state                         │
│  • UI state                              │
│  TTL: Session                            │
├──────────────────────────────────────────┤
│  L2: Redis Cache (Distributed)           │
│  • Session data                          │
│  • AI results (transcript, subtitle)     │
│  • Rate limit counters                   │
│  • Prompt templates                      │
│  • Provider health status                │
│  TTL: 5min - 24h (configurable)          │
├──────────────────────────────────────────┤
│  L3: Database (Source of Truth)          │
│  • All persistent data                   │
└──────────────────────────────────────────┘
```

## 8.2 Cache Patterns

```
Cache-Aside (Lazy Loading):
  Read → Check Cache → Miss → Read DB → Write Cache → Return

Write-Through:
  Write → Update Cache → Update DB → Return

Write-Behind:
  Write → Update Cache → Return → Async Update DB
  (Used for: analytics events, metrics)

Invalidation:
  • TTL-based expiration
  • Explicit invalidation on update
  • Tag-based batch invalidation
```

---

# 9. Error Handling Architecture

## 9.1 Error Classification

```
┌──────────────────────────────────────────┐
│         ERROR TYPES                      │
├──────────────────────────────────────────┤
│ Client Errors (4xx)                      │
│ • 400 — Validation Error                 │
│ • 401 — Authentication Error             │
│ • 403 — Authorization Error              │
│ • 404 — Not Found                        │
│ • 409 — Conflict                         │
│ • 422 — Business Rule Violation          │
│ • 429 — Rate Limit Exceeded              │
├──────────────────────────────────────────┤
│ Server Errors (5xx)                      │
│ • 500 — Internal Server Error            │
│ • 502 — Bad Gateway                      │
│ • 503 — Service Unavailable              │
│ • 504 — Gateway Timeout                  │
├──────────────────────────────────────────┤
│ AI Provider Errors                       │
│ • Provider Timeout → Retry + Fallback    │
│ • Provider Offline → Fallback            │
│ • Rate Limited → Retry with backoff      │
├──────────────────────────────────────────┤
│ Queue Errors                             │
│ • Job Failed → Retry (max 3)             │
│ • Dead Letter → Manual review            │
└──────────────────────────────────────────┘
```

## 9.2 Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "CREDIT_INSUFFICIENT",
    "message": "You do not have enough credits for this operation",
    "details": {
      "required": 20,
      "available": 5
    },
    "requestId": "req_abc123",
    "correlationId": "corr_xyz789"
  }
}
```

## 9.3 Retry Strategy

```
Retryable Errors:
• Network timeout
• Provider 5xx
• Queue processing error
• Storage timeout

Non-Retryable:
• Validation error (400)
• Authentication error (401)
• Authorization error (403)
• Insufficient credits (422)
• Unsupported format

Retry Policy:
• Max retries: 3
• Backoff: Exponential (1s, 2s, 4s, 8s)
• Jitter: Random 0-500ms
• Fallback: Switch provider after 3 retries
```

---

# 10. Scaling Strategy

## 10.1 Horizontal Scaling

```
Stateless Components (scale freely):
┌────────────┐  ┌────────────┐  ┌────────────┐
│ API Server │  │ API Server │  │ API Server │  ← Load Balancer
│  Instance  │  │  Instance  │  │  Instance  │
│     #1     │  │     #2     │  │     #N     │
└────────────┘  └────────────┘  └────────────┘

┌────────────┐  ┌────────────┐  ┌────────────┐
│  Worker    │  │  Worker    │  │  Worker    │  ← Queue distributes
│  Instance  │  │  Instance  │  │  Instance  │
│     #1     │  │     #2     │  │     #N     │
└────────────┘  └────────────┘  └────────────┘

Stateful Components (scale with partitioning):
• PostgreSQL → Read Replicas + Connection Pooling (PgBouncer)
• Redis → Cluster mode / Redis Sentinel
• Object Storage → Naturally distributed
```

## 10.2 Auto-Scaling Triggers

```
Scale UP when:
• CPU > 70% for 5 minutes
• Queue depth > 100 jobs
• Response time p95 > 500ms
• Memory > 80%

Scale DOWN when:
• CPU < 30% for 15 minutes
• Queue depth < 10 jobs
• Response time p95 < 200ms
```

## 10.3 Database Scaling

```
Phase 1 (MVP):
• Single PostgreSQL instance
• PgBouncer connection pooling
• Read-heavy queries optimized with indexes

Phase 2 (Growth):
• Read replicas for analytics
• Partitioning on large tables (analytics_events, audit_logs)

Phase 3 (Scale):
• Horizontal partitioning (sharding by user_id)
• Separate databases per domain (microservices)
```

---

# 11. Technology Stack

## 11.1 Backend

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20 LTS |
| Language | TypeScript 5 |
| Framework | Express.js / Fastify |
| ORM | Prisma 5 |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Queue | BullMQ |
| Validation | Zod |
| Logger | Pino |
| Test | Vitest + Supertest |

## 11.2 Frontend (Web SaaS)

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 18 |
| Styling | Tailwind CSS |
| State | Zustand / TanStack Query |
| Forms | React Hook Form + Zod |
| Charts | Recharts |

## 11.3 Desktop

| Component | Technology |
|-----------|-----------|
| Framework | Electron 28 |
| UI | React 18 + TypeScript |
| Bundler | Vite |
| FFmpeg | fluent-ffmpeg + FFmpeg binary |
| Native | Node.js native addons |
| IPC | Electron contextBridge |

## 11.4 Infrastructure

| Component | Technology |
|-----------|-----------|
| Container | Docker |
| Orchestration | Docker Compose (MVP) / Kubernetes (Scale) |
| CI/CD | GitHub Actions |
| Reverse Proxy | Nginx |
| Storage | Supabase Storage + Cloudflare R2 |
| Email | Resend / AWS SES |
| Monitoring | Prometheus + Grafana |
| Error Tracking | Sentry |
| Logging | Loki / ELK Stack |

## 11.5 AI Integration

| Component | Technology |
|-----------|-----------|
| AI Gateway | Custom Node.js service |
| Providers | OpenRouter, NVIDIA, OpenCode |
| Speech-to-Text | Provider-dependent (Whisper family) |
| LLM | Provider-dependent (Qwen, Llama, etc.) |
| Vector DB | pgvector (PostgreSQL extension) |

---

**Next Document:** [06-AI-PIPELINE.md](06-AI-PIPELINE.md)
