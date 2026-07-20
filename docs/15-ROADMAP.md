# 15-ROADMAP.md

**Version:** 1.0.0
**Status:** Draft
**Reference:** PRD v1.0, SRS v1.0

---

# Table of Contents

1. [Roadmap Overview](#1-roadmap-overview)
2. [Phase 1: Foundation](#2-phase-1-foundation)
3. [Phase 2: AI Engine](#3-phase-2-ai-engine)
4. [Phase 3: Editor](#4-phase-3-editor)
5. [Phase 4: Publishing](#5-phase-4-publishing)
6. [Phase 5: Advanced AI](#6-phase-5-advanced-ai)
7. [Phase 6: Enterprise](#7-phase-6-enterprise)
8. [Timeline](#8-timeline)
9. [Milestone Tracker](#9-milestone-tracker)
10. [Future Vision](#10-future-vision)

---

# 1. Roadmap Overview

## Development Phases

```
┌──────────────────────────────────────────────────────────────┐
│                      DEVELOPMENT ROADMAP                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Phase 1: FOUNDATION              [Month 1-2]               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                   │
│  Authentication, Billing, Credits, Upload, Dashboard         │
│                                                              │
│  Phase 2: AI ENGINE               [Month 3-4]               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                   │
│  Speech Recognition, Viral Detection, Subtitle, Translation  │
│                                                              │
│  Phase 3: EDITOR                  [Month 4-5]               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                   │
│  Timeline, Subtitle Editor, Rendering, Export                │
│                                                              │
│  Phase 4: PUBLISHING              [Month 5-6]               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                   │
│  YouTube, TikTok, Scheduler                                  │
│                                                              │
│  ════════════ MVP LAUNCH ══════════════════ [Month 6]       │
│                                                              │
│  Phase 5: ADVANCED AI             [Month 7-9]               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                   │
│  Voice Clone, Dubbing, Thumbnail, AI Planner                 │
│                                                              │
│  Phase 6: ENTERPRISE              [Month 10-12]             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                   │
│  Multi-tenant, API, White Label, Marketplace                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Versioning Strategy

```
v0.x.x  → Pre-MVP development builds
v1.0.0  → MVP launch
v1.x.0  → Feature releases (minor)
v1.0.x  → Bug fixes (patch)
v2.0.0  → Major architecture change (enterprise)

Release Cadence (post-MVP):
  • Patch: As needed (bug fixes)
  • Minor: Bi-weekly (features)
  • Major: Quarterly (significant)
```

---

# 2. Phase 1: Foundation

**Duration:** Month 1-2
**Goal:** Establish core platform infrastructure

## 2.1 Deliverables

```
AUTHENTICATION
  □ User registration (email + password)
  □ Email verification
  □ Login / Logout
  □ JWT access token (15 min)
  □ Refresh token rotation (30 days)
  □ Password reset flow
  □ Google OAuth
  □ GitHub OAuth
  □ Session management
  □ Rate limiting on auth endpoints
  □ Argon2id password hashing

USER MANAGEMENT
  □ User profile (CRUD)
  □ Avatar upload
  □ Preferences (language, timezone)
  □ Notification settings
  □ Account deletion (soft delete)

BILLING SYSTEM
  □ Subscription plans (Free, Starter, Pro, Business)
  □ Stripe integration
  □ Credit wallet
  □ Credit transaction ledger
  □ Credit purchase flow
  □ Invoice generation
  □ Webhook handling (Stripe)
  □ Coupon / promo code system

PROJECT MANAGEMENT
  □ Create project
  □ Edit / rename project
  □ Delete project (soft delete)
  □ Archive / restore
  □ Duplicate project
  □ Project list with pagination
  □ Project settings

UPLOAD SYSTEM
  □ Chunked upload (resumable)
  □ Multi-file upload
  □ Upload progress (WebSocket)
  □ File type validation
  □ Checksum verification
  □ Metadata extraction (FFprobe)

DASHBOARD
  □ Overview stats (credits, plan, usage)
  □ Recent projects
  □ Rendering queue
  □ Credit usage chart
  □ Notification center

INFRASTRUCTURE
  □ PostgreSQL database (Supabase)
  □ Redis cache + queue
  □ Object storage (Supabase Storage)
  □ Docker containerization
  □ CI/CD pipeline (GitHub Actions)
  □ Monitoring (Sentry, basic metrics)
  □ Health check endpoints
```

## 2.2 Phase 1 Exit Criteria

```
✓ User can register, verify email, and login
✓ User can subscribe to a plan via Stripe
✓ User receives monthly credit allocation
✓ User can create projects and upload videos
✓ Upload supports resume after interruption
✓ Dashboard displays accurate user data
✓ All endpoints have authentication
✓ Rate limiting is active
✓ Audit logging is functional
✓ System is deployed and accessible
```

---

# 3. Phase 2: AI Engine

**Duration:** Month 3-4
**Goal:** Core AI pipeline functionality

## 3.1 Deliverables

```
AI ORCHESTRATOR
  □ Provider abstraction layer (IAIProvider interface)
  □ OpenRouter provider implementation
  □ NVIDIA provider implementation
  □ OpenCode provider implementation (*)
  
  > **(*) OpenCode** adalah internal AI provider codename. Lihat definisi lengkap di [PRD Glossary](01-PRD.md#22-glossary).
  □ Provider routing (rule engine)
  □ Automatic / Manual / Hybrid selection
  □ Health monitoring (60s interval)
  □ Fallback chain
  □ Retry policy (exponential backoff, max 3)
  □ Cache engine (Redis + database)
  □ Cost estimation engine
  □ Credit deduction on completion
  □ Credit refund on failure

SPEECH RECOGNITION
  □ Audio extraction from video
  □ Language detection (auto)
  □ Transcription with word-level timestamps
  □ Confidence scoring
  □ Transcript storage (segments + words)
  □ WER < 10% target

SPEAKER DETECTION
  □ Voice embedding extraction
  □ Speaker clustering / diarization
  □ Speaker label assignment
  □ Segment-to-speaker mapping

SCENE DETECTION
  □ Frame sampling
  □ Scene cut detection
  □ Scene type classification

FACE TRACKING
  □ Face detection in keyframes
  □ Face tracking across frames
  □ Primary speaker identification

EMOTION ANALYSIS
  □ Text sentiment analysis
  □ Audio tone analysis
  □ Emotion classification

SILENCE & FILLER DETECTION
  □ Silence detection (>500ms)
  □ Filler word detection

HOOK DETECTION
  □ Pattern matching (questions, surprises)
  □ Hook scoring per segment

VIRAL DETECTION
  □ Multi-signal fusion
  □ Clip boundary generation
  □ Viral score (0-100)
  □ Ranking reason generation

CLIP RANKING
  □ Sort clips by score
  □ Filter by duration constraints
  □ Deduplicate overlapping clips

SUBTITLE GENERATION
  □ Word grouping into lines
  □ Duration calculation
  □ SRT / VTT / JSON export

TRANSLATION
  □ Multi-language subtitle translation
  □ Context preservation

CONTENT GENERATION
  □ Title generation (3-5 options per clip)
  □ Description generation
  □ Hashtag generation
  □ Emoji suggestions

PROMPT MANAGEMENT
  □ Prompt versioning system
  □ Prompt template editor (admin)
  □ Variable substitution
  □ Model parameter configuration
```

## 3.2 Phase 2 Exit Criteria

```
✓ User uploads video → AI pipeline runs automatically
✓ Transcript is generated with >90% accuracy
✓ Clips are detected with viral scores
✓ Subtitles are generated and editable
✓ Titles and descriptions are auto-generated
✓ Credits are deducted correctly per operation
✓ Failed jobs are retried and refunded
✓ Cache prevents duplicate AI processing
✓ Provider health is monitored
✓ Fallback works when primary provider fails
```

---

# 4. Phase 3: Editor

**Duration:** Month 4-5
**Goal:** Desktop editing experience

## 4.1 Deliverables

```
DESKTOP APPLICATION
  □ Electron app setup (main + renderer + preload)
  □ Custom title bar
  □ System tray integration
  □ Auto-update mechanism
  □ Hardware detection (GPU, CPU, RAM)
  □ FFmpeg binary bundling

TIMELINE EDITOR
  □ Multi-track timeline (video, audio, subtitle)
  □ Drag-and-drop clip positioning
  □ Clip resize / trim
  □ Split clip
  □ Ripple delete
  □ Undo / Redo (history stack)
  □ Snap-to-grid
  □ Zoom in / out
  □ Markers
  □ Keyboard shortcuts
  □ Autosave (30s interval)

VIDEO PREVIEW
  □ Real-time video playback
  □ Play / pause / seek
  □ 9:16, 1:1, 16:9 preview modes
  □ Subtitle overlay preview
  □ 30 FPS minimum

SUBTITLE EDITOR
  □ Inline text editing
  □ Timing adjustment
  □ Style customization (font, color, animation)
  □ Subtitle templates
  □ Search and replace
  □ Bulk operations

AUTO-REFRAME
  □ Face-tracking-based crop
  □ 9:16, 1:1, 16:9 aspect ratios
  □ Smooth camera movement

LOCAL RENDERING
  □ FFmpeg integration (fluent-ffmpeg)
  □ GPU encoding (NVENC / QSV / AMF)
  □ CPU encoding fallback
  □ Render presets (YouTube, TikTok, Instagram)
  □ Resolution options (720p, 1080p, 1440p, 4K)
  □ FPS options (24, 30, 60)
  □ Codec options (H.264, H.265, AV1)
  □ Watermark option (Free plan)
  □ Batch rendering
  □ Render progress (WebSocket)
  □ Export to local file
  □ Upload to cloud storage

CLOUD RENDERING (basic)
  □ Server-side FFmpeg worker
  □ Queue-based processing
  □ Progress tracking
```

## 4.2 Phase 3 Exit Criteria

```
✓ Desktop app installs and runs on Windows 10/11
✓ Timeline editor supports all basic operations
✓ Video preview is smooth (30+ FPS)
✓ Subtitles can be edited and styled
✓ Auto-reframe correctly tracks faces
✓ Local rendering uses GPU when available
✓ Rendered video quality is correct
✓ Batch rendering works for multiple clips
✓ Autosave prevents data loss
✓ Auto-update pushes new versions
```

---

# 5. Phase 4: Publishing

**Duration:** Month 5-6
**Goal:** Social media publishing

## 5.1 Deliverables

```
SOCIAL ACCOUNT CONNECTION
  □ YouTube OAuth integration
  □ TikTok OAuth integration
  □ Account management UI
  □ Token refresh handling
  □ Disconnect account

PUBLISHING
  □ Publish to YouTube
  □ Publish to TikTok
  □ Title / description / tags per platform
  □ Privacy status (public, unlisted, private)
  □ Thumbnail selection

SCHEDULING
  □ Schedule post for future time
  □ Scheduled posts queue
  □ Cancel scheduled post
  □ Timezone-aware scheduling
  □ Optimal posting time suggestions (future)

PUBLISH HISTORY
  □ View all published posts
  □ Status tracking (published, failed)
  □ Retry failed publish
  □ Platform post URL

NOTIFICATIONS
  □ In-app notifications
  □ Email notifications
  □ Render complete notification
  □ Credit low notification
  □ Subscription expiring notification
  □ Publish success / failure notification
```

## 5.2 Phase 4 Exit Criteria

```
✓ User can connect YouTube and TikTok accounts
✓ User can publish rendered clips to both platforms
✓ Scheduled posts are published at correct time
✓ Failed publishes can be retried
✓ Notifications inform user of all important events
✓ OAuth tokens are refreshed automatically
```

## MVP LAUNCH CRITERIA

```
═══════════════════════════════════════════════════════════
                   MVP IS READY WHEN:
═══════════════════════════════════════════════════════════

  ✓ User can register, subscribe, and upload video
  ✓ AI pipeline generates clips with viral scores
  ✓ Desktop app edits clips with timeline + subtitles
  ✓ Local rendering produces quality output
  ✓ Clips can be published to YouTube + TikTok
  ✓ Credit system accurately tracks usage
  ✓ All critical paths have monitoring
  ✓ Error rate < 1%
  ✓ Crash-free sessions > 99.5%
  ✓ Documentation is complete
  ✓ Landing page + pricing are live

═══════════════════════════════════════════════════════════
```

---

# 6. Phase 5: Advanced AI

**Duration:** Month 7-9 (Post-MVP)
**Goal:** Differentiating AI features

## 6.1 Deliverables

```
VOICE CLONE
  □ Voice fingerprint extraction
  □ Voice cloning model integration
  □ Generate speech in cloned voice
  □ Voice library management

VOICE DUBBING
  □ Multi-language voice generation
  □ Lip-sync alignment (basic)
  □ Preserve original emotion

AI THUMBNAIL
  □ Frame selection optimization
  □ Text overlay generation
  □ A/B variant generation
  □ Click-through score prediction

BACKGROUND MUSIC
  □ Royalty-free music library
  □ AI music recommendation
  □ Beat-synced editing

CAPTION ANIMATION
  □ Word-by-word animation
  □ Karaoke-style highlighting
  □ Animation templates
  □ Custom animation builder

AI PLANNER (Future)
  □ Content calendar generation
  □ Trending topic analysis
  □ Optimal posting schedule
  □ Content gap analysis

AI AGENT (Future)
  □ Autonomous clipping agent
  □ Multi-video processing
  □ Style learning from user preferences
```

---

# 7. Phase 6: Enterprise

**Duration:** Month 10-12 (Post-MVP)
**Goal:** Enterprise & platform features

## 7.1 Deliverables

```
MULTI-TENANT WORKSPACE
  □ Organization entity
  □ Team member management
  □ Role-based permissions (admin, editor, viewer)
  □ Shared project access
  □ Shared assets library
  □ Team billing

PUBLIC API
  □ REST API for all operations
  □ API key management
  □ Rate limiting per key
  □ Webhooks for events
  □ SDK (JavaScript/Python)
  □ API documentation portal

WHITE LABEL
  □ Custom branding
  □ Custom domain
  □ Remove AI Clipper branding
  □ Custom email templates

AI MARKETPLACE (Internal)
  □ Third-party AI model registration
  □ Provider SDK
  □ Revenue sharing model
  □ Model review process

PLUGIN SDK (Internal)
  □ Plugin architecture
  □ Timeline plugin support
  □ Export plugin support
  □ Custom AI module integration

ANALYTICS PRO
  □ Advanced reporting
  □ Custom dashboards
  □ Data export API
  □ Cohort analysis
  □ Revenue attribution

ENTERPRISE ADMINISTRATION
  □ SSO (SAML, OIDC)
  □ SCIM provisioning
  □ Audit log export
  □ Compliance reports
  □ Data residency options
```

---

# 8. Timeline

```
         Jan    Feb    Mar    Apr    May    Jun    Jul    Aug    Sep    Oct    Nov    Dec
          │      │      │      │      │      │      │      │      │      │      │      │
Phase 1  ├──────────────┤                                                FOUNDATION
          │      │      │      │      │      │      │      │      │      │      │      │
Phase 2          ├──────────────┤                                        AI ENGINE
          │      │      │      │      │      │      │      │      │      │      │      │
Phase 3                  ├──────────────┤                                EDITOR
          │      │      │      │      │      │      │      │      │      │      │      │
Phase 4                          ├──────────┤                            PUBLISHING
          │      │      │      │      │      │      │      │      │      │      │      │
    MVP                                  ★ LAUNCH                              ★ = MVP
          │      │      │      │      │      │      │      │      │      │      │      │
Phase 5                                          ├──────────────────┤      ADVANCED AI
          │      │      │      │      │      │      │      │      │      │      │      │
Phase 6                                                          ├──────────────────┤ENTERPRISE
          │      │      │      │      │      │      │      │      │      │      │      │

MILESTONES:
  M1 (Feb)  → Foundation complete (internal alpha)
  M2 (Apr)  → AI Engine complete (internal beta)
  M3 (May)  → Editor complete (closed beta)
  M4 (Jun)  → MVP launch (public)
  M5 (Sep)  → Advanced AI features
  M6 (Dec)  → Enterprise features
```

---

# 9. Milestone Tracker

## MVP Launch Checklist

```
┌──────────────────────────────────────────────────────┐
│                MVP LAUNCH CHECKLIST                  │
├──────────────────────────────────────────────────────┤
│                                                    │
│  PRODUCT                                           │
│  □ All Phase 1-4 features implemented              │
│  □ Desktop app passes QA on Win 10 + 11           │
│  □ Web SaaS passes cross-browser testing           │
│  □ No critical bugs (P0)                           │
│  □ No high-priority bugs (P1)                     │
│  □ Performance targets met                         │
│                                                    │
│  INFRASTRUCTURE                                    │
│  □ Production database deployed                    │
│  □ Redis cluster deployed                          │
│  □ Object storage configured                       │
│  □ CDN configured                                  │
│  □ SSL certificates installed                      │
│  □ Monitoring active (Sentry, Prometheus)          │
│  □ Backups automated                               │
│  □ Health checks responding                        │
│                                                    │
│  SECURITY                                          │
│  □ Security audit complete                         │
│  □ OWASP Top 10 reviewed                           │
│  □ Penetration testing done                        │
│  □ Secrets in secret manager                       │
│  □ Rate limiting active                            │
│  □ Audit logging functional                        │
│                                                    │
│  BUSINESS                                          │
│  □ Landing page live                               │
│  □ Pricing page live                               │
│  □ Stripe production keys                          │
│  □ Subscription plans configured                   │
│  □ Credit costs finalized                          │
│  □ Terms of Service published                      │
│  □ Privacy Policy published                        │
│  □ Support email active                            │
│                                                    │
│  DOCUMENTATION                                     │
│  □ User documentation                              │
│  □ API documentation (OpenAPI)                     │
│  □ Help center articles                            │
│  □ Video tutorials                                 │
│                                                    │
│  MARKETING                                         │
│  □ Social media accounts created                   │
│  □ Launch announcement prepared                    │
│  □ Beta user feedback collected                    │
│  □ Product Hunt launch planned                     │
│                                                    │
└──────────────────────────────────────────────────────┘
```

---

# 10. Future Vision

## Beyond v2.0

```
┌──────────────────────────────────────────────────────────────┐
│                    LONG-TERM VISION                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  AI VIDEO DIRECTOR                                           │
│  Fully autonomous video editing agent that learns the        │
│  creator's style and produces content without supervision.   │
│                                                              │
│  AI CONTENT CALENDAR                                         │
│  Predicts trending topics, suggests content ideas, and       │
│  auto-generates a publishing schedule optimized for reach.   │
│                                                              │
│  AI TREND PREDICTION                                         │
│  Analyzes social media trends to predict viral content       │
│  before it peaks, giving creators first-mover advantage.    │
│                                                              │
│  AI THUMBNAIL A/B TESTING                                    │
│  Automatically generates and tests multiple thumbnails,      │
│  selecting the highest-performing variant via CTR data.     │
│                                                              │
│  AI AUTO PUBLISHING                                          │
│  Autonomous publishing pipeline that schedules, posts,       │
│  and monitors performance across all platforms.              │
│                                                              │
│  MULTI-PLATFORM EXPANSION                                    │
│  • Instagram Reels                                          │
│  • Facebook Reels                                           │
│  • LinkedIn Video                                           │
│  • X (Twitter) Video                                        │
│  • Snapchat                                                 │
│  • Pinterest                                                │
│                                                              │
│  MOBILE APPS                                                 │
│  • iOS app (React Native)                                   │
│  • Android app (React Native)                               │
│  • Tablet-optimized editing                                 │
│                                                              │
│  AI MARKETPLACE                                              │
│  Third-party developers can publish AI models, effects,      │
│  transitions, and templates. Revenue sharing model.         │
│                                                              │
│  REAL-TIME COLLABORATION                                     │
│  Multi-user simultaneous editing with conflict resolution.  │
│  Version control for projects. Comments and annotations.    │
│                                                              │
│  LIVE STREAM CLIPPING                                        │
│  Real-time clip extraction from live streams with instant   │
│  publishing while the stream is still active.               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

**Next Document:** [16-AGENTS-PROMPTS.md](16-AGENTS-PROMPTS.md)
