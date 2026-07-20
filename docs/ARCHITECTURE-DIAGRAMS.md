# 🏗️ Architecture Diagrams — AI Video Clipper Platform

**Version:** 1.1.0  
**Reference:** PRD v1.0, SRS v1.0, System Architecture v1.0

> Diagram visual interaktif menggunakan **Mermaid.js**.  
> Render otomatis di GitHub, GitLab, atau editor yang mendukung Mermaid.  
> Buka file ini di [Mermaid Live Editor](https://mermaid.live) untuk ekspor PNG/SVG.

---

## 📋 Daftar Diagram

| # | Diagram | Halaman |
|---|---------|---------|
| 1 | [High-Level System Architecture](#1-high-level-system-architecture) | Arsitektur sistem keseluruhan |
| 2 | [Component Architecture (Service Map)](#2-component-architecture-service-map) | Dekomposisi services |
| 3 | [AI Pipeline Flow](#3-ai-pipeline-flow) | 14-stage pipeline AI |
| 4 | [Data Flow: Upload + AI Processing](#4-data-flow-upload--ai-processing) | Alur upload & proses AI |
| 5 | [Authentication & Authorization Flow](#5-authentication--authorization-flow) | Alur auth SaaS + Desktop |
| 6 | [Electron Desktop Architecture](#6-electron-desktop-architecture) | Arsitektur proses & IPC |
| 7 | [Queue & Worker Architecture](#7-queue--worker-architecture) | Redis + BullMQ topology |
| 8 | [Billing & Credit System](#8-billing--credit-system) | Alur monetisasi |
| 9 | [Deployment & CI/CD Architecture](#9-deployment--cicd-architecture) | Pipelines & blue-green |
| 10 | [Database Entity Relationships](#10-database-entity-relationships) | ERD ringkas antar domain |
| 11 | [AI Orchestrator — Internal Architecture & State Machine](#11-ai-orchestrator--internal-architecture--state-machine) | Component detail + job states |
| 12 | [Auth Service — Internal Flows](#12-auth-service--internal-flows) | Register, Login, Token, Session |
| 13 | [Billing Service — Lifecycle & Ledger](#13-billing-service--lifecycle--ledger) | Subscription, Credit, Invoice |
| 14 | [Render & Publish Service — State Machines](#14-render--publish-service--state-machines) | Render pipeline, publish flow |
| 15 | [Admin Panel — Modules & Data Flow](#15-admin-panel--modules--data-flow) | User, AI, Billing, Config mgmt |

---

## 1. High-Level System Architecture

```mermaid
graph TB
    %% ── STYLE DEFINITIONS ──
    classDef client fill:#6366f1,color:#fff,stroke:#4f46e5,stroke-width:2px
    classDef gateway fill:#8b5cf6,color:#fff,stroke:#7c3aed,stroke-width:2px
    classDef service fill:#06b6d4,color:#fff,stroke:#0891b2,stroke-width:2px
    classDef orchestrator fill:#f59e0b,color:#fff,stroke:#d97706,stroke-width:2px
    classDef queue fill:#10b981,color:#fff,stroke:#059669,stroke-width:2px
    classDef worker fill:#34d399,color:#fff,stroke:#10b981,stroke-width:2px
    classDef data fill:#6b7280,color:#fff,stroke:#4b5563,stroke-width:2px
    classDef external fill:#ef4444,color:#fff,stroke:#dc2626,stroke-width:2px
    classDef ai fill:#ec4899,color:#fff,stroke:#db2777,stroke-width:2px

    %% ── CLIENT LAYER ──
    subgraph CLIENT [📱 Client Layer]
        DESKTOP["Desktop App<br/>(Electron + React + TS)<br/>• Editor · Renderer · FFmpeg"]
        WEB["Web SaaS<br/>(Next.js + React + TS)<br/>• Dashboard · Billing · Analytics"]
    end

    %% ── API GATEWAY ──
    subgraph GATEWAY [🚪 API Gateway Layer]
        NGINX["Nginx Reverse Proxy<br/>• TLS 1.3 · Rate Limiting<br/>• Load Balancing · CORS"]
        EXPRESS["Express.js API Server<br/>• JWT Auth · Validation<br/>• WebSocket Gateway"]
    end

    %% ── SERVICE LAYER ──
    subgraph SVCLAYER [⚙️ Service Layer]
        AUTH["🔐 Auth Service"]
        USER["👤 User Service"]
        PROJ["📁 Project Service"]
        MEDIA["🎬 Media Service"]
        TIMELINE["⏱️ Timeline Service"]
        
        subgraph AIBLOCK [🤖 AI Block]
            AI_GATEWAY["🔌 AI Gateway Service"]
            ORCHESTRATOR["🧠 AI Orchestrator<br/>• Router · Prompt · Credit<br/>• Cache · Fallback"]
        end

        RENDER["🎞️ Render Service"]
        PUBLISH["📢 Publish Service"]
        BILLING["💰 Billing Service"]
        ANALYTICS["📊 Analytics Service"]
        NOTIF["🔔 Notification Service"]
    end

    %% ── QUEUE & WORKER ──
    subgraph QWORKER [📨 Queue & Worker Layer]
        REDIS["Redis + BullMQ<br/>• 8 Queues · DLQ<br/>• Priority · Scheduling"]
        WORKERS["Worker Cluster<br/>• AI · Render · Upload · Publish · Notif · Cleanup"]
    end

    %% ── DATA LAYER ──
    subgraph DATA [💾 Data Layer]
        PG[("PostgreSQL 15<br/>(via Prisma)")]
        REDIS_CACHE[("Redis Cache<br/>(Session · AI Cache)")]
        STORAGE[("Object Storage<br/>• Supabase Storage<br/>• Cloudflare R2")]
    end

    %% ── EXTERNAL SERVICES ──
    subgraph EXTERNAL [🌐 External Services]
        AI_PROVIDERS["🤖 AI Providers<br/>OpenRouter · NVIDIA · OpenCode"]
        PAYMENT["💳 Payment Gateway<br/>Stripe · Midtrans · Xendit"]
        EMAIL["📧 Email Service<br/>Resend · SES"]
        OAUTH["🔑 OAuth Providers<br/>Google · GitHub"]
        SOCIAL["📱 Social Platforms<br/>YouTube · TikTok"]
    end

    %% ── CONNECTIONS ──
    DESKTOP -->|"HTTPS / WSS"| NGINX
    WEB -->|"HTTPS / WSS"| NGINX
    NGINX --> EXPRESS

    EXPRESS --> AUTH
    EXPRESS --> USER
    EXPRESS --> PROJ
    EXPRESS --> MEDIA
    EXPRESS --> TIMELINE
    EXPRESS --> AI_GATEWAY
    EXPRESS --> RENDER
    EXPRESS --> PUBLISH
    EXPRESS --> BILLING
    EXPRESS --> ANALYTICS
    EXPRESS --> NOTIF

    AI_GATEWAY --> ORCHESTRATOR
    
    AUTH --> PG
    USER --> PG
    PROJ --> PG
    MEDIA --> PG
    TIMELINE --> PG
    AI_GATEWAY --> PG
    RENDER --> PG
    PUBLISH --> PG
    BILLING --> PG
    ANALYTICS --> PG
    NOTIF --> PG

    EXPRESS --> REDIS
    REDIS --> WORKERS
    WORKERS --> ORCHESTRATOR
    WORKERS --> PG
    WORKERS --> STORAGE

    AUTH --> OAUTH
    ORCHESTRATOR --> AI_PROVIDERS
    BILLING --> PAYMENT
    NOTIF --> EMAIL
    PUBLISH --> SOCIAL

    DESKTOP -.->|"Local Render"| STORAGE
    MEDIA -.-> STORAGE
    RENDER -.-> STORAGE

    %% Apply styles
    class DESKTOP,WEB client
    class NGINX,EXPRESS gateway
    class AUTH,USER,PROJ,MEDIA,TIMELINE,AI_GATEWAY,RENDER,PUBLISH,BILLING,ANALYTICS,NOTIF service
    class ORCHESTRATOR orchestrator
    class REDIS queue
    class WORKERS worker
    class PG,REDIS_CACHE,STORAGE data
    class AI_PROVIDERS,PAYMENT,EMAIL,OAUTH,SOCIAL external
    class AI_GATEWAY,ORCHESTRATOR ai
```

---

## 2. Component Architecture (Service Map)

```mermaid
graph LR
    %% ── STYLE ──
    classDef svc fill:#06b6d4,color:#fff,stroke:#0891b2,stroke-width:2px
    classDef db fill:#6b7280,color:#fff,stroke:#4b5563,stroke-width:2px
    classDef external fill:#ef4444,color:#fff,stroke:#dc2626,stroke-width:2px

    subgraph AUTH_BLOCK [🔐 Auth Service]
        AUTH_SVC["Auth Service"]
        AUTH_DB[("users<br/>user_credentials<br/>user_sessions")]
    end
    AUTH_SVC --> AUTH_DB

    subgraph USER_BLOCK [👤 User Service]
        USER_SVC["User Service"]
        USER_DB[("profiles<br/>preferences<br/>avatars")]
    end
    USER_SVC --> USER_DB

    subgraph PROJ_BLOCK [📁 Project Service]
        PROJ_SVC["Project Service"]
        PROJ_DB[("projects<br/>project_versions<br/>project_settings")]
    end
    PROJ_SVC --> PROJ_DB

    subgraph MEDIA_BLOCK [🎬 Media Service]
        MEDIA_SVC["Media Service"]
        MEDIA_DB[("media_files<br/>uploads<br/>storage_objects<br/>media_metadata")]
    end
    MEDIA_SVC --> MEDIA_DB

    subgraph AI_BLOCK [🤖 AI Gateway Service]
        AI_SVC["AI Gateway"]
        AI_DB[("ai_jobs<br/>ai_providers<br/>ai_models<br/>ai_routing_rules<br/>ai_cache<br/>prompts<br/>prompt_versions")]
        ORCH["🧠 AI Orchestrator"]
    end
    AI_SVC --> AI_DB
    AI_SVC --> ORCH

    subgraph RENDER_BLOCK [🎞️ Render Service]
        RENDER_SVC["Render Service"]
        RENDER_DB[("render_jobs<br/>render_queue<br/>render_exports")]
    end
    RENDER_SVC --> RENDER_DB

    subgraph PUBLISH_BLOCK [📢 Publish Service]
        PUBLISH_SVC["Publish Service"]
        PUBLISH_DB[("social_accounts<br/>publish_jobs<br/>scheduled_posts<br/>published_posts")]
    end
    PUBLISH_SVC --> PUBLISH_DB

    subgraph BILLING_BLOCK [💰 Billing Service]
        BILL_SVC["Billing Service"]
        BILL_DB[("wallet<br/>wallet_transactions<br/>subscriptions<br/>subscription_items<br/>invoices<br/>invoice_items<br/>coupons")]
    end
    BILL_SVC --> BILL_DB

    subgraph ANALYTICS_BLOCK [📊 Analytics Service]
        ANA_SVC["Analytics Service"]
        ANA_DB[("analytics_events<br/>analytics_daily<br/>analytics_ai_usage<br/>analytics_revenue")]
    end
    ANA_SVC --> ANA_DB

    subgraph NOTIF_BLOCK [🔔 Notification Service]
        NOTIF_SVC["Notification Service"]
        NOTIF_DB[("notifications<br/>notification_queue")]
    end
    NOTIF_SVC --> NOTIF_DB

    %% External deps
    BILL_SVC -.->|"Stripe / Midtrans / Xendit"| PAY_EXT["💳 Payment Gateway"]
    PUBLISH_SVC -.->|"YouTube / TikTok API"| SOCIAL_EXT["📱 Social Platforms"]
    AUTH_SVC -.->|"OAuth 2.0"| OAUTH_EXT["🔑 Google / GitHub"]
    NOTIF_SVC -.->|"SMTP / API"| EMAIL_EXT["📧 Resend / SES"]
    ORCH -.->|"OpenRouter / NVIDIA"| AI_EXT["🤖 AI Providers"]
    MEDIA_SVC -.->|"S3 API"| STO_EXT["☁️ Object Storage"]

    class AUTH_SVC,USER_SVC,PROJ_SVC,MEDIA_SVC,AI_SVC,ORCH,RENDER_SVC,PUBLISH_SVC,BILL_SVC,ANA_SVC,NOTIF_SVC svc
    class AUTH_DB,USER_DB,PROJ_DB,MEDIA_DB,AI_DB,RENDER_DB,PUBLISH_DB,BILL_DB,ANA_DB,NOTIF_DB db
    class PAY_EXT,SOCIAL_EXT,OAUTH_EXT,EMAIL_EXT,AI_EXT,STO_EXT external
```

---

## 3. AI Pipeline Flow

```mermaid
graph TD
    %% ── STYLE ──
    classDef input fill:#6366f1,color:#fff,stroke:#4f46e5,stroke-width:2px
    classDef stage fill:#06b6d4,color:#fff,stroke:#0891b2,stroke-width:1px
    classDef stageAI fill:#ec4899,color:#fff,stroke:#db2777,stroke-width:1px
    classDef stageOut fill:#10b981,color:#fff,stroke:#059669,stroke-width:2px
    classDef cost fill:#f59e0b,color:#fff,stroke:#d97706,stroke-width:1px

    INPUT["🎬 Video Upload"]:::input

    S1["Stage 1: Metadata Extraction<br/>FFprobe · Container · Streams<br/>Cost: 0 credits (system)"]:::stage
    
    S2["Stage 2: Speech Recognition<br/>Whisper-family STT<br/>Word-level timestamps<br/>🎫 ~5 credits / 10min"]:::stageAI
    
    S3["Stage 3: Scene Detection<br/>Histogram comparison<br/>Cut detection · B-roll/A-roll<br/>🎫 ~3 credits"]:::stageAI
    
    S4["Stage 4: Speaker Detection<br/>Voice embedding · Diarization<br/>Speaker labels → transcript<br/>🎫 ~5 credits"]:::stageAI

    S5["Stage 5: Face Tracking<br/>Face detection · Tracking<br/>Auto-reframe data<br/>🎫 ~5 credits"]:::stageAI

    S6["Stage 6: Emotion Analysis<br/>Text sentiment + Audio tone<br/>High-energy moments<br/>🎫 ~3 credits"]:::stageAI

    S7["Stage 7: Silence & Filler<br/>Silence > 500ms · Fillers<br/>Talk density<br/>🎫 ~2 credits"]:::stageAI

    S8["Stage 8: Hook Detection<br/>Strong openings · Questions<br/>Surprising facts<br/>🎫 ~3 credits"]:::stageAI

    S9["Stage 9: Viral Detection<br/>Multi-signal scoring (0-100)<br/>Clip boundaries · Ranking<br/>🎫 ~5 credits"]:::stageAI

    S10["Stage 10: Auto-Reframe<br/>Face tracking → Crop<br/>9:16 · 1:1 · 16:9<br/>🎫 ~5 credits / clip"]:::stageAI

    S11["Stage 11: Subtitle Gen<br/>Word grouping · Timing<br/>Animation styles<br/>🎫 ~2 credits"]:::stageAI

    S12["Stage 12: Translation<br/>Multi-language subtitles<br/>Context preservation<br/>🎫 ~3 credits / lang"]:::stageAI

    S13["Stage 13: Content Gen<br/>Title · Description<br/>Hashtags · Emojis<br/>🎫 ~1-3 credits"]:::stageAI

    S14["Stage 14: Thumbnail Gen<br/>Frame selection · Overlay<br/>AI enhancement<br/>🎫 ~2 credits"]:::stageAI

    OUTPUT["✅ Ready for Review<br/>Clips displayed with scores<br/>User edits & approves"]:::stageOut

    TOTAL["💰 Total Full Pipeline (30min video)<br/>~151 credits on Pro plan (7.5% monthly)"]:::cost

    INPUT --> S1
    S1 --> S2
    S2 --> S3
    S3 --> S4
    S4 --> S5
    S5 --> S6
    S6 --> S7
    S7 --> S8
    S8 --> S9
    S9 --> S10
    S10 --> S11
    S11 --> S12
    S12 --> S13
    S13 --> S14
    S14 --> OUTPUT
    OUTPUT -.-> TOTAL
```

---

## 4. Data Flow: Upload + AI Processing

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Client as 📱 Desktop / SaaS
    participant API as 🚪 API Server
    object as ☁️ Object Storage
    participant UQ as 📨 Upload Queue
    participant UW as 🔧 Upload Worker
    participant AIQ as 🤖 AI Job Queue
    participant AIW as 🧠 AI Worker
    participant Orch as 🧩 AI Orchestrator
    participant DB as 💾 Database
    participant WS as 🔌 WebSocket

    User->>Client: 1. Select Video
    Client->>API: 2. POST /uploads (create session)
    API-->>Client: 3. Return upload_id + presigned URLs
    Client->>object: 4. Upload chunks
    Client->>API: 5. POST /uploads/:id/complete

    API->>UQ: 6. Enqueue upload job
    UQ->>UW: 7. Worker picks up

    UW->>object: 8. Merge chunks
    UW->>UW: 9. Verify checksum
    UW->>UW: 10. Extract metadata (FFprobe)

    UW->>DB: 11. Create media_file record
    UW->>AIQ: 12. Enqueue AI job

    AIQ->>AIW: 13. Worker picks up
    AIW->>Orch: 14. Route to provider

    %% AI Pipeline stages
    alt Speech Recognition
        Orch->>AIW: Transcribe audio
        AIW->>DB: Store transcript
        WS-->>Client: progress: 20%
    end

    alt Scene Detection
        Orch->>AIW: Detect scenes
        AIW->>DB: Store scenes
        WS-->>Client: progress: 35%
    end

    alt Viral Detection
        Orch->>AIW: Score clips
        AIW->>DB: Store scores
        WS-->>Client: progress: 70%
    end

    alt Content Generation
        Orch->>AIW: Generate titles, desc, thumbnails
        AIW->>DB: Store results
        WS-->>Client: progress: 90%
    end

    AIW->>DB: 15. Mark job completed
    WS-->>Client: 16. job.completed
    Client-->>User: 17. Display clips with viral scores
```

---

## 5. Authentication & Authorization Flow

```mermaid
flowchart TD
    %% ── STYLE ──
    classDef user fill:#6366f1,color:#fff,stroke:#4f46e5,stroke-width:2px
    classDef action fill:#06b6d4,color:#fff,stroke:#0891b2,stroke-width:1px
    classDef server fill:#8b5cf6,color:#fff,stroke:#7c3aed,stroke-width:2px
    classDef storage fill:#6b7280,color:#fff,stroke:#4b5563,stroke-width:2px
    classDef decision fill:#f59e0b,color:#fff,stroke:#d97706,stroke-width:1px

    START(( )):::user
    START --> LOGIN{"🔑 Login Method"}:::decision

    LOGIN -->|"Email + Password"| EMAIL_AUTH["📧 Submit credentials<br/>Server Action → API"]:::action
    LOGIN -->|"OAuth"| OAUTH_AUTH["🔑 Google / GitHub OAuth<br/>Redirect → Callback"]:::action

    EMAIL_AUTH --> VALIDATE{"✅ Valid?"}:::decision
    OAUTH_AUTH --> VALIDATE

    VALIDATE -->|"No ❌"| ERROR["⛔ Return error<br/>Invalid credentials"]:::server
    VALIDATE -->|"Yes ✅"| TOKENS["🎫 Generate tokens<br/>access_token (15min)<br/>refresh_token (30d)"]:::server

    TOKENS --> SAAS_COOKIE["🍪 SaaS: Set httpOnly cookies<br/>Server Action → cookies()"]:::action
    TOKENS --> DESKTOP_TOKEN["💻 Desktop: Store encrypted<br/>Electron safeStorage → userData"]:::action

    SAAS_COOKIE --> MIDDLEWARE["🛡️ Next.js Middleware<br/>Check cookie on every request"]:::server
    MIDDLEWARE --> PROTECTED{"🔐 Protected route?"}:::decision

    PROTECTED -->|"Yes + No token"| REDIRECT["↪️ Redirect → /login?redirect=..."]:::action
    PROTECTED -->|"Yes + Valid token"| DASHBOARD["📊 Allow → Dashboard"]:::action
    PROTECTED -->|"Public route"| ALLOW["✅ Allow → Public page"]:::action

    DESKTOP_TOKEN --> API_CALL["📡 Desktop: Attach token<br/>Authorization: Bearer"]:::action
    API_CALL --> REFRESH{"⏰ Token expired?"}:::decision
    REFRESH -->|"No"| API_OK["✅ API Call proceeds"]:::action
    REFRESH -->|"Yes"| REFRESH_TOKEN["🔄 Call /auth/refresh<br/>Get new tokens"]:::server
    REFRESH_TOKEN --> RETRY["📡 Retry original request"]:::action

    %% ── Role-based authorization ──
    DASHBOARD --> RBAC{"👑 Role Check"}:::decision
    RBAC -->|"user"| USER_AREA["👤 User Dashboard"]:::action
    RBAC -->|"admin"| ADMIN_AREA["⚙️ Admin Panel"]:::action
    RBAC -->|"super_admin"| SUPER_ADMIN["👑 Super Admin"]:::action
```

---

## 6. Electron Desktop Architecture

```mermaid
graph TB
    %% ── STYLE ──
    classDef main fill:#6366f1,color:#fff,stroke:#4f46e5,stroke-width:2px
    classDef preload fill:#8b5cf6,color:#fff,stroke:#7c3aed,stroke-width:1px
    classDef renderer fill:#06b6d4,color:#fff,stroke:#0891b2,stroke-width:2px
    classDef ipc fill:#10b981,color:#fff,stroke:#059669,stroke-width:1px
    classDef external fill:#ef4444,color:#fff,stroke:#dc2626,stroke-width:2px

    subgraph MAIN_PROCESS [⚙️ Main Process (Node.js)]
        WM["Window Manager<br/>• Create · Close · Maximize"]
        TRAY["System Tray<br/>• Minimize to tray<br/>• Context menu"]
        FFMPEG_MGR["FFmpeg Manager<br/>• Spawn child_process<br/>• Monitor stderr"]
        FS["File System<br/>• Read · Write<br/>• Dialogs · Export"]
        UPDATER["Auto-Update<br/>• GitHub Releases<br/>• electron-updater"]
        HW_DETECT["Hardware Detect<br/>• GPU · CPU · RAM<br/>• Encoder detection"]
        LOCAL_DB["Local DB / Cache<br/>• SQLite · Encrypted<br/>• Auth tokens"]
        NATIVE_NOTIF["Native Notification<br/>• OS notification API"]
    end

    subgraph PRELOAD_SCRIPT [🔌 Preload Script (contextBridge)]
        PRELOAD["window.electronAPI = {<br/>  system<br/>  filesystem<br/>  ffmpeg<br/>  notification<br/>  settings<br/>}"]
    end

    subgraph RENDERER_PROCESS [🖥️ Renderer Process (React + Vite)]
        REACT_UI["React UI<br/>• Pages · Components"]
        STATE["State (Zustand)<br/>• UI · Project · Editor"]
        API_CLIENT["API Client<br/>• fetch + WebSocket"]
        TIMELINE["⏱️ Timeline Editor<br/>• Canvas · Drag & drop"]
        VIDEOPREV["🎬 Video Preview<br/>• Canvas / WebGL"]
        SUB_EDITOR["💬 Subtitle Editor<br/>• SRT · VTT · Timing"]
    end

    subgraph EXTERNAL_SVC [🌐 External / Backend]
        BACKEND["Backend API + WS"]
        AI_BACKEND["🤖 AI Orchestrator"]
    end

    %% IPC Channels
    MAIN_PROCESS <-->|"ipcMain ↔ ipcRenderer"| PRELOAD_SCRIPT
    PRELOAD_SCRIPT <-->|"contextBridge API"| RENDERER_PROCESS

    %% FFmpeg
    FFMPEG_MGR -.->|"spawn"| FFMPEG_BIN["FFmpeg Binary<br/>(bundled)"]
    FFMPEG_BIN --> RENDER_OUT["📁 Rendered Output"]

    %% External connections
    RENDERER_PROCESS -->|"HTTPS / WSS"| BACKEND
    API_CLIENT --> BACKEND
    BACKEND --> AI_BACKEND

    %% HW Detection
    HW_DETECT -.-> GPU["GPU<br/>NVENC · QSV · AMF"]

    class WM,TRAY,FFMPEG_MGR,FS,UPDATER,HW_DETECT,LOCAL_DB,NATIVE_NOTIF main
    class PRELOAD preload
    class REACT_UI,STATE,API_CLIENT,TIMELINE,VIDEOPREV,SUB_EDITOR renderer
    class FFMPEG_BIN,RENDER_OUT,GPU ipc
    class BACKEND,AI_BACKEND external
```

---

## 7. Queue & Worker Architecture

```mermaid
flowchart LR
    %% ── STYLE ──
    classDef producer fill:#6366f1,color:#fff,stroke:#4f46e5,stroke-width:2px
    classDef queue fill:#f59e0b,color:#fff,stroke:#d97706,stroke-width:2px
    classDef worker fill:#10b981,color:#fff,stroke:#059669,stroke-width:2px
    classDef output fill:#6b7280,color:#fff,stroke:#4b5563,stroke-width:2px
    classDef dlq fill:#ef4444,color:#fff,stroke:#dc2626,stroke-width:2px

    subgraph PRODUCERS [📤 Producers]
        API["API Server<br/>(Express.js)"]:::producer
        DESKTOP["Desktop App<br/>(User actions)"]:::producer
        WORKER_TRIGGER["Other Workers<br/>(chained jobs)"]:::producer
    end

    subgraph REDIS_BULLMQ [📨 Redis + BullMQ]
        Q_PRIO["⚡ Priority Queue<br/>(Paid users)"]:::queue
        Q_STD["📋 Standard Queue<br/>(Free users)"]:::queue
        Q_RENDER["🎞️ Render Queue<br/>(FFmpeg jobs)"]:::queue
        Q_UPLOAD["📤 Upload Queue<br/>(Chunk merge)"]:::queue
        Q_PUBLISH["📢 Publish Queue<br/>(Social upload)"]:::queue
        Q_NOTIF["🔔 Notification Queue<br/>(Email · Push)"]:::queue
        Q_CLEANUP["🧹 Cleanup Queue<br/>(Temp files)"]:::queue
        Q_ANALYTICS["📊 Analytics Queue<br/>(Events)"]:::queue
        Q_DLQ["💀 Dead Letter Queue<br/>(Failed after retry)"]:::dlq

        %% Internal Redis connections
        Q_PRIO --> Q_STD
        Q_STD --> Q_RENDER
        Q_STD --> Q_UPLOAD
        Q_STD --> Q_PUBLISH
        Q_STD --> Q_NOTIF
        Q_STD --> Q_CLEANUP
        Q_STD --> Q_ANALYTICS

        Q_RENDER ---> Q_DLQ
        Q_UPLOAD ---> Q_DLQ
        Q_PUBLISH ---> Q_DLQ
        Q_NOTIF ---> Q_DLQ
        Q_CLEANUP ---> Q_DLQ
    end

    subgraph WORKERS [🔧 Worker Cluster]
        W_AI["🤖 AI Worker<br/>Concurrency: 5<br/>Credit deduction"]:::worker
        W_RENDER["🎞️ Render Worker<br/>Concurrency: 2<br/>CPU/GPU intensive"]:::worker
        W_UPLOAD["📤 Upload Worker<br/>Concurrency: 10<br/>Chunk merge"]:::worker
        W_PUBLISH["📢 Publish Worker<br/>Concurrency: 3<br/>OAuth refresh"]:::worker
        W_NOTIF["🔔 Notification Worker<br/>Concurrency: 20<br/>Email · Push"]:::worker
        W_CLEANUP["🧹 Cleanup Worker<br/>Concurrency: 5<br/>Scheduled"]:::worker
        W_ANALYTICS["📊 Analytics Worker<br/>Batch processing<br/>Aggregation"]:::worker
    end

    subgraph OUTPUTS [📦 Outputs / Storage]
        DB[("💾 PostgreSQL")]:::output
        STORE[("☁️ Object Storage")]:::output
        EXT["🌐 External APIs"]:::output
    end

    %% Connections
    PRODUCERS --> REDIS_BULLMQ
    REDIS_BULLMQ --> WORKERS
    
    W_AI --> DB
    W_AI --> STORE
    W_RENDER --> DB
    W_RENDER --> STORE
    W_UPLOAD --> DB
    W_UPLOAD --> STORE
    W_PUBLISH --> EXT
    W_NOTIF --> EXT
    W_ANALYTICS --> DB
    W_CLEANUP --> STORE
    W_CLEANUP --> DB
```

---

## 8. Billing & Credit System

```mermaid
flowchart TD
    %% ── STYLE ──
    classDef plan fill:#6366f1,color:#fff,stroke:#4f46e5,stroke-width:2px
    classDef action fill:#06b6d4,color:#fff,stroke:#0891b2,stroke-width:1px
    classDef credit fill:#10b981,color:#fff,stroke:#059669,stroke-width:2px
    classDef deduct fill:#f59e0b,color:#fff,stroke:#d97706,stroke-width:2px
    classDef refund fill:#ef4444,color:#fff,stroke:#dc2626,stroke-width:2px
    classDef db fill:#6b7280,color:#fff,stroke:#4b5563,stroke-width:1px

    USER(( "👤 User" )):::plan

    subgraph PLANS [📋 Subscription Plans]
        FREE["🆓 Free<br/>100 credits/mo<br/>5 jobs/day · 720p"]:::plan
        STARTER["🚀 Starter<br/>$9/mo · 500 credits<br/>20 jobs/day · 1080p"]:::plan
        PRO["⚡ Pro<br/>$29/mo · 2,000 credits<br/>100 jobs/day · Cloud render"]:::plan
        BIZ["🏢 Business<br/>$99/mo · 5,000 credits<br/>500 jobs/day · 4K"]:::plan
        ENTERPRISE["👑 Enterprise<br/>Custom pricing<br/>Unlimited"]:::plan
    end

    subgraph SOURCES [💳 Credit Sources]
        SUB_ALLOC["📅 Subscription Allocation<br/>• Monthly cycle<br/>• Resets each month<br/>• No rollover"]
        PURCHASE["🛒 Credit Purchase<br/>• One-time packs<br/>• Never expires<br/>• 100/500/1000/5000"]
        BONUS["🎁 Bonus Credits<br/>• Signup: 100<br/>• Referral<br/>• Promotions<br/>• May expire"]
        ADMIN_ADJ["🔧 Admin Adjustment<br/>• Manual<br/>• Requires reason<br/>• Fully audited"]
        REFUND["🔙 Refund Credits<br/>• Failed jobs (auto)<br/>• Cancelled before exec"]
    end

    subgraph CONSUMPTION [⚖️ Credit Consumption Priority]
        PRIO1["1️⃣ Subscription credits (expiring soon)"]
        PRIO2["2️⃣ Subscription credits (current cycle)"]
        PRIO3["3️⃣ Bonus credits (expiring soon)"]
        PRIO4["4️⃣ Purchased credits (never expire)"]
    end

    subgraph LEDGER [📒 Double-Entry Ledger]
        TXN["wallet_transactions<br/>• id · wallet_id<br/>• amount · balance_before<br/>• balance_after · type<br/>• reference_id · description<br/>• I M M U T A B L E"]
        AUDIT["audit_logs<br/>• actor · action<br/>• target · details<br/>• ip_address<br/>• created_at"]
    end

    subgraph RULES [📜 Credit Rules]
        RULE1["✅ Deducted when job = COMPLETED"]
        RULE2["✅ Deducted when job = PARTIALLY_COMPLETED"]
        RULE3["❌ NOT deducted when job = CREATED"]
        RULE4["❌ NOT deducted when job = FAILED"]
        RULE5["❌ NOT deducted for CACHE HITS"]
        RULE6["🔙 REFUNDED on failed after retries"]
        RULE7["🔙 REFUNDED on provider error"]
        RULE8["🔙 REFUNDED on cancelled before execution"]
    end

    USER -->|"Subscribe"| PLANS
    USER -->|"Purchase"| SOURCES

    PLANS --> SUB_ALLOC
    SOURCES --> CONSUMPTION
    CONSUMPTION --> LEDGER

    LEDGER --> RULES
    RULES -->|"Job succeeds"| DEDUCT_OK["✅ Credit deducted"]:::deduct
    RULES -->|"Job fails"| DEDUCT_FAIL["🔙 Credit refunded"]:::refund
    RULES -->|"Cache hit"| CACHE["💾 No deduction"]:::refund

    DEDUCT_OK --> BALANCE[("wallet<br/>current_balance")]:::db
    DEDUCT_FAIL --> BALANCE
    CACHE --> BALANCE
```

---

## 9. Deployment & CI/CD Architecture

```mermaid
flowchart LR
    %% ── STYLE ──
    classDef dev fill:#6b7280,color:#fff,stroke:#4b5563,stroke-width:1px
    classDef ci fill:#6366f1,color:#fff,stroke:#4f46e5,stroke-width:2px
    classDef registry fill:#8b5cf6,color:#fff,stroke:#7c3aed,stroke-width:2px
    classDef staging fill:#f59e0b,color:#fff,stroke:#d97706,stroke-width:2px
    classDef prod fill:#10b981,color:#fff,stroke:#059669,stroke-width:2px
    classDef fail fill:#ef4444,color:#fff,stroke:#dc2626,stroke-width:1px

    subgraph DEV [💻 Developer]
        CODE["📝 Code Push<br/>main branch"]
        PR["🔀 Pull Request"]
    end

    subgraph CI [🔧 CI Pipeline — GitHub Actions]
        LINT["📋 Lint<br/>ESLint · Prettier"]
        TYPE["📐 Type Check<br/>TypeScript"]
        TEST["🧪 Test<br/>Vitest · Supertest"]
        BUILD["📦 Build<br/>Docker multi-stage"]
        SCAN["🔒 Security Scan<br/>Trivy · Snyk"]
    end

    subgraph REGISTRY [📦 Container Registry]
        DOCKER_HUB["🐳 Docker Hub / GHCR<br/>• tagged: latest, v1.0.0<br/>• digest verification"]
    end

    subgraph STAGING [🧪 Staging Environment]
        STG_API["API Server<br/>(staging.api.*)"]
        STG_WEB["Web SaaS<br/>(staging.app.*)"]
        STG_DB[("Staging DB<br/>Neon branch")]
        STG_REDIS[("Staging Redis")]
        STG_WORKERS["Workers"]
        STG_TEST["🔍 Integration Tests<br/>Playwright · API tests"]
    end

    subgraph PRODUCTION [🚀 Production Environment]
        subgraph BLUE_GREEN [🎯 Blue-Green Deployment]
            BLUE["🔵 Blue (Live)<br/>api.example.com<br/>app.example.com"]
            GREEN["🟢 Green (Standby)<br/>api-green.example.com<br/>app-green.example.com"]
        end

        PROD_LB["⚖️ Load Balancer<br/>Nginx → Switch traffic"]:::prod
        PROD_DB[("Primary DB<br/>Supabase PostgreSQL")]:::prod
        PROD_REDIS[("Redis Cluster<br/>Sentinel)"]:::prod
        PROD_STORE[("Object Storage<br/>Cloudflare R2")]:::prod
        PROD_WORKERS["Worker Pool<br/>(Auto-scaled)"]:::prod

        subgraph MONITORING [📈 Monitoring]
            PROM["Prometheus<br/>Metrics"]
            GRAFANA["Grafana<br/>Dashboards"]
            SENTRY["Sentry<br/>Error tracking"]
            LOKI["Loki / ELK<br/>Log aggregation"]
        end
    end

    subgraph ROLLBACK [⏪ Rollback Procedures]
        RB_API["API: < 5 menit<br/>Swap Nginx upstream"]
        RB_WEB["Web: < 2 menit<br/>Vercel rollback"]
        RB_DB["DB: < 30 menit<br/>Expand-Contract pattern"]
    end

    %% Flow
    DEV --> PR
    PR --> CI
    CODE --> CI
    CI --> LINT --> TYPE --> TEST --> BUILD --> SCAN
    BUILD --> DOCKER_HUB

    DOCKER_HUB -->|"deploy staging"| STAGING
    STAGING --> STG_TEST
    
    STG_TEST -->|"✅ All Green"| PRODUCTION
    STG_TEST -->|"❌ Failed"| FAIL["⛔ Block deployment"]:::fail

    PRODUCTION --> BLUE_GREEN
    BLUE_GREEN --> PROD_LB
    GREEN --> PROD_LB
    
    PROD_LB --> PROD_DB
    PROD_LB --> PROD_REDIS
    PROD_LB --> PROD_STORE
    PROD_LB --> PROD_WORKERS

    PRODUCTION --> MONITORING
    MONITORING --> ROLLBACK

    %% Staging resources
    STAGING --> STG_DB
    STAGING --> STG_REDIS
    STAGING --> STG_WORKERS
```

---

## 10. Database Entity Relationships

```mermaid
erDiagram
    %% ── AUTH DOMAIN ──
    users ||--o| user_credentials : has
    users ||--o{ user_sessions : has
    users ||--o{ user_oauth_accounts : links
    users ||--o{ user_social_accounts : connects
    
    users {
        uuid id PK
        string email UK
        string username UK
        string display_name
        enum role "user | admin | super_admin"
        boolean is_active
        timestamp email_verified_at
        timestamp created_at
    }

    %% ── PROJECT DOMAIN ──
    users ||--o{ projects : owns
    projects ||--o{ project_versions : versions
    projects ||--o{ media_files : contains
    projects ||--o{ clips : generates
    
    projects {
        uuid id PK
        uuid user_id FK
        string title
        string description
        enum status "draft | processing | ready | archived"
        json settings
        timestamp created_at
    }

    %% ── MEDIA DOMAIN ──
    media_files ||--o{ media_metadata : describes
    media_files ||--o{ media_proxies : preview
    media_files ||--o{ transcript : has
    media_files ||--o{ scenes : segments
    
    media_files {
        uuid id PK
        uuid project_id FK
        string filename
        string mime_type
        bigint file_size
        float duration
        string storage_path
        string checksum
        timestamp created_at
    }

    %% ── AI DOMAIN ──
    ai_jobs ||--|| ai_job_results : produces
    ai_jobs ||--|| ai_job_errors : errors
    ai_providers ||--o{ ai_models : offers
    ai_providers ||--o{ ai_routing_rules : configured
    
    ai_jobs {
        uuid id PK
        uuid media_file_id FK
        uuid user_id FK
        uuid wallet_id FK
        enum job_type "transcription | scene_detection | viral_detection | ..."
        enum status "created | queued | running | completed | failed"
        uuid provider_id FK
        uuid model_id FK
        int credits_used
        float cost_usd
        json result_summary
        timestamp created_at
    }

    ai_providers {
        uuid id PK
        string name
        enum provider_type "openrouter | nvidia | opencode"
        string api_endpoint
        json auth_config
        enum status "healthy | warning | degraded | offline"
        timestamp last_health_check
    }

    ai_routing_rules {
        uuid id PK
        uuid provider_id FK
        enum operation_type
        int priority
        json conditions
        boolean is_active
    }

    %% ── BILLING DOMAIN ──
    users ||--|| wallet : has
    wallet ||--o{ wallet_transactions : records
    users ||--o{ subscriptions : subscribes
    subscriptions ||--o{ subscription_items : includes
    users ||--o{ invoices : billed
    
    wallet {
        uuid id PK
        uuid user_id FK
        int subscription_credits
        int purchased_credits
        int bonus_credits
        int total_used
        timestamp created_at
    }

    subscriptions {
        uuid id PK
        uuid user_id FK
        enum plan_type "free | starter | pro | business | enterprise"
        enum status "active | past_due | cancelled | expired"
        timestamp current_period_start
        timestamp current_period_end
        string stripe_subscription_id
    }

    %% ── SOCIAL / PUBLISH DOMAIN ──
    user_social_accounts ||--o{ publish_jobs : publishes
    publish_jobs ||--o{ published_posts : results
    
    publish_jobs {
        uuid id PK
        uuid user_id FK
        uuid social_account_id FK
        uuid clip_id FK
        enum platform "youtube | tiktok | instagram"
        string title
        string description
        json tags
        enum status "draft | scheduled | publishing | published | failed"
        timestamp scheduled_at
    }

    %% ── RENDER DOMAIN ──
    clips ||--o{ render_jobs : renders
    
    render_jobs {
        uuid id PK
        uuid clip_id FK
        uuid user_id FK
        enum mode "local | cloud"
        enum status "pending | rendering | completed | failed"
        int progress
        float fps
        string output_path
        timestamp completed_at
    }
```

---

## 11. AI Orchestrator — Internal Architecture & State Machine

```mermaid
flowchart TD
    %% ── STYLE ──
    classDef engine fill:#6366f1,color:#fff,stroke:#4f46e5,stroke-width:2px
    classDef flow fill:#06b6d4,color:#fff,stroke:#0891b2,stroke-width:1px
    classDef state fill:#f59e0b,color:#fff,stroke:#d97706,stroke-width:2px
    classDef terminal fill:#10b981,color:#fff,stroke:#059669,stroke-width:2px
    classDef error fill:#ef4444,color:#fff,stroke:#dc2626,stroke-width:2px
    classDef cache fill:#8b5cf6,color:#fff,stroke:#7c3aed,stroke-width:1px
    classDef decision fill:#f59e0b,color:#fff,stroke:#d97706,stroke-width:1px

    subgraph ORCH_INTERNALS [🧠 AI Orchestrator — Internal Engines]
        ROUTER["🔀 Router Engine<br/>• Select provider via rule engine<br/>• Check capability matrix<br/>• Apply user preferences<br/>• Fallback chain"]:::engine

        PROMPT["📝 Prompt Engine<br/>• Load prompt template<br/>• Inject {{variables}}<br/>• Version control<br/>• A/B test experiments"]:::engine

        CREDIT["💰 Credit Engine<br/>• Estimate cost before exec<br/>• Validate sufficient credits<br/>• Reserve credits<br/>• Deduct on completion<br/>• Refund on failure"]:::engine

        CACHE["💾 Cache Engine<br/>• Hash input parameters<br/>• L1: Redis (fast)<br/>• L2: DB (persistent)<br/>• TTL per operation type"]:::cache

        FALLBACK["🔄 Fallback Manager<br/>• Retry with backoff<br/>• Switch provider<br/>• Dead letter on max retry"]:::engine

        HEALTH["❤️ Health Monitor<br/>• Check every 60s<br/>• Track error rate<br/>• Status: healthy→warning→degraded→offline"]:::engine

        METRICS["📊 Metrics Collector<br/>• Latency · Tokens · Cost<br/>• Cache hit rate<br/>• Provider market share<br/>• Queue depth"]:::engine
    end

    subgraph ORCH_JOB_FLOW [📋 Job Execution Flow]
        RECEIVE["📥 Receive Request<br/>From API / Worker"]:::flow
        VALIDATE["🔍 Validate<br/>• Credits sufficient?<br/>• Rate limits OK?<br/>• Job dependencies met?"]:::flow
        CACHE_CHECK["💾 Cache Check<br/>• Hash input → Redis<br/>• Hit → return cached"]:::cache
        ESTIMATE["📊 Estimate Cost<br/>• Tokens / Duration / Frames<br/>• Reserve credits"]:::flow
        ROUTE_STEP["🔀 Route to Provider<br/>• Auto / Manual / Hybrid"]:::engine
        EXECUTE["⚡ Execute AI Call<br/>• Send to provider<br/>• Stream progress<br/>• Monitor timeout"]:::flow
        HANDLE_RESULT["📦 Handle Result<br/>• Validate response<br/>• Store to DB<br/>• Deduct credits<br/>• Record metrics"]:::flow
    end

    subgraph JOB_STATES [🔄 AI Job State Machine]
        CREATED["🆕 Created<br/>Job record in DB"]:::state
        QUEUED["📨 Queued<br/>Added to BullMQ"]:::state
        WAITING["⏳ Waiting Worker<br/>In queue, no worker"]:::state
        RUNNING["⚡ Running<br/>Worker picked up"]:::state
        RETRY["🔁 Retry<br/>Exponential backoff<br/>Max 3 attempts"]:::state
        COMPLETED["✅ Completed<br/>Success"]:::terminal
        FAILED["❌ Failed<br/>After all retries"]:::error
        CANCELLED["⛔ Cancelled<br/>By user / system"]:::error
        ARCHIVED["📦 Archived<br/>After retention TTL"]:::terminal
    end

    subgraph PROVIDER_STATES [💡 AI Provider State Machine]
        P_HEALTHY["✅ Healthy<br/>Latency < threshold<br/>Error rate < 1%"]:::terminal
        P_WARNING["⚠️ Warning<br/>Latency elevated<br/>Error rate 1-5%"]:::state
        P_DEGRADED["🔶 Degraded<br/>Latency very high<br/>Error rate 5-15%"]:::state
        P_OFFLINE["🔴 Offline<br/>No response<br/>Error rate > 15%"]:::error
        P_RECOVERED["🔄 Recovered<br/>Gradual restore"]:::state
    end

    RECEIVE --> VALIDATE
    VALIDATE --> CACHE_CHECK
    CACHE_CHECK -->|"❌ Miss"| ESTIMATE
    CACHE_CHECK -->|"✅ Hit"| RETURN_CACHE["↩️ Return Cached Result"]:::cache
    ESTIMATE --> ROUTE_STEP
    ROUTE_STEP --> EXECUTE
    EXECUTE -->|"⏱️ Timeout"| FALLBACK
    FALLBACK -.->|"Retry"| EXECUTE
    FALLBACK -.->|"Switch provider"| ROUTE_STEP
    EXECUTE --> HANDLE_RESULT

    %% State transitions
    CREATED --> QUEUED
    QUEUED --> WAITING
    WAITING --> RUNNING
    RUNNING -->|"Success"| COMPLETED
    RUNNING -->|"Failure"| RETRY
    RETRY -->|"Max 3 reached"| FAILED
    RETRY --> RUNNING
    CREATED -->|"User cancels"| CANCELLED
    QUEUED -->|"User cancels"| CANCELLED
    WAITING -->|"User cancels"| CANCELLED
    RUNNING -->|"User cancels"| CANCELLED
    FAILED --> ARCHIVED
    COMPLETED --> ARCHIVED
    CANCELLED --> ARCHIVED

    %% Provider states
    P_HEALTHY -->|"Latency ↑ or errors ↑"| P_WARNING
    P_WARNING -->|"Continues"| P_DEGRADED
    P_DEGRADED -->|"No response"| P_OFFLINE
    P_OFFLINE -->|"Recovers"| P_RECOVERED
    P_RECOVERED --> P_HEALTHY
    P_WARNING -->|"Returns to normal"| P_HEALTHY
    P_DEGRADED -->|"Returns to normal"| P_HEALTHY

    %% Engine usage
    ROUTE_STEP --> ROUTER
    VALIDATE --> CREDIT
    ESTIMATE --> CREDIT
    HANDLE_RESULT --> CREDIT
    HANDLE_RESULT --> METRICS
    EXECUTE --> PROMPT
    EXECUTE --> HEALTH
```

---

## 12. Auth Service — Internal Flows

```mermaid
flowchart TD
    %% ── STYLE ──
    classDef flow fill:#06b6d4,color:#fff,stroke:#0891b2,stroke-width:1px
    classDef security fill:#8b5cf6,color:#fff,stroke:#7c3aed,stroke-width:2px
    classDef db fill:#6b7280,color:#fff,stroke:#4b5563,stroke-width:2px
    classDef decision fill:#f59e0b,color:#fff,stroke:#d97706,stroke-width:1px
    classDef error fill:#ef4444,color:#fff,stroke:#dc2626,stroke-width:1px

    subgraph REGISTER [📝 Registration Flow]
        REG_START["👤 Guest clicks Register"]:::flow
        REG_INPUT["✏️ Input: Name · Email · Password · Confirm"]:::flow
        REG_VALIDATE{"✅ Validate<br/>• Email format (RFC 5322)<br/>• Password ≥ 8 chars<br/>• Contains upper, lower, number<br/>• Breed domain? (HIBP)"}:::decision
        REG_HASH["🔐 Hash password<br/>Algorithm: Argon2id<br/>Memory: 64MB<br/>Iterations: 3"]:::security
        REG_CREATE["📦 Create user record"]:::flow
        REG_TOKEN["🎫 Generate verification token<br/>Expires: 24 hours"]:::flow
        REG_EMAIL["📧 Send verification email"]:::flow
        REG_AUDIT["📝 Audit log: user.created"]:::flow
        REG_OK["✅ 201 Created"]:::flow
    end

    REG_START --> REG_INPUT --> REG_VALIDATE
    REG_VALIDATE -->|"❌ Invalid"| REG_ERR["⛔ 400 / 409 Error"]:::error
    REG_VALIDATE -->|"✅ Valid"| REG_HASH --> REG_CREATE --> REG_TOKEN --> REG_EMAIL --> REG_AUDIT --> REG_OK

    subgraph LOGIN [🔑 Login Flow]
        LOG_START["👤 User submits credentials"]:::flow
        LOG_INPUT["✏️ Input: Email · Password"]:::flow
        LOG_FETCH["🔍 Fetch user + credentials from DB"]:::flow
        LOG_CHECK{"🔐 Password valid?<br/>Argon2id verify"}:::decision
        LOG_JWT["🎫 Generate JWT<br/>Algorithm: RS256<br/>Lifetime: 15 minutes<br/>Claims: userId, email, role"]:::security
        LOG_REFRESH["🔄 Generate refresh token<br/>Lifetime: 30 days<br/>Stored as SHA-256 hash"]:::security
        LOG_SESSION["💾 Save session record<br/>• Device fingerprint<br/>• IP address<br/>• User agent"]:::flow
        LOG_OK["✅ Return tokens"]:::flow
    end

    LOG_START --> LOG_INPUT --> LOG_FETCH --> LOG_CHECK
    LOG_CHECK -->|"❌ Wrong password"| LOG_FAIL["⛔ 401 Unauthorized<br/>• Count failed attempts<br/>• Lock after N failures (15min)"]:::error
    LOG_CHECK -->|"✅ Valid"| LOG_JWT --> LOG_REFRESH --> LOG_SESSION --> LOG_OK

    subgraph OAUTH_FLOW [🔑 OAuth 2.0 Flow]
        OAUTH_START["👤 User clicks Google/GitHub login"]:::flow
        OAUTH_REDIR["↪️ Redirect to provider<br/>• State param (CSRF)<br/>• PKCE code challenge"]:::security
        OAUTH_CALLBACK["📡 OAuth callback received"]:::flow
        OAUTH_VALIDATE{"🔐 Validate:<br/>• State matches?<br/>• PKCE verifier?<br/>• Redirect URI exact?"}:::decision
        OAUTH_EXCHANGE["🔄 Exchange code for tokens<br/>• Access + Refresh token"]:::flow
        OAUTH_STORE["🔐 Encrypt tokens (AES-256-GCM)<br/>Store in user_oauth_accounts"]:::security
        OAUTH_FIND_USER{"👤 User exists?"}:::decision
        OAUTH_CREATE["✨ Create new user + wallet"]:::flow
        OAUTH_LINK["🔗 Link OAuth to existing user"]:::flow
        OAUTH_OK["✅ Return JWT + Refresh"]:::flow
    end

    OAUTH_START --> OAUTH_REDIR --> OAUTH_CALLBACK --> OAUTH_VALIDATE
    OAUTH_VALIDATE -->|"❌ Invalid"| OAUTH_ERR["⛔ Redirect with error"]:::error
    OAUTH_VALIDATE -->|"✅ Valid"| OAUTH_EXCHANGE --> OAUTH_STORE --> OAUTH_FIND_USER
    OAUTH_FIND_USER -->|"New"| OAUTH_CREATE --> OAUTH_LINK
    OAUTH_FIND_USER -->|"Existing"| OAUTH_LINK
    OAUTH_LINK --> OAUTH_OK

    subgraph SESSION_MGMT [🛡️ Session & Token Management]
        TOKEN_CHECK{"🔍 On each API request:<br/>1. JWT signature valid?<br/>2. Not expired?<br/>3. Session not revoked?<br/>4. User status active?<br/>5. IP range matches? (opt)"}:::decision
        TOKEN_OK["✅ Proceed to handler"]:::flow
        TOKEN_REF["🔄 Call /auth/refresh<br/>• Rotate refresh token<br/>• Return new JWT"]:::flow
        TOKEN_REUSE{"⚠️ Old token reused?<br/>(After rotation)"}:::decision
        TOKEN_REVOKE["⛔ Revoke ALL sessions<br/>Alert user"]:::error

        PASS_RESET["📧 Forgot Password<br/>• Generate reset token (1 hour)<br/>• Send email<br/>• User sets new password"]:::flow
        PASS_CHANGE["🔐 Change Password<br/>• Verify old password<br/>• New: Argon2id hash<br/>• Revoke all sessions"]:::security
    end

    TOKEN_CHECK -->|"✅ All pass"| TOKEN_OK
    TOKEN_CHECK -->|"⏰ Expired"| TOKEN_REF
    TOKEN_REF --> TOKEN_OK
    TOKEN_REF -.-> TOKEN_REUSE
    TOKEN_REUSE -->|"Yes ⚠️"| TOKEN_REVOKE
    TOKEN_CHECK -->|"❌ Other failure"| TOKEN_FAIL["⛔ 401 Unauthorized"]:::error

    subgraph RBAC [👑 Role-Based Access Control]
        RBAC_CHECK{"🔍 Check user role"}:::decision
        RBAC_GUEST["guest → Public pages only"]:::flow
        RBAC_USER["user → Own resources only"]:::flow
        RBAC_ADMIN["admin → Admin panel, all users"]:::flow
        RBAC_SUPER["super_admin → Full access"]:::flow
        RBAC_API["api_key → Scoped API access"]:::flow
    end

    %% DB Tables
    subgraph AUTH_DB [🗄️ Auth Database Tables]
        T_USERS[("users<br/>• PK: id (uuid)<br/>• email, username, display_name<br/>• role, is_active<br/>• email_verified_at")]
        T_CREDENTIALS[("user_credentials<br/>• password_hash<br/>• algorithm (Argon2id)<br/>• last_changed_at")]
        T_SESSIONS[("user_sessions<br/>• refresh_token_hash<br/>• device_fingerprint<br/>• ip, user_agent<br/>• expires_at, revoked_at")]
        T_OAUTH[("user_oauth_accounts<br/>• provider, provider_id<br/>• tokens (encrypted)<br/>• scopes")]
        T_VERIFY[("verification_tokens<br/>• token, type<br/>• expires_at<br/>• used_at")]
    end

    REG_CREATE --> T_USERS
    REG_HASH --> T_CREDENTIALS
    REG_TOKEN --> T_VERIFY
    LOG_SESSION --> T_SESSIONS
    OAUTH_STORE --> T_OAUTH
```

---

## 13. Billing Service — Lifecycle & Ledger

```mermaid
flowchart TD
    %% ── STYLE ──
    classDef state fill:#6366f1,color:#fff,stroke:#4f46e5,stroke-width:2px
    classDef action fill:#06b6d4,color:#fff,stroke:#0891b2,stroke-width:1px
    classDef ledger fill:#10b981,color:#fff,stroke:#059669,stroke-width:2px
    classDef external fill:#ef4444,color:#fff,stroke:#dc2626,stroke-width:2px
    classDef db fill:#6b7280,color:#fff,stroke:#4b5563,stroke-width:1px

    subgraph SUB_LIFECYCLE [📋 Subscription Lifecycle]
        TRIAL["🆓 Trial<br/>Free plan with limited credits"]:::state
        ACTIVE["✅ Active<br/>Paying subscriber"]:::state
        GRACE["⏳ Grace Period<br/>Payment failed, still active"]:::state
        PAST_DUE["⚠️ Past Due<br/>N days overdue, features limited"]:::state
        CANCELLED["❌ Cancelled<br/>End of billing cycle"]:::state
        EXPIRED["⏰ Expired<br/>No active subscription"]:::state
        RENEWED["🔄 Renewed<br/>New billing cycle starts"]:::state
    end

    subgraph SUB_TRANSITIONS [🔄 Subscription State Transitions]
        TRIAL -->|"Subscribe"| ACTIVE
        ACTIVE -->|"Payment fails"| GRACE
        GRACE -->|"Payment retry OK"| ACTIVE
        GRACE -->|"N days passed"| PAST_DUE
        PAST_DUE -->|"Payment received"| ACTIVE
        PAST_DUE -->|"Cancelled"| CANCELLED
        ACTIVE -->|"User cancels"| CANCELLED
        CANCELLED -->|"End of period"| EXPIRED
        ACTIVE -->|"Billing date"| RENEWED
        RENEWED --> ACTIVE
        EXPIRED -->|"User resubscribes"| ACTIVE
        ACTIVE -->|"Upgrade / Downgrade"| ACTIVE
    end

    subgraph CREDIT_FLOW [💳 Credit Wallet Flow]
        direction LR
        WALLET_OPEN["📂 Wallet created<br/>(on user register)"]:::action
        
        subgraph CREDIT_SOURCES [Credit Sources]
            SUB_CREDITS["📅 Subscription allocation<br/>Monthly reset · No rollover"]:::state
            PURCHASED["🛒 Purchased credits<br/>One-time · Never expire"]:::state
            BONUS_CREDITS["🎁 Bonus credits<br/>Signup · Referral · Promo"]:::state
            ADMIN_CREDITS["🔧 Admin adjustment"]:::action
        end

        subgraph CREDIT_CONSUMPTION [Consumption Priority]
            PRIORITY["1️⃣ Subscription (expiring)<br/>2️⃣ Subscription (current)<br/>3️⃣ Bonus (expiring)<br/>4️⃣ Purchased (never)"]:::state
        end

        subgraph CREDIT_RULES [Rules]
            DEDUCT_OK["✅ Deduct on COMPLETED"]:::action
            DEDUCT_PARTIAL["✅ Deduct on PARTIAL"]:::action
            REFUND_FAIL["🔙 Refund on FAILED (after retries)"]:::action
            REFUND_CANCEL["🔙 Refund on CANCELLED (before exec)"]:::action
            NO_DEDUCT_CACHE["💾 No deduction on CACHE HIT"]:::action
        end
    end

    subgraph DOUBLE_ENTRY [📒 Double-Entry Ledger System]
        LEDGER_WALLET[("wallet<br/>• current_balance<br/>• subscription_credits<br/>• purchased_credits<br/>• bonus_credits")]:::db

        LEDGER_TX[("wallet_transactions<br/>• id · wallet_id · type<br/>• amount · balance_before<br/>• balance_after<br/>• reference_id<br/>• description<br/>• I M M U T A B L E")]:::db

        LEDGER_AUDIT[("audit_logs<br/>• actor · action · target<br/>• before · after<br/>• ip_address<br/>• created_at")]:::db
    end

    subgraph PAYMENT_INT [💳 Payment Integration]
        STRIPE["Stripe<br/>• Primary (MVP)<br/>• Payment Intents<br/>• Subscriptions API"]:::external
        MIDTRANS["Midtrans<br/>• Indonesia market<br/>• Bank transfer · CC"]:::external
        XENDIT["Xendit<br/>• Indonesia market<br/>• E-wallet · Retail"]:::external
        PAYPAL["PayPal<br/>• Future integration"]:::external

        WEBHOOK["🔌 Webhook Handler<br/>• Verify signature<br/>• Update subscription<br/>• Create invoice<br/>• Add credits"]:::action
    end

    subgraph INVOICE_SYSTEM [🧾 Invoice System]
        INVOICE[("invoices<br/>• invoice_number<br/>• user_id · status<br/>• subtotal · tax · total<br/>• paid_at")]:::db
        INVOICE_ITEM[("invoice_items<br/>• description<br/>• quantity · unit_price<br/>• amount")]:::db
    end

    subgraph COUPON [🎫 Coupon / Promo]
        COUPON_ENTRY[("coupons<br/>• code · type<br/>• value · max_uses<br/>• valid_from · until<br/>• used_count")]:::db
    end

    %% Connections
    TRIAL --> ACTIVE
    ACTIVE --> SUB_CREDITS
    PURCHASED --> PRIORITY
    SUB_CREDITS --> PRIORITY
    BONUS_CREDITS --> PRIORITY
    PRIORITY --> LEDGER_WALLET
    LEDGER_WALLET --> LEDGER_TX
    LEDGER_TX --> LEDGER_AUDIT

    DEDUCT_OK --> LEDGER_TX
    REFUND_FAIL --> LEDGER_TX
    REFUND_CANCEL --> LEDGER_TX
    NO_DEDUCT_CACHE -.->|"Skip"| LEDGER_WALLET

    ACTIVE --> PAYMENT_INT
    PAYMENT_INT --> WEBHOOK
    WEBHOOK --> INVOICE_SYSTEM
    WEBHOOK --> SUB_LIFECYCLE
    WEBHOOK --> CREDIT_FLOW

    COUPON --> PAYMENT_INT
```

---

## 14. Render & Publish Service — State Machines

```mermaid
flowchart TD
    %% ── STYLE ──
    classDef state fill:#6366f1,color:#fff,stroke:#4f46e5,stroke-width:2px
    classDef action fill:#06b6d4,color:#fff,stroke:#0891b2,stroke-width:1px
    classDef decision fill:#f59e0b,color:#fff,stroke:#d97706,stroke-width:1px
    classDef done fill:#10b981,color:#fff,stroke:#059669,stroke-width:2px
    classDef error fill:#ef4444,color:#fff,stroke:#dc2626,stroke-width:2px
    classDef hardware fill:#8b5cf6,color:#fff,stroke:#7c3aed,stroke-width:2px

    subgraph RENDER_PIPELINE [🎞️ Render Pipeline State Machine]
        R_CREATED["🆕 Created<br/>Job record created"]:::state
        R_QUEUED["📨 Queued<br/>Added to Render Queue"]:::state
        R_ENCODING["🎥 Encoding<br/>FFmpeg running"]:::state
        R_MUXING["📦 Muxing<br/>Video + Audio + Subs"]:::state
        R_UPLOADING["☁️ Uploading<br/>To object storage"]:::state
        R_COMPLETED["✅ Completed<br/>Ready for download"]:::done
        R_FAILED["❌ Failed<br/>Error occurred"]:::error
    end

    subgraph RENDER_TRANSITIONS [🔄 Render State Transitions]
        R_CREATED --> R_QUEUED
        R_QUEUED --> R_ENCODING
        R_ENCODING -->|"GPU failed"| GPU_FALLBACK{"🔄 GPU Fallback?"}:::decision
        GPU_FALLBACK -->|"Yes"| R_ENCODING
        GPU_FALLBACK -->|"No"| R_FAILED
        R_ENCODING --> R_MUXING
        R_MUXING --> R_UPLOADING
        R_UPLOADING --> R_COMPLETED
        R_ENCODING -->|"Timeout"| R_FAILED
        R_MUXING -->|"Error"| R_FAILED
        R_UPLOADING -->|"Retry (max 3)"| R_UPLOADING
        R_FAILED -->|"Re-queue"| R_QUEUED
    end

    subgraph GPU_ENCODING [🎮 Hardware Encoding Selection]
        HW_DETECT["🔍 Detect Hardware"]:::hardware
        HW_NVIDIA["NVIDIA NVENC<br/>h264_nvenc · hevc_nvenc<br/>RTX 40xx: AV1"]:::hardware
        HW_INTEL["Intel QuickSync (QSV)<br/>h264_qsv · hevc_qsv<br/>iGPU 11th+"]:::hardware
        HW_AMD["AMD AMF<br/>h264_amf · hevc_amf<br/>RX 6000+: AV1"]:::hardware
        HW_CPU["CPU Software<br/>libx264 · libx265 · libsvtav1<br/>(Fallback)"]:::hardware
    end

    HW_DETECT --> HW_NVIDIA
    HW_DETECT --> HW_INTEL
    HW_DETECT --> HW_AMD
    HW_DETECT --> HW_CPU
    HW_DETECT -.-> R_ENCODING
    HW_NVIDIA -.-> R_ENCODING
    HW_INTEL -.-> R_ENCODING
    HW_AMD -.-> R_ENCODING
    HW_CPU -.-> R_ENCODING

    subgraph LOCAL_VS_CLOUD [💻 Local vs Cloud Render]
        RENDER_MODE{"📍 Render Mode"}:::decision
        LOCAL["🖥️ Local Render<br/>• FFmpeg on user machine<br/>• GPU/CPU encoding<br/>• Desktop app process<br/>• Progress via IPC → WS"]:::action
        CLOUD["☁️ Cloud Render<br/>• Worker picks up job<br/>• Server-side FFmpeg<br/>• GPU instance<br/>• Progress via WebSocket"]:::action
    end

    RENDER_MODE -->|"Desktop user"| LOCAL
    RENDER_MODE -->|"SaaS user (Pro+)"| CLOUD
    LOCAL --> R_ENCODING
    CLOUD --> R_ENCODING

    subgraph PUBLISH_FLOW [📢 Publishing Flow]
        P_DRAFT["📝 Draft<br/>Post created, not ready"]:::state
        P_SCHEDULED["📅 Scheduled<br/>Timestamp set"]:::state
        P_PUBLISHING["📤 Publishing<br/>Uploading to platform"]:::state
        P_PUBLISHED["✅ Published<br/>Live on platform"]:::done
        P_FAILED["❌ Failed<br/>API error / Auth error"]:::error
        P_RETRY["🔄 Retry<br/>Refreshing OAuth + retry"]:::state
    end

    subgraph PUBLISH_TRANSITIONS [🔄 Publish State Transitions]
        P_DRAFT --> P_SCHEDULED
        P_DRAFT --> P_PUBLISHING
        P_SCHEDULED -->|"Time reached"| P_PUBLISHING
        P_PUBLISHING --> P_PUBLISHED
        P_PUBLISHING -->|"OAuth expired"| OAUTH_REFRESH["🔄 Refresh OAuth Token"]:::action
        OAUTH_REFRESH --> P_PUBLISHING
        P_PUBLISHING -->|"API error"| P_FAILED
        P_FAILED -->|"Retry"| P_RETRY
        P_RETRY --> P_PUBLISHING
    end

    subgraph PUBLISH_OPS [📡 Publish Operations]
        YOUTUBE["YouTube API<br/>• Upload video<br/>• Set title/desc/tags<br/>• Set visibility"]:::action
        TIKTOK["TikTok API<br/>• Upload video<br/>• Caption · Hashtags<br/>• Schedule post"]:::action
        INSTAGRAM["Instagram Graph API<br/>• Reels upload<br/>• Cover image<br/>• Caption"]:::action
    end

    P_PUBLISHING --> YOUTUBE
    P_PUBLISHING --> TIKTOK
    P_PUBLISHING --> INSTAGRAM
```

---

## 15. Admin Panel — Modules & Data Flow

```mermaid
flowchart TD
    %% ── STYLE ──
    classDef module fill:#6366f1,color:#fff,stroke:#4f46e5,stroke-width:2px
    classDef action fill:#06b6d4,color:#fff,stroke:#0891b2,stroke-width:1px
    classDef db fill:#6b7280,color:#fff,stroke:#4b5563,stroke-width:1px
    classDef security fill:#ef4444,color:#fff,stroke:#dc2626,stroke-width:2px
    classDef config fill:#8b5cf6,color:#fff,stroke:#7c3aed,stroke-width:2px

    subgraph ADMIN_ROLES [👑 Admin Roles & Access]
        SUPER_ADMIN["super_admin<br/>Full access + manage admins"]:::security
        ADMIN["admin<br/>All modules except admin mgmt"]:::security
        AI_ADMIN["ai_admin<br/>Providers, models, prompts"]:::security
        BILLING_ADMIN["billing_admin<br/>Billing, payments, refunds"]:::security
        SUPPORT_ADMIN["support_admin<br/>Users, view-only analytics"]:::security
        VIEWER["viewer<br/>Read-only all modules"]:::security
    end

    subgraph USER_MODULE [👥 User Management Module]
        USER_LIST["User List<br/>• Search · Filter · Export CSV<br/>• Status · Plan · Credits"]:::module
        USER_DETAIL["User Detail<br/>• Profile · Subscription<br/>• AI Usage · Login History"]:::module
        USER_ACTIONS["User Actions<br/>• Suspend / Activate<br/>• Delete (soft)<br/>• Adjust Credits<br/>• Reset Password<br/>• Revoke Sessions<br/>• Impersonate (logged)"]:::action
    end

    USER_MODULE --> USER_DB[("users<br/>user_sessions<br/>wallet<br/>wallet_transactions")]:::db

    subgraph AI_MODULE [🤖 AI Management Module]
        PROVIDER_LIST["AI Provider List<br/>• Status · Models · Jobs/Day<br/>• Avg Latency"]:::module
        PROVIDER_CONFIG["Provider Config<br/>• API key (encrypted)<br/>• Capabilities · Rate limits<br/>• Priority · Status"]:::config
        MODEL_MGMT["Model Management<br/>• Pricing per token<br/>• Credit multiplier<br/>• Enable/disable"]:::module
        ROUTING_RULES["Routing Rules<br/>• Job type → Provider<br/>• Fallback chain<br/>• Priority order"]:::module
        HEALTH_MON["Health Monitor<br/>• Auto-refresh 30s<br/>• Latency · Error Rate<br/>• Uptime graph<br/>• Alert on status change"]:::module
        PROMPT_MGMT["Prompt Management<br/>• Code · Category · Version<br/>• Immutable once published<br/>• A/B testing · Rollback<br/>• Version comparison"]:::module
    end

    AI_MODULE --> AI_DB[("ai_providers<br/>ai_models<br/>ai_routing_rules<br/>prompts<br/>prompt_versions<br/>ai_jobs")]:::db

    subgraph BILLING_MODULE [💰 Billing Management Module]
        TXN_LIST["Transaction List<br/>• Date · User · Type<br/>• Amount · Method · Status<br/>• Date range filter"]:::module
        PAYMENTS["Payment Management<br/>• View all payments<br/>• Manual capture<br/>• Webhook logs"]:::module
        REFUNDS["Refund Management<br/>• Full / partial refund<br/>• Reason required<br/>• Approval flow (>$100)"]:::action
        INVOICES["Invoice Management<br/>• Generate · View · Resend<br/>• Mark paid manually"]:::module
        COUPONS["Coupon Management<br/>• Code · Type (% / $)<br/>• Valid dates · Max uses<br/>• Usage tracking"]:::module
        REVENUE["Revenue Reports<br/>• MRR / ARR<br/>• Revenue by plan<br/>• Churn analysis<br/>• Export CSV/PDF"]:::module
    end

    BILLING_MODULE --> BILL_DB[("subscriptions<br/>invoices<br/>invoice_items<br/>coupons<br/>payment_history")]:::db

    subgraph SYSTEM_MODULE [⚙️ System Configuration Module]
        APP_CONFIG["Application Config<br/>• App name · Support email<br/>• Max upload size<br/>• Chunk size · Language<br/>• Session timeout"]:::config
        AI_CONFIG["AI Settings<br/>• Default provider mode<br/>• Max retries · Backoff<br/>• Cache TTL<br/>• Health check interval"]:::config
        CREDIT_COST["Credit Costs<br/>• Per-operation pricing<br/>• All values configurable<br/>• Takes effect immediately"]:::config
        FEATURE_FLAGS["Feature Flags<br/>• boolean / percentage / user_list<br/>• Gradual rollout<br/>• Emergency kill switch<br/>• No deploy needed"]:::module
    end

    SYSTEM_MODULE --> CONFIG_DB[("app_config<br/>feature_flags<br/>credit_costs")]:::db

    subgraph ANALYTICS_MODULE [📊 Analytics & Reports Module]
        PLATFORM_DASH["Platform Dashboard<br/>• Users · MRR · AI Jobs · GPU Hrs<br/>• +X% growth indicators"]:::module
        USER_REPORTS["User Reports<br/>• DAU/MAU · Retention<br/>• Signup funnel · Conversion<br/>• Churn analysis"]:::module
        AI_REPORTS["AI Reports<br/>• Jobs by type · Provider cost<br/>• Avg latency · Error rate<br/>• Cache hit rate"]:::module
        REVENUE_REPORTS["Revenue Reports<br/>• MRR/ARR · By plan<br/>• Credit purchase trends<br/>• Payment success rate"]:::module
        SYSTEM_REPORTS["System Reports<br/>• API response times<br/>• Queue depth · Worker util<br/>• Storage · DB performance"]:::module
    end

    ANALYTICS_MODULE --> ANA_DB[("analytics_daily<br/>analytics_ai_usage<br/>analytics_revenue<br/>analytics_events")]:::db

    subgraph AUDIT_LOG [📝 Audit & Security]
        AUDIT_RULES["ALL admin actions logged:<br/>• Who (admin user ID)<br/>• What (action, before/after)<br/>• When (timestamp)<br/>• Where (IP, user agent)<br/>• Request ID"]:::security
        AUDIT_TABLE[("audit_logs<br/>• IMMUTABLE<br/>• Admin cannot delete<br/>• Retention: 1 year<br/>• Searchable · Exportable")]:::db
    end

    subgraph SIDEBAR [📋 Admin Sidebar Navigation]
        DASH["📊 Overview<br/>Dashboard · System Health"]
        USERS["👥 Users<br/>All Users · Subscriptions<br/>Sessions · Security Events"]
        AI["🤖 AI Management<br/>Providers · Models · Routing<br/>Prompts · Experiments"]
        BILLING["💰 Billing<br/>Transactions · Payments<br/>Refunds · Invoices · Coupons"]
        ANALYTICS["📈 Analytics<br/>Platform · AI Usage<br/>Cost · Engagement"]
        SYSTEM["⚙️ System<br/>Configuration · Feature Flags<br/>API Keys · Audit Logs"]
    end

    SIDEBAR --> DASH
    SIDEBAR --> USERS
    SIDEBAR --> AI
    SIDEBAR --> BILLING
    SIDEBAR --> ANALYTICS
    SIDEBAR --> SYSTEM

    USERS --> USER_MODULE
    AI --> AI_MODULE
    BILLING --> BILLING_MODULE
    SYSTEM --> SYSTEM_MODULE
    ANALYTICS --> ANALYTICS_MODULE

    USER_MODULE --> AUDIT_LOG
    AI_MODULE --> AUDIT_LOG
    BILLING_MODULE --> AUDIT_LOG
    SYSTEM_MODULE --> AUDIT_LOG
    ANALYTICS_MODULE --> AUDIT_LOG
    AUDIT_LOG --> AUDIT_TABLE
```

---

## 🔗 Referensi

| Dokumen | Link |
|---------|------|
| PRD | [01-PRD.md](01-PRD.md) |
| SRS | [02-SRS.md](02-SRS.md) |
| ERD & DB Schema | [03-ERD.md](03-ERD.md), [04-DATABASE-SCHEMA.md](04-DATABASE-SCHEMA.md) |
| System Architecture | [05-SYSTEM-ARCHITECTURE.md](05-SYSTEM-ARCHITECTURE.md) |
| AI Pipeline | [06-AI-PIPELINE.md](06-AI-PIPELINE.md) |
| REST API | [07-REST-API.md](07-REST-API.md) |
| Desktop Architecture | [08-DESKTOP-ARCHITECTURE.md](08-DESKTOP-ARCHITECTURE.md) |
| SaaS Architecture | [09-SAAS-ARCHITECTURE.md](09-SAAS-ARCHITECTURE.md) |
| UI/UX | [10-UI-UX.md](10-UI-UX.md) |
| Admin Panel | [11-ADMIN-PANEL.md](11-ADMIN-PANEL.md) |
| Billing & Credit | [12-BILLING-CREDIT.md](12-BILLING-CREDIT.md) |
| Security | [13-SECURITY.md](13-SECURITY.md) |
| Deployment | [14-DEPLOYMENT.md](14-DEPLOYMENT.md) |
| Roadmap | [15-ROADMAP.md](15-ROADMAP.md) |
| Agents & Prompts | [16-AGENTS-PROMPTS.md](16-AGENTS-PROMPTS.md) |
