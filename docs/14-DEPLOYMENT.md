# 14-DEPLOYMENT.md

**Version:** 1.0.0
**Status:** Draft
**Reference:** PRD v1.0, SRS v1.0

---

# Table of Contents

1. [Deployment Overview](#1-deployment-overview)
2. [Infrastructure](#2-infrastructure)
3. [Docker Configuration](#3-docker-configuration)
4. [Environment Configuration](#4-environment-configuration)
5. [CI/CD Pipeline](#5-cicd-pipeline)
6. [Backend Deployment](#6-backend-deployment)
7. [Frontend Deployment](#7-frontend-deployment)
8. [Desktop Build & Distribution](#8-desktop-build--distribution)
9. [Database Deployment](#9-database-deployment)
10. [Monitoring & Health Checks](#10-monitoring--health-checks)
11. [Rollback Strategy](#11-rollback-strategy)

---

# 1. Deployment Overview

## Deployment Targets

```
┌──────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT TARGETS                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. BACKEND API + WORKERS                                   │
│     • Docker containers                                     │
│     • Cloud: AWS ECS / Google Cloud Run / VPS               │
│     • MVP: Single VPS (Docker Compose)                      │
│                                                              │
│  2. WEB SAAS (Next.js)                                      │
│     • Vercel (preferred for Next.js)                        │
│     • Alternative: Self-hosted Docker                       │
│                                                              │
│  3. DESKTOP APP (Electron)                                  │
│     • Windows installer (.exe / .msi)                       │
│     • Distributed via: GitHub Releases / Website            │
│     • Auto-update via electron-updater                      │
│                                                              │
│  4. DATABASE (PostgreSQL)                                   │
│     • Supabase (managed PostgreSQL)                         │
│     • Neon (serverless Postgres)                            │
│     • Alternative: Self-hosted on VPS                       │
│                                                              │
│  5. REDIS (Cache + Queue)                                   │
│     • Upstash (serverless Redis)                            │
│     • Alternative: Self-hosted on VPS                       │
│                                                              │
│  6. OBJECT STORAGE                                          │
│     • Supabase Storage                                      │
│     • Cloudflare R2                                         │
│     • AWS S3 (future)                                       │
│                                                              │
│  7. CDN                                                     │
│     • Cloudflare                                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Environments

```
┌─────────────┬────────────────────────────┬──────────────────┐
│ Environment │ Purpose                    │ URL              │
├─────────────┼────────────────────────────┼──────────────────┤
│ local       │ Development                │ localhost:3000   │
│ development │ Shared dev testing         │ dev.app...       │
│ staging     │ Pre-production testing     │ staging.app...   │
│ production  │ Live system                │ app...           │
└─────────────┴────────────────────────────┴──────────────────┘
```

---

# 2. Infrastructure

## 2.1 MVP Infrastructure (Cost-Optimized)

```
┌──────────────────────────────────────────────────────────────┐
│                  MVP INFRASTRUCTURE                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  VPS (Backend + Workers + Redis)                            │
│  • Provider: Hetzner / DigitalOcean / AWS Lightsail         │
│  • Specs: 8 vCPU, 16 GB RAM, 160 GB SSD                     │
│  • OS: Ubuntu 22.04 LTS                                     │
│  • Docker + Docker Compose                                  │
│  • Cost: ~$40-80/month                                      │
│                                                              │
│  Database                                                    │
│  • Supabase Pro ($25/month)                                │
│  • 8 GB RAM, 2 vCPU                                        │
│  • Automated backups                                        │
│                                                              │
│  Redis                                                       │
│  • Upstash Pay-as-you-go                                   │
│  • Or bundled with VPS (self-hosted)                       │
│                                                              │
│  Storage                                                     │
│  • Supabase Storage (included with DB plan)                │
│  • Cloudflare R2 (free egress)                             │
│                                                              │
│  Web SaaS                                                    │
│  • Vercel Pro ($20/month)                                  │
│                                                              │
│  CDN / DNS                                                   │
│  • Cloudflare (free tier sufficient)                       │
│                                                              │
│  Total MVP Cost: ~$85-125/month                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 2.2 Scale Infrastructure

```
┌──────────────────────────────────────────────────────────────┐
│                 SCALE INFRASTRUCTURE                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Load Balancer                                               │
│  • Nginx / HAProxy / Cloud LB                               │
│                                                              │
│  API Servers (auto-scaled)                                  │
│  • 2-10 instances                                           │
│  • Kubernetes (EKS/GKE) or Docker Swarm                     │
│                                                              │
│  Worker Servers (auto-scaled)                               │
│  • 2-20 instances                                           │
│  • GPU workers for rendering (separate pool)               │
│                                                              │
│  Database                                                    │
│  • PostgreSQL cluster (primary + 2 read replicas)          │
│  • PgBouncer connection pooling                             │
│  • Managed: AWS RDS / Google Cloud SQL                     │
│                                                              │
│  Redis Cluster                                               │
│  • 3-node cluster (HA)                                      │
│  • Or ElastiCache / Memorystore                             │
│                                                              │
│  Storage                                                     │
│  • S3 / R2 with lifecycle policies                         │
│  • CloudFront / Cloudflare CDN                              │
│                                                              │
│  Monitoring                                                  │
│  • Prometheus + Grafana                                     │
│  • Sentry (error tracking)                                  │
│  • Datadog / New Relic (APM)                               │
│                                                              │
│  Estimated Scale Cost: $500-2000+/month                     │
│  (depending on user count and AI usage)                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 3. Docker Configuration

## 3.1 Backend Dockerfile

```dockerfile
# Dockerfile.backend
FROM node:20-slim AS base
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Build stage
FROM base AS builder
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim AS production
WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

# Non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

## 3.2 Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/aiclipper
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=development
    depends_on:
      - db
      - redis
    volumes:
      - ./src:/app/src
      - /app/node_modules

  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/aiclipper
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=development
    depends_on:
      - db
      - redis
    deploy:
      replicas: 3

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=aiclipper
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

---

# 4. Environment Configuration

## 4.1 Environment Variables

```bash
# .env.example

# ── APPLICATION ──────────────────────────────────────
NODE_ENV=production
PORT=3000
APP_NAME=AI Video Clipper
APP_URL=https://app.aivideoclipper.com
API_URL=https://api.aivideoclipper.com

# ── DATABASE ─────────────────────────────────────────
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# ── REDIS ────────────────────────────────────────────
REDIS_URL=redis://host:6379
REDIS_PASSWORD=

# ── AUTHENTICATION ───────────────────────────────────
JWT_ACCESS_SECRET=<random-64-char>
JWT_REFRESH_SECRET=<random-64-char>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
JWT_ISSUER=aivideoclipper

# ── OAUTH ────────────────────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://api.aivideoclipper.com/auth/oauth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=https://api.aivideoclipper.com/auth/oauth/github/callback

# ── STORAGE ──────────────────────────────────────────
STORAGE_PROVIDER=supabase          # supabase | r2 | s3
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_BUCKET=media

R2_ACCOUNT_ID=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=media

# ── AI PROVIDERS ─────────────────────────────────────
OPENROUTER_API_KEY=
NVIDIA_API_KEY=
OPENCODE_API_KEY=       # Internal AI provider codename — lihat PRD Glossary

# ── PAYMENT ──────────────────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=

MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=

# ── EMAIL ────────────────────────────────────────────
RESEND_API_KEY=
EMAIL_FROM=noreply@aivideoclipper.com

# ── SOCIAL PUBLISHING ────────────────────────────────
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=

# ── MONITORING ───────────────────────────────────────
SENTRY_DSN=
LOG_LEVEL=info
```

## 4.2 Secret Management

```
DEVELOPMENT
  • .env file (gitignored)
  • .env.example committed as template

STAGING / PRODUCTION
  • Cloud secret manager (AWS Secrets Manager / Doppler / Vault)
  • Injected as environment variables at deployment
  • Never in version control
  • Never in container image
  • Rotated per security policy

RULES
  ✓ .env files are gitignored
  ✓ .env.example has placeholder values only
  ✓ Production secrets access-restricted
  ✓ Secret rotation quarterly
  ✓ Audit log for secret access
```

---

# 5. CI/CD Pipeline

## 5.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # ── LINT & TEST ────────────────────────────────────
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:unit
      - run: npm run test:integration

  # ── BUILD BACKEND ──────────────────────────────────
  build-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Build & Push Docker image
        run: |
          docker build -f Dockerfile.backend -t registry/aiclipper-api:${{ github.sha }} .
          docker push registry/aiclipper-api:${{ github.sha }}

  # ── DEPLOY STAGING ─────────────────────────────────
  deploy-staging:
    needs: build-backend
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          ssh ${{ secrets.STAGING_HOST }} \
            "cd /app && docker-compose pull && docker-compose up -d"

  # ── DEPLOY PRODUCTION ──────────────────────────────
  deploy-production:
    needs: build-backend
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to production
        run: |
          ssh ${{ secrets.PROD_HOST }} \
            "cd /app && docker-compose pull && docker-compose up -d"
      - name: Run database migrations
        run: npx prisma migrate deploy
      - name: Health check
        run: |
          curl -f https://api.aivideoclipper.com/health || exit 1

  # ── BUILD DESKTOP ──────────────────────────────────
  build-desktop:
    needs: test
    runs-on: windows-latest
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd desktop && npm ci
      - run: cd desktop && npm run build
      - name: Create installer
        run: cd desktop && npx electron-builder --win --publish always
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 5.2 Deployment Flow

```
  Developer commits
        │
        ▼
  ┌──────────┐
  │  Push to │
  │  develop │
  └────┬─────┘
       │
       ▼
  ┌──────────┐     FAIL     ┌──────────┐
  │ CI Tests │──────────────▶│  Block   │
  └────┬─────┘               └──────────┘
       │ PASS
       ▼
  ┌──────────┐
  │  Build   │
  │  Docker  │
  └────┬─────┘
       │
       ▼
  ┌──────────┐
  │  Deploy  │
  │ Staging  │
  └────┬─────┘
       │
       ▼
  ┌──────────┐     FAIL     ┌──────────┐
  │ Smoke    │──────────────▶│  Alert   │
  │  Test    │               └──────────┘
  └────┬─────┘
       │ PASS
       ▼
  ┌──────────┐
  │ PR to    │
  │  main    │
  └────┬─────┘
       │ Merge
       ▼
  ┌──────────┐
  │  Deploy  │
  │  Prod    │
  └────┬─────┘
       │
       ▼
  ┌──────────┐
  │  Health  │
  │  Check   │
  └──────────┘
```

---

# 6. Backend Deployment

## 6.1 Zero-Downtime Deployment

```
STRATEGY: Blue-Green Deployment

  ┌─────────────┐     ┌─────────────┐
  │ BLUE (Live)  │     │ GREEN (Idle)│
  │  Version 1   │     │  Version 2  │
  └──────┬──────┘     └──────┬──────┘
         │                    │
         │         Deploy     │
         │         GREEN ─────┘
         │                    │
         │         Test GREEN │
         │                    │
         │    Switch traffic  │
         └────────────────────┘
                    │
                    ▼
         ┌─────────────┐     ┌─────────────┐
         │ BLUE (Idle)  │     │ GREEN (Live)│
         │  Version 1   │     │  Version 2  │
         └─────────────┘     └──────┬──────┘
                                   │
                            Keep BLUE for rollback
                            (terminate after 24h)
```

## 6.2 Database Migration Strategy

```
ZERO-DOWNTIME MIGRATIONS (Expand-Contract Pattern)

PHASE 1: EXPAND (backward compatible)
  • Add new columns (nullable)
  • Add new tables
  • Add new indexes (CREATE INDEX CONCURRENTLY)
  → Deploy new code (reads old + new schema)

PHASE 2: MIGRATE DATA
  • Backfill new columns
  • Dual-write to old + new
  → Deploy migration script

PHASE 3: CONTRACT (breaking change)
  • Switch reads to new columns
  • Remove old columns
  → Deploy code that only uses new schema

RULES:
  ✓ Never drop columns in same release as adding
  ✓ Always test migration on staging copy
  ✓ Always backup before migration
  ✓ Use transactions for data migrations
  ✓ Maintenance window for large migrations
```

---

# 7. Frontend Deployment

## 7.1 Web SaaS (Vercel)

```
DEPLOYMENT
  • Connected to GitHub repository
  • Auto-deploy on push to main
  • Preview deployments for PRs
  • Production deployments on merge

BUILD SETTINGS
  • Framework: Next.js
  • Build Command: npm run build
  • Output Directory: .next
  • Install Command: npm ci

ENVIRONMENT VARIABLES
  • Set in Vercel dashboard
  • Different per environment (preview/production)
  • Secrets encrypted

EDGE CONFIGURATION
  • Edge functions for auth middleware
  • Image optimization at edge
  • ISR revalidation via API
```

---

# 8. Desktop Build & Distribution

## 8.1 electron-builder Configuration

```yaml
# desktop/electron-builder.yml
appId: com.aivideoclipper.desktop
productName: AI Video Clipper
copyright: Copyright © 2026

directories:
  output: dist
  buildResources: resources

win:
  target:
    - target: nsis
      arch: [x64]
  icon: resources/icons/icon.ico
  artifactName: "AI-Video-Clipper-Setup-${version}.${ext}"

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  installerIcon: resources/icons/icon.ico
  uninstallerIcon: resources/icons/icon.ico
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: AI Video Clipper

publish:
  provider: github
  owner: aivideoclipper
  repo: desktop-releases
  releaseType: release

files:
  - dist/**/*
  - resources/**/*
  - "!**/*.map"

extraResources:
  - from: resources/ffmpeg
    to: ffmpeg
    filter: ["**/*"]
```

## 8.2 Release Process

```
DESKTOP RELEASE FLOW

1. Update version in package.json
   npm version patch | minor | major

2. Push tag to GitHub
   git push origin v1.0.0

3. CI builds installer
   • Compiles TypeScript
   • Bundles with Vite
   • Packages with electron-builder
   • Signs executable (code signing cert)
   • Creates GitHub Release

4. Auto-update distribution
   • Users get update notification
   • Download in background
   • Install on restart

5. Manual download
   • Available on website /download page
   • Direct link to GitHub Release asset

CODE SIGNING (required for Windows)
  • EV Code Signing Certificate (recommended)
  • Standard Code Signing Certificate (minimum)
  • Prevents "Unknown Publisher" warning
  • Reduces SmartScreen warnings
```

---

# 9. Database Deployment

## 9.1 Migration Commands

```bash
# Development
npx prisma migrate dev --name <description>   # Create + apply
npx prisma migrate reset                       # Reset + seed
npx prisma db seed                             # Seed data

# Staging / Production
npx prisma migrate deploy                      # Apply pending migrations
npx prisma migrate status                      # Check status
npx prisma migrate resolve --rolled-back <id> # Mark as rolled back

# NEVER use in production:
# npx prisma db push   (bypasses migrations)
# npx prisma migrate reset (destroys data)
```

## 9.2 Backup Strategy

```
DATABASE BACKUPS
  • Automated daily full backup (by managed service)
  • Point-in-time recovery (PITR) — last 7 days
  • Weekly backup retained for 4 weeks
  • Monthly backup retained for 12 months
  • Backup encryption (AES-256)
  • Backup stored in different region

OBJECT STORAGE BACKUPS
  • Versioning enabled
  • Lifecycle policies:
    - Hot: 30 days (frequent access)
    - Warm: 90 days (infrequent)
    - Cold: 1 year (archive)
    - Delete: After retention policy

REDIS
  • AOF (Append-Only File) persistence
  • RDB snapshots every 5 minutes
  • Not critical data (cache + queue state)
  • Rebuildable from database
```

---

# 10. Monitoring & Health Checks

## 10.1 Health Check Endpoints

```
GET /health
  → Liveness probe
  → Returns 200 if process is alive
  → { status: "ok", timestamp: "..." }

GET /health/ready
  → Readiness probe
  → Checks: database, redis, storage connectivity
  → Returns 200 if all dependencies reachable
  → Returns 503 if any dependency down

GET /health/metrics
  → Prometheus metrics endpoint
  → CPU, memory, request count, latency histograms
```

## 10.2 Monitoring Stack

```
┌──────────────────────────────────────────────────────────┐
│                   MONITORING STACK                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  METRICS                                                 │
│  • Prometheus (collection)                              │
│  • Grafana (visualization)                              │
│  • Custom dashboards:                                   │
│    - API performance                                    │
│    - Queue depth                                        │
│    - AI provider health                                 │
│    - Worker utilization                                 │
│    - Database performance                               │
│                                                          │
│  LOGGING                                                 │
│  • Structured JSON logs (Pino)                          │
│  • Centralized: Loki / ELK Stack                        │
│  • Log levels: DEBUG, INFO, WARN, ERROR, FATAL         │
│  • Retention: 30 days hot, 90 days cold                │
│                                                          │
│  ERROR TRACKING                                         │
│  • Sentry                                               │
│  • Automatic error capture                              │
│  • Source map upload                                    │
│  • Alert on new errors                                  │
│                                                          │
│  UPTIME MONITORING                                      │
│  • External ping (UptimeRobot / BetterUptime)           │
│  • Multi-region checks                                  │
│  • Alert on downtime (email, Slack, SMS)               │
│                                                          │
│  ALERTING                                               │
│  • AlertManager (Prometheus)                            │
│  • PagerDuty / Opsgenie integration                    │
│  • Escalation policies                                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

# 11. Rollback Strategy

## 11.1 Rollback Triggers

```
AUTO-ROLLBACK triggers:
  • Health check fails after deployment (5 min window)
  • Error rate exceeds threshold (>5%)
  • Response time degrades (>2x normal)

MANUAL-ROLLBACK triggers:
  • Critical bug discovered
  • Data corruption detected
  • Security vulnerability
```

## 11.2 Rollback Procedure

```
BACKEND ROLLBACK
  1. Switch traffic back to previous version (Blue-Green)
     docker-compose -f docker-compose.prev.yml up -d

  2. If database migration was applied:
     • Forward-only: Create fix-forward migration
     • If data loss: Restore from backup (last resort)

  3. Verify health checks pass

  4. Notify team

FRONTEND ROLLBACK (Vercel)
  1. Go to Vercel dashboard
  2. Select previous deployment
  3. Click "Promote to Production"
  4. Instant rollback (no downtime)

DESKTOP ROLLBACK
  1. Mark latest release as "pre-release" or "draft"
  2. Publish previous version as "latest"
  3. Auto-update will roll back users on next check
  4. Users who already updated → must manually download

ROLLBACK TIME TARGET
  • Backend: < 5 minutes
  • Frontend: < 2 minutes
  • Database: < 30 minutes (backup restore)
```

---

**Next Document:** [15-ROADMAP.md](15-ROADMAP.md)
