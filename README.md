# AI Video Clipper Platform

**Transform long-form videos into dozens of AI-powered short clips automatically.**

---

## 📋 Project Status

**Phase:** In Specification (Pre-Development)

**Target:** MVP Launch in 6 months

---

## 🎯 Vision

Build an AI-powered video clipping platform that enables Content Creators, YouTubers, and TikTok Creators to automatically convert long videos into multiple high-quality short-form clips.

### Platform Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| 🖥️ **Desktop App** | Electron + React + TypeScript | Video editing, timeline, local rendering |
| 🌐 **Web SaaS** | Next.js 14 + TypeScript | Account management, billing, analytics |
| ⚙️ **Backend API** | Node.js + Express.js | Business logic, AI orchestration |
| 🤖 **AI Pipeline** | Multi-provider abstraction | Speech recognition, viral detection, content generation |
| 🗄️ **Database** | PostgreSQL (via Prisma) | All persistent data (~91 tables) |
| ⚡ **Queue** | Redis + BullMQ | Async processing, job management |
| 📦 **Storage** | Supabase / Cloudflare R2 | Media files, exports |

---

## 📚 Documentation Index

All 16 specification documents:

| # | Document | Description |
|---|----------|-------------|
| 01 | [PRD](docs/01-PRD.md) | Product Requirements Document — vision, features, market analysis |
| 02 | [SRS](docs/02-SRS.md) | Software Requirements Specification — technical specs, state models |
| 03 | [ERD](docs/03-ERD.md) | Entity Relationship Design — 17 domains, ~91 tables |
| 04 | [Database Schema](docs/04-DATABASE-SCHEMA.md) | Full Prisma schema with enums, relations, indexes |
| 05 | [System Architecture](docs/05-SYSTEM-ARCHITECTURE.md) | High-level architecture, components, data flow |
| 06 | [AI Pipeline](docs/06-AI-PIPELINE.md) | 14-stage AI pipeline, cost engine, retry/fallback |
| 07 | [REST API](docs/07-REST-API.md) | Complete API specification with request/response examples |
| 08 | [Desktop Architecture](docs/08-DESKTOP-ARCHITECTURE.md) | Electron app, IPC, FFmpeg, offline capabilities |
| 09 | [SaaS Architecture](docs/09-SAAS-ARCHITECTURE.md) | Next.js app, auth flow, state management |
| 10 | [UI/UX](docs/10-UI-UX.md) | Design system, components, accessibility, dark mode |
| 11 | [Admin Panel](docs/11-ADMIN-PANEL.md) | Admin modules, user management, provider config |
| 12 | [Billing & Credit](docs/12-BILLING-CREDIT.md) | Subscription plans, credit system, payment integration |
| 13 | [Security](docs/13-SECURITY.md) | OWASP Top 10, auth, encryption, incident response |
| 14 | [Deployment](docs/14-DEPLOYMENT.md) | Docker, CI/CD, blue-green deployment, rollback |
| 15 | [Roadmap](docs/15-ROADMAP.md) | 6-phase development plan, MVP checklist |
| 16 | [Agents & Prompts](docs/16-AGENTS-PROMPTS.md) | AI agents, prompt templates, evaluation |
| 📊 | **[Architecture Diagrams](docs/ARCHITECTURE-DIAGRAMS.md)** | **Interactive Mermaid diagrams — visual system reference** |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│              CLIENT LAYER                    │
│  Desktop (Electron)     Web SaaS (Next.js)  │
└──────────────────┬──────────────────────────┘
                   │ HTTPS / WSS
┌──────────────────▼──────────────────────────┐
│           API GATEWAY LAYER                  │
│       Nginx + Express.js + WebSocket        │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│            SERVICE LAYER                     │
│  Auth │ User │ Project │ Media │ AI        │
│  Render │ Publish │ Billing │ Analytics    │
│  ┌──────────────────────────────────┐       │
│  │       AI ORCHESTRATOR            │       │
│  └──────────────────────────────────┘       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         QUEUE & WORKER LAYER                │
│      Redis + BullMQ + Worker Cluster       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              DATA LAYER                      │
│  PostgreSQL │ Redis Cache │ Object Storage  │
└──────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20 LTS |
| Language | TypeScript 5 (strict) |
| Framework | Express.js / Fastify |
| ORM | Prisma 5 |
| Validation | Zod |
| Queue | BullMQ + Redis 7 |
| Logger | Pino |

### Frontend (Web SaaS)
| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14 (App Router) |
| UI Library | React 18 + shadcn/ui + Radix |
| Styling | Tailwind CSS |
| State | TanStack Query + Zustand |
| Animation | Framer Motion |

### Desktop
| Component | Technology |
|-----------|-----------|
| Framework | Electron 28 |
| UI | React 18 + TypeScript |
| Bundler | Vite |
| FFmpeg | fluent-ffmpeg (GPU/CPU) |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Container | Docker |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana + Sentry |
| CDN | Cloudflare |
| Email | Resend / AWS SES |

---

## 🚀 Getting Started for Developers

### Prerequisites
- Node.js 20 LTS
- PostgreSQL 15+
- Redis 7
- Docker + Docker Compose (optional, for local dev)

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd ai-video-clipper

# Install dependencies
npm ci

# Setup environment
cp .env.example .env
# Edit .env with your local configuration

# Setup database
npx prisma generate
npx prisma migrate dev

# Start development
npm run dev
```

### Project Structure (Planned)
```
/
├── backend/          # Express.js API server
├── web/              # Next.js SaaS application
├── desktop/          # Electron desktop app
├── workers/          # Background job workers
├── packages/         # Shared packages
│   ├── shared/       # Types, constants
│   └── ai/           # AI provider interfaces
├── docs/             # Documentation
└── infra/            # Docker, CI/CD configs
```

---

## 📈 Development Roadmap

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1: Foundation | Month 1-2 | Auth, Billing, Upload, Dashboard |
| Phase 2: AI Engine | Month 3-4 | AI Pipeline, Speech, Viral Detection |
| Phase 3: Editor | Month 4-5 | Timeline, Subtitles, Rendering |
| Phase 4: Publishing | Month 5-6 | YouTube, TikTok, Scheduling |
| ⭐ **MVP Launch** | **Month 6** | **Public release** |
| Phase 5: Advanced AI | Month 7-9 | Voice Clone, Dubbing, AI Thumbnail |
| Phase 6: Enterprise | Month 10-12 | Multi-tenant, API, White Label |

---

## 🔗 Related Resources

- **Competitors:** Opus Clip, Vizard, VEED, Kapwing, Spikes Studio
- **Target Platforms:** YouTube Shorts, TikTok, Instagram Reels

---

## 📄 License

Copyright © 2026. All rights reserved.
