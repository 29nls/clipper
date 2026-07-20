# 11-ADMIN-PANEL.md

**Version:** 1.0.0
**Status:** Draft
**Reference:** PRD v1.0, SRS v1.0

---

# Table of Contents

1. [Admin Panel Overview](#1-admin-panel-overview)
2. [Access Control](#2-access-control)
3. [Admin Modules](#3-admin-modules)
4. [User Management](#4-user-management)
5. [AI Provider Management](#5-ai-provider-management)
6. [Prompt Management](#6-prompt-management)
7. [System Configuration](#7-system-configuration)
8. [Analytics & Reports](#8-analytics--reports)
9. [Billing Management](#9-billing-management)
10. [Feature Flags](#10-feature-flags)

---

# 1. Admin Panel Overview

Admin Panel adalah kontrol pusat untuk operasional platform. Diakses melalui web SaaS dengan role `admin`.

## Purpose

```
• Mengelola pengguna dan subscription
• Mengkonfigurasi AI provider, model, dan routing
• Mengelola prompt template dan versinya
• Memantau kesehatan sistem dan provider
• Mengkonfigurasi credit cost, pricing, dan feature flags
• Melihat analytics dan laporan bisnis
• Mengelola payment dan refund
• Audit dan compliance
```

## Access

```
URL: https://app.aivideoclipper.com/admin

Requirements:
  • Role: admin
  • 2FA enabled (recommended)
  • IP allowlist (production, optional)

Unauthorized access → 403 Forbidden + security event logged
```

---

# 2. Access Control

## 2.1 Admin Roles

```
┌─────────────────┬──────────────────────────────────────────┐
│ Role            │ Permissions                              │
├─────────────────┼──────────────────────────────────────────┤
│ super_admin     │ Full access + manage other admins        │
│ admin           │ All modules except admin management      │
│ ai_admin        │ AI providers, models, prompts, routing   │
│ billing_admin   │ Billing, payments, refunds, invoices     │
│ support_admin   │ User management, view-only analytics     │
│ viewer          │ Read-only access to all modules          │
└─────────────────┴──────────────────────────────────────────┘
```

## 2.2 Audit Requirements

```
ALL admin actions are logged to audit_logs:
  • Who (admin user ID)
  • What (action, entity, before/after data)
  • When (timestamp)
  • Where (IP address, user agent)
  • Request ID for tracing

Admin audit logs are IMMUTABLE.
Admin cannot delete audit logs.
```

---

# 3. Admin Modules

```
┌──────────────────────────────────────────────────────────────┐
│                    ADMIN SIDEBAR                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 OVERVIEW                                                │
│     Dashboard                                               │
│     System Health                                           │
│                                                              │
│  👥 USERS                                                   │
│     All Users                                               │
│     Subscriptions                                           │
│     Sessions                                                │
│     Security Events                                         │
│                                                              │
│  🤖 AI MANAGEMENT                                           │
│     Providers                                               │
│     Models                                                  │
│     Routing Rules                                           │
│     Prompts                                                 │
│     Health Monitor                                          │
│     Experiments                                             │
│                                                              │
│  💰 BILLING                                                 │
│     Transactions                                            │
│     Payments                                                │
│     Refunds                                                 │
│     Invoices                                                │
│     Coupons                                                 │
│     Revenue Reports                                         │
│                                                              │
│  📈 ANALYTICS                                               │
│     Platform Metrics                                        │
│     AI Usage                                                │
│     Cost Analysis                                           │
│     User Engagement                                         │
│                                                              │
│  ⚙️ SYSTEM                                                  │
│     Configuration                                           │
│     Feature Flags                                           │
│     API Keys                                                │
│     Audit Logs                                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 4. User Management

## 4.1 User List

```
┌──────────────────────────────────────────────────────────────┐
│  Users                                       [Export CSV]     │
│                                                              │
│  [Search: email, name, ID...]  [Status: All ▾]  [Plan: All▾]│
│                                                              │
│  ┌──────┬───────────┬──────────┬─────────┬────────┬───────┐ │
│  │ User │ Email     │ Plan     │ Status  │Credits │Joined │ │
│  ├──────┼───────────┼──────────┼─────────┼────────┼───────┤ │
│  │ 👤   │user@ex.com│ Pro      │ Active  │  450   │Jan 15 │ │
│  │ 👤   │test@ex.com│ Free     │ Active  │  80    │Feb 03 │ │
│  │ 👤   │bad@ex.com │ -        │Suspended│  0     │Mar 10 │ │
│  └──────┴───────────┴──────────┴─────────┴────────┴───────┘ │
│                                                              │
│  Showing 1-20 of 4,532                    [< 1 2 3 ... >]   │
└──────────────────────────────────────────────────────────────┘
```

## 4.2 User Detail Actions

```
VIEW USER
  • Profile information
  • Subscription history
  • Wallet & transactions
  • Project count
  • AI usage stats
  • Login history
  • Security events

ACTIONS
  • Suspend account        (sets status: suspended)
  • Activate account       (sets status: active)
  • Delete account         (soft delete + retention)
  • Adjust credits         (manual credit adjustment with reason)
  • Reset password         (force password reset)
  • Revoke all sessions    (logout all devices)
  • Change subscription    (manual plan change)
  • Impersonate            (login as user for support — logged)
```

## 4.3 Credit Adjustment

```
┌──────────────────────────────────────────────┐
│  Adjust Credits                              │
│                                              │
│  User: creator@example.com                   │
│  Current Balance: 450                        │
│                                              │
│  Adjustment Type:                            │
│  ○ Add credits                              │
│  ○ Remove credits                           │
│  ○ Set balance                              │
│                                              │
│  Amount: [_______________]                   │
│                                              │
│  Reason (required):                          │
│  [___________________________________]       │
│  [___________________________________]       │
│                                              │
│  ☐ Notify user via email                     │
│                                              │
│  [Cancel]              [Apply Adjustment]    │
└──────────────────────────────────────────────┘

All adjustments:
  ✓ Recorded in wallet_transactions (type: adjusted)
  ✓ Logged in audit_logs
  ✓ User notified (optional)
  ✓ Cannot be deleted
```

---

# 5. AI Provider Management

## 5.1 Provider List

```
┌──────────────────────────────────────────────────────────────┐
│  AI Providers                              [+ Add Provider]   │
│                                                              │
│  ┌────────────┬────────┬─────────┬──────────┬─────────────┐ │
│  │ Provider   │ Status │ Models  │ Jobs/Day │ Avg Latency │ │
│  ├────────────┼────────┼─────────┼──────────┼─────────────┤ │
│  │ OpenRouter │ ●Healthy│   25    │  3,200   │   1.2s      │ │
│  │ NVIDIA     │ ●Healthy│   12    │  1,500   │   0.8s      │ │
│  │ OpenCode* │ ⚠Warning│   8     │    800   │   3.5s      │ │
│  │ OpenAI     │ Disabled│   15    │     0    │     -       │ │
│  └────────────┴────────┴─────────┴──────────┴─────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## 5.2 Provider Configuration

```
PROVIDER DETAILS
  • Provider code (unique identifier)
  • Display name
  • Base URL
  • API key (encrypted, never displayed after save)
  • Provider type
  • Capabilities (stream, image, audio, video, embedding, etc.)
  • Rate limits (daily, monthly)
  • Priority (lower = higher priority)
  • Status (healthy/warning/degraded/offline/disabled)

MODEL MANAGEMENT (per provider)
  • Add/edit/remove models
  • Configure pricing (input/output per token)
  • Set credit multiplier
  • Configure capabilities per model
  • Enable/disable models
  • Set quality/cost/latency scores
```

## 5.3 Routing Rules

```
┌──────────────────────────────────────────────────────────────┐
│  AI Routing Rules                                            │
│                                                              │
│  Define which provider/model handles each job type.          │
│                                                              │
│  ┌──────────────┬──────────┬──────────┬──────────┬────────┐ │
│  │ Job Type     │ Provider │ Model    │ Fallback │Enabled │ │
│  ├──────────────┼──────────┼──────────┼──────────┼────────┤ │
│  │ transcribe   │OpenRouter│Whisper-v3│ NVIDIA   │   ✓    │ │
│  │ translate    │OpenRouter│Qwen      │ NVIDIA   │   ✓    │ ││  │ thumbnail    │OpenCode* │SDXL      │OpenRouter│   ✓    │ │
  │  │ voice_clone  │ NVIDIA   │RVC       │OpenRouter│   ✓    │ │

> **(*) OpenCode** adalah internal AI provider codename. Lihat definisi lengkap di [PRD Glossary](01-PRD.md#22-glossary).
│  │ title_gen    │OpenRouter│Llama-3   │ NVIDIA   │   ✓    │ │
│  └──────────────┴──────────┴──────────┴──────────┴────────┘ │
│                                                              │
│  [+ Add Rule]                                               │
└──────────────────────────────────────────────────────────────┘
```

## 5.4 Health Monitor

```
┌──────────────────────────────────────────────────────────────┐
│  Provider Health Monitor (Live)                              │
│                                                              │
│  OpenRouter                                                  │
│  Status: ● Healthy                                          │
│  Response Time: 1.2s (avg)                                  │
│  Error Rate: 0.3%                                           │
│  Uptime (24h): 99.97%                                       │
│  Jobs Today: 3,200                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [Response time graph — last 24 hours]                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  NVIDIA                                                      │
│  Status: ● Healthy                                          │
│  Response Time: 0.8s (avg)                                  │
│  Error Rate: 0.1%                                           │
│  Uptime (24h): 100%                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [Response time graph — last 24 hours]                  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

Auto-refresh: every 30 seconds
Alert on status change (email/Slack)
```

---

# 6. Prompt Management

## 6.1 Prompt List

```
┌──────────────────────────────────────────────────────────────┐
│  AI Prompts                                [+ New Prompt]     │
│                                                              │
│  ┌──────────────────┬──────────┬─────────┬────────┬────────┐│
│  │ Prompt Code      │ Category │ Version │ Status │ Usage  ││
│  ├──────────────────┼──────────┼─────────┼────────┼────────┤│
│  │ TITLE_GENERATOR  │ Content  │   v3    │ Active │ 12,500 ││
│  │ DESC_GENERATOR   │ Content  │   v2    │ Active │ 12,300 ││
│  │ HOOK_GENERATOR   │ Content  │   v1    │ Active │ 10,100 ││
│  │ THUMB_GENERATOR  │ Visual   │   v1    │ Draft  │    0   ││
│  │ HASHTAG_GEN      │ Content  │   v4    │ Active │ 11,800 ││
│  └──────────────────┴──────────┴─────────┴────────┴────────┘│
└──────────────────────────────────────────────────────────────┘
```

## 6.2 Prompt Version Management

```
RULES:
  • Prompts are IMMUTABLE once published
  • Creating new version does NOT overwrite old
  • Each job records which version was used
  • Rollback = activate previous version
  • A/B testing via experiments

VERSION DETAILS:
  • Version number
  • Template (with {{variable}} placeholders)
  • Variables definition (JSON)
  • Expected output format (JSON)
  • Model parameters (temperature, top_p, etc.)
  • Created by
  • Created at
  • Status (draft/active/archived)

CAN:
  ✓ Create new version
  ✓ Activate a version (deactivates others)
  ✓ Archive a version
  ✓ View usage statistics per version
  ✓ Compare versions side-by-side
  ✓ A/B test versions

CANNOT:
  ✗ Edit an existing version
  ✗ Delete a version (only archive)
  ✗ Delete usage history
```

---

# 7. System Configuration

## 7.1 Application Config

```
┌──────────────────────────────────────────────────────────────┐
│  System Configuration                                        │
│                                                              │
│  GENERAL                                                     │
│  ┌────────────────────────┬─────────────────────────────────┐│
│  │ App Name               │ AI Video Clipper                ││
│  │ Support Email          │ support@aivideoclipper.com      ││
│  │ Max Upload Size (MB)   │ [2048]                          ││
│  │ Chunk Size (MB)        │ [10]                            ││
│  │ Default Language       │ [English ▾]                     ││
│  │ Session Timeout (min)  │ [43200] (30 days)               ││
│  └────────────────────────┴─────────────────────────────────┘│
│                                                              │
│  AI SETTINGS                                                 │
│  ┌────────────────────────┬─────────────────────────────────┐│
│  │ Default Provider Mode  │ [Hybrid ▾]                      ││
│  │ Max Retries            │ [3]                             ││
│  │ Retry Backoff (ms)     │ [1000]                          ││
│  │ Cache TTL (hours)      │ [24]                            ││
│  │ Health Check Interval  │ [60] (seconds)                  ││
│  └────────────────────────┴─────────────────────────────────┘│
│                                                              │
│  RENDERING                                                   │
│  ┌────────────────────────┬─────────────────────────────────┐│
│  │ Max Concurrent Renders │ [3] (per desktop)               ││
│  │ Cloud Render Timeout   │ [1800] (seconds)                ││
│  │ Default Codec          │ [h264 ▾]                        ││
│  │ Default FPS            │ [30]                            ││
│  └────────────────────────┴─────────────────────────────────┘│
│                                                              │
│  CREDIT COSTS (per operation)                                │
│  ┌────────────────────────┬─────────────────────────────────┐│
│  │ Transcription          │ [5] credits / 10 min            ││
│  │ Subtitle Generation    │ [2] credits / clip              ││
│  │ Translation            │ [3] credits / language          ││
│  │ Viral Detection        │ [5] credits / video             ││
│  │ Thumbnail Generation   │ [2] credits / clip              ││
│  │ Voice Clone            │ [20] credits / use              ││
│  │ Rendering              │ [10] credits / clip             ││
│  └────────────────────────┴─────────────────────────────────┘│
│                                                              │
│  [Save Changes]                                              │
└──────────────────────────────────────────────────────────────┘

All config changes:
  ✓ Stored in app_config table
  ✓ No app restart required
  ✓ Logged to audit_logs
  ✓ Takes effect immediately
```

---

# 8. Analytics & Reports

## 8.1 Platform Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  Platform Overview                                           │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Users    │ │ MRR      │ │ AI Jobs  │ │ GPU Hrs  │        │
│  │  4,532   │ │ $12,450  │ │ 145K     │ │  2,340   │        │
│  │ +12.5%   │ │ +8.3%    │ │ +22.1%   │ │ +15.2%   │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ User Growth (Last 12 Months)                            │ │
│  │ [Line chart: cumulative users]                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────┐ ┌──────────────────────────┐  │
│  │ Revenue by Plan          │ │ AI Provider Usage        │  │
│  │ [Pie chart]              │ │ [Bar chart]              │  │
│  │ Free: 2,100 (46%)       │ │ OpenRouter: 58%         │  │
│  │ Starter: 950 (21%)      │ │ NVIDIA: 28%             │  │
│  │ Pro: 1,000 (22%)        │ │ OpenCode: 14%           │  │
│  │ Business: 380 (8%)      │ │                          │  │
│  │ Enterprise: 102 (3%)    │ │                          │  │
│  └──────────────────────────┘ └──────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## 8.2 Available Reports

```
USER REPORTS
  • Daily/Monthly active users
  • User retention (cohort analysis)
  • Signup funnel
  • Conversion rate (free → paid)
  • Churn analysis

REVENUE REPORTS
  • MRR / ARR
  • Revenue by plan
  • Credit purchase trends
  • Payment success rate
  • Refund rate

AI REPORTS
  • Jobs by type
  • Provider cost breakdown
  • Average latency by provider
  • Error rate by provider
  • Cache hit rate
  • Credit consumption by feature

SYSTEM REPORTS
  • API response times
  • Queue depth over time
  • Worker utilization
  • Storage usage
  • Database performance

All reports:
  ✓ Date range filter
  ✓ Export to CSV / PDF
  ✓ Scheduled email delivery
  ✓ API access for external BI tools
```

---

# 9. Billing Management

## 9.1 Transaction Monitoring

```
┌──────────────────────────────────────────────────────────────┐
│  All Transactions                                            │
│                                                              │
│  [Date Range: Last 30 days ▾]  [Type: All ▾]  [Search...]   │
│                                                              │
│  ┌──────────┬──────┬──────────┬────────┬────────┬──────────┐│
│  │ Date     │ User │ Type     │ Amount │ Method │ Status   ││
│  ├──────────┼──────┼──────────┼────────┼────────┼──────────┤│
│  │ Jul 16   │ 👤   │ Purchase │ $29.00 │ Stripe │Completed ││
│  │ Jul 16   │ 👤   │Subscript │ $99.00 │Stripe  │Completed ││
│  │ Jul 15   │ 👤   │ Refund   │-$9.00  │Stripe  │Completed ││
│  │ Jul 15   │ 👤   │ Purchase │ $9.00  │Xendit  │Pending   ││
│  └──────────┴──────┴──────────┴────────┴────────┴──────────┘│
└──────────────────────────────────────────────────────────────┘
```

## 9.2 Refund Management

```
Admin can issue refunds:
  ✓ Full or partial refund
  ✓ Reason required
  ✓ Logged in audit
  ✓ Notifies user
  ✓ Reverses credit allocation (if applicable)
  ✓ Integrates with payment provider API

Refund approval flow:
  • billing_admin requests refund
  • super_admin approves (if > $100)
  • System processes via payment provider
  • Records in payment_history
```

## 9.3 Coupon Management

```
Create and manage promotional codes:

  Coupon Code: LAUNCH20
  Description: 20% off for launch month
  Discount Type: Percentage
  Discount Value: 20%
  Valid From: 2026-07-01
  Valid Until: 2026-08-01
  Max Uses: 1000
  Used: 342
  Status: Active

  [Save] [Deactivate]
```

---

# 10. Feature Flags

## Purpose

```
Control feature rollout without code deployment.

Use cases:
  • Gradual feature rollout (enable for X% of users)
  • Beta feature access (specific users)
  • Emergency kill switch (disable broken feature)
  • A/B testing (different variants)
```

## Flag Management

```
┌──────────────────────────────────────────────────────────────┐
│  Feature Flags                                               │
│                                                              │
│  ┌──────────────────┬──────────┬──────────┬────────────────┐│
│  │ Flag Key         │ Strategy │ Status   │ Affected Users ││
│  ├──────────────────┼──────────┼──────────┼────────────────┤│
│  │ voice_clone      │ boolean  │ ● OFF    │ 0 / 4,532      ││
│  │ ai_dubbing       │ percent  │ ● 10% ON │ 453 / 4,532    ││
│  │ new_timeline     │ user_list│ ● Beta   │ 50 / 4,532     ││
│  │ multi_tenant     │ boolean  │ ● OFF    │ 0 / 4,532      ││
│  │ cloud_rendering  │ percent  │ ● 100%ON │ 4,532 / 4,532  ││
│  └──────────────────┴──────────┴──────────┴────────────────┘│
│                                                              │
│  [+ New Flag]                                               │
└──────────────────────────────────────────────────────────────┘

Strategies:
  • boolean     — ON or OFF for everyone
  • percentage  — X% of users (randomized, sticky)
  • user_list   — Specific user IDs

Changes take effect within 60 seconds (cache TTL).
No app restart or redeploy needed.
```

---

**Next Document:** [12-BILLING-CREDIT.md](12-BILLING-CREDIT.md)
