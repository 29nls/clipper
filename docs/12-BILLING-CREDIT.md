# 12-BILLING-CREDIT.md

**Version:** 1.0.0
**Status:** Draft
**Reference:** PRD v1.0, SRS v1.0

---

# Table of Contents

1. [Billing Overview](#1-billing-overview)
2. [Credit System](#2-credit-system)
3. [Subscription Plans](#3-subscription-plans)
4. [Wallet & Transactions](#4-wallet--transactions)
5. [Payment Integration](#5-payment-integration)
6. [Invoice System](#6-invoice-system)
7. [Coupon & Promo System](#7-coupon--promo-system)
8. [Webhook Handling](#8-webhook-handling)
9. [Credit Lifecycle](#9-credit-lifecycle)
10. [Pricing Strategy](#10-pricing-strategy)

---

# 1. Billing Overview

Sistem billing menggabungkan tiga model monetisasi:

```
┌──────────────────────────────────────────────────────────────┐
│                    MONETIZATION MODEL                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. FREEMIUM                                                 │
│     • Free plan dengan limited credits                       │
│     • Watermark pada export (optional)                       │
│     • Tujuan: User acquisition & onboarding                  │
│                                                              │
│  2. SUBSCRIPTION (Recurring)                                 │
│     • Starter, Pro, Business, Enterprise                     │
│     • Monthly atau Yearly billing                            │
│     • Includes credit allocation per cycle                   │
│     • Premium features                                       │
│                                                              │
│  3. CREDIT PURCHASE (One-time)                               │
│     • Buy additional credits anytime                         │
│     • Credit packs (100, 500, 1000, 5000)                   │
│     • Volume discount                                        │
│     • Never expires (for purchased credits)                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Revenue Streams

```
Subscription Revenue (primary)
  ├── Starter:   $9/month
  ├── Pro:       $29/month
  ├── Business:  $99/month
  └── Enterprise: Custom pricing

Credit Purchase Revenue (secondary)
  ├── 100 credits:   $2
  ├── 500 credits:   $9
  ├── 1000 credits:  $15
  ├── 5000 credits:  $60
  └── Custom: Volume-based

Enterprise Add-ons
  ├── Dedicated GPU workers
  ├── Custom AI models
  ├── White-label license
  ├── Priority support
  └── SLA guarantees
```

---

# 2. Credit System

## 2.1 Credit Principles

```
CREDIT = Satuan konsumsi fitur AI

Setiap AI Job memiliki:
  • Credit Cost (berapa kredit dibutuhkan)
  • Estimated Cost (estimasi sebelum eksekusi)
  • Actual Cost (biaya aktual setelah eksekusi)
  • AI Provider (provider yang digunakan)
  • AI Model (model yang digunakan)

ATURAN KREDIT:
  ✓ Kredit TIDAK dikurangi saat job dibuat
  ✓ Kredit dikurangi HANYA saat job COMPLETED
  ✓ Kredit DIKEMBALIKAN saat job FAILED (setelah retries)
  ✓ Kredit TIDAK dikurangi untuk cache hits
  ✓ Kredit TIDAK boleh negatif
  ✓ Semua transaksi IMMUTABLE
  ✓ Double-entry ledger untuk audit
  ✓ Semua perubahan memiliki audit log
```

## 2.2 Credit Sources

```
┌──────────────────────────────────────────────────────┐
│                  CREDIT SOURCES                      │
├──────────────────────────────────────────────────────┤
│                                                    │
│  1. SUBSCRIPTION ALLOCATION                        │
│     • Credits diberikan tiap billing cycle         │
│     • Reset setiap bulan                           │
│     • Tidak di-rollover (use it or lose it)       │
│                                                    │
│  2. CREDIT PURCHASE                                │
│     • One-time purchase                            │
│     • TIDAK expired                                │
│     • Digunakan setelah subscription credits habis │
│                                                    │
│  3. BONUS CREDITS                                  │
│     • Signup bonus (100 credits)                   │
│     • Referral bonus                               │
│     • Promotional events                           │
│     • May have expiry date                         │
│                                                    │
│  4. ADMIN ADJUSTMENT                               │
│     • Manual adjustment oleh admin                 │
│     • Requires reason                              │
│     • Fully audited                                │
│                                                    │
│  5. REFUND CREDITS                                 │
│     • Dari job yang gagal                          │
│     • Automatic refund                             │
│                                                    │
└──────────────────────────────────────────────────────┘
```

## 2.3 Credit Consumption Priority

```
When user spends credits, system deducts in this order:

  1. SUBSCRIPTION CREDITS (expiring soon)
     └─ Use these first (they reset monthly)

  2. SUBSCRIPTION CREDITS (current cycle)
     └─ Remaining current allocation

  3. BONUS CREDITS (expiring soon)
     └─ Time-limited promotional credits

  4. PURCHASED CREDITS
     └─ These never expire, use last

This ensures users don't lose expiring credits unnecessarily.
```

## 2.4 Credit Cost Table

```
┌────────────────────────┬──────────┬───────────────────────────┐
│ Operation              │ Credits  │ Unit                      │
├────────────────────────┼──────────┼───────────────────────────┤
│ SPEECH RECOGNITION     │    5     │ per 10 min audio          │
│ SUBTITLE GENERATION    │    2     │ per clip                  │
│ SUBTITLE TRANSLATION   │    3     │ per language per clip     │
│ SCENE DETECTION        │    3     │ per video                 │
│ SPEAKER DETECTION      │    5     │ per video                 │
│ FACE TRACKING          │    5     │ per video                 │
│ EMOTION ANALYSIS       │    3     │ per video                 │
│ SILENCE DETECTION      │    2     │ per video                 │
│ FILLER DETECTION       │    2     │ per video                 │
│ HOOK DETECTION         │    3     │ per video                 │
│ VIRAL DETECTION        │    5     │ per video                 │
│ CLIP RANKING           │    0     │ included                  │
│ AUTO-REFRAME           │    5     │ per clip                  │
│ TITLE GENERATION       │    1     │ per clip                  │
│ DESCRIPTION GENERATION │    1     │ per clip                  │
│ HASHTAG GENERATION     │    1     │ per clip                  │
│ EMOJI SUGGESTION       │    0     │ included                  │
│ THUMBNAIL GENERATION   │    2     │ per clip                  │
│ VOICE CLONE            │   20     │ per use                   │
│ VOICE DUBBING          │   15     │ per clip                  │
│ NOISE REDUCTION        │    3     │ per clip                  │
│ LOUDNESS NORMALIZATION │    1     │ per clip                  │
│ RENDERING              │   10     │ per clip                  │
│ CLOUD RENDERING        │   15     │ per clip (GPU server)     │
│ PUBLISHING             │    0     │ free                      │
│ ANALYTICS              │    0     │ free                      │
└────────────────────────┴──────────┴───────────────────────────┘

NOTE: All values are CONFIGURABLE via admin panel.
      Stored in app_config, not hardcoded.
      Actual values set after AI model selection and cost analysis.
```

## 2.5 Example: Full Pipeline Cost

```
User runs full AI pipeline on a 30-minute podcast:

  Speech Recognition (30 min)     = 15 credits
  Scene Detection (1 video)       =  3 credits
  Speaker Detection (1 video)     =  5 credits
  Face Tracking (1 video)         =  5 credits
  Emotion Analysis (1 video)      =  3 credits
  Silence Detection (1 video)     =  2 credits
  Hook Detection (1 video)        =  3 credits
  Viral Detection (1 video)       =  5 credits
  ────────────────────────────────
  Pipeline Subtotal:                41 credits

  Then user selects 5 clips to finalize:
  Auto-Reframe (5 clips)          = 25 credits
  Subtitle Generation (5 clips)   = 10 credits
  Title Generation (5 clips)      =  5 credits
  Description Generation (5 clips)=  5 credits
  Hashtag Generation (5 clips)    =  5 credits
  Thumbnail Generation (5 clips)  = 10 credits
  ────────────────────────────────
  Clip Finalization Subtotal:      60 credits

  Rendering (5 clips, local)      = 50 credits
  ────────────────────────────────
  TOTAL:                          151 credits

With Pro plan (2000 credits/month):
  This pipeline uses ~7.5% of monthly allocation.
```

---

# 3. Subscription Plans

## 3.1 Plan Comparison

```
┌──────────────┬──────────┬──────────┬──────────┬──────────┬────────────┐
│ Feature      │ Free     │ Starter  │ Pro      │ Business │ Enterprise │
├──────────────┼──────────┼──────────┼──────────┼──────────┼────────────┤
│ Monthly Price│   $0     │   $9     │   $29    │   $99    │  Custom    │
│ Yearly Price │   $0     │   $90    │   $290   │  $990    │  Custom    │
│              │          │ (-17%)   │ (-17%)   │ (-17%)   │            │
├──────────────┼──────────┼──────────┼──────────┼──────────┼────────────┤
│ Credits/mo   │   100    │   500    │  2,000   │  5,000   │  Custom    │
│ Daily Limit  │  5 jobs  │  20 jobs │ 100 jobs │ 500 jobs │ Unlimited  │
│ Concurrent   │    1     │    3     │    5     │   10     │ Unlimited  │
│ Queue Priority│ Standard │ Standard │ Priority │ Priority │ Highest    │
│              │          │          │          │          │            │
│ UPLOADS      │          │          │          │          │            │
│ Max File Size│  500 MB  │   2 GB   │   5 GB   │  20 GB   │ Unlimited  │
│ Storage      │   1 GB   │   10 GB  │  50 GB   │ 200 GB   │ Unlimited  │
│              │          │          │          │          │            │
│ RENDERING    │          │          │          │          │            │
│ Local Render │    ✓     │    ✓     │    ✓     │    ✓     │     ✓      │
│ Cloud Render │    ✗     │    ✗     │    ✓     │    ✓     │     ✓      │
│ Max Resolution│ 720p    │  1080p   │  1080p   │  4K      │ 4K         │
│ Watermark    │ Optional │    ✗     │    ✗     │    ✗     │     ✗      │
│ Batch Render │    ✗     │  3 clips │ 10 clips │ 50 clips │ Unlimited  │
│              │          │          │          │          │            │
│ AI FEATURES  │          │          │          │          │            │
│ Viral Detect │    ✓     │    ✓     │    ✓     │    ✓     │     ✓      │
│ Clip Ranking │    ✓     │    ✓     │    ✓     │    ✓     │     ✓      │
│ Subtitles    │    ✓     │    ✓     │    ✓     │    ✓     │     ✓      │
│ Translation  │    ✗     │    ✓     │    ✓     │    ✓     │     ✓      │
│ Voice Clone  │    ✗     │    ✗     │    ✓     │    ✓     │     ✓      │
│ Dubbing      │    ✗     │    ✗     │    ✓     │    ✓     │     ✓      │
│              │          │          │          │          │            │
│ PUBLISHING   │          │          │          │          │            │
│ YouTube      │    ✓     │    ✓     │    ✓     │    ✓     │     ✓      │
│ TikTok       │    ✓     │    ✓     │    ✓     │    ✓     │     ✓      │
│ Schedule     │    ✗     │    ✓     │    ✓     │    ✓     │     ✓      │
│              │          │          │          │          │            │
│ SUPPORT      │          │          │          │          │            │
│ Level        │ Community│ Email    │ Priority │ Dedicated│ SLA        │
│ Response Time│    -     │  48 hrs  │  24 hrs  │  4 hrs   │  1 hr      │
│              │          │          │          │          │            │
│ ENTERPRISE   │          │          │          │          │            │
│ API Access   │    ✗     │    ✗     │    ✗     │    ✓     │     ✓      │
│ White Label  │    ✗     │    ✗     │    ✗     │    ✗     │     ✓      │
│ Custom AI    │    ✗     │    ✗     │    ✗     │    ✗     │     ✓      │
│ SLA          │    ✗     │    ✗     │    ✗     │    ✗     │     ✓      │
└──────────────┴──────────┴──────────┴──────────┴──────────┴────────────┘
```

## 3.2 Subscription Lifecycle

```
                    ┌─────────┐
                    │ TRIAL   │ ← Free trial (14 days, Pro features)
                    └────┬────┘
                         │
                         ▼
                    ┌─────────┐
                    │ ACTIVE  │ ← Paying subscriber
                    └────┬────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
     ┌────────────┐ ┌─────────┐ ┌──────────┐
     │GRACE PERIOD│ │ RENEWED │ │CANCELLED │
     │ (7 days)   │ └─────────┘ │ (by user)│
     └─────┬──────┘             └─────┬────┘
           │                          │
           │ Payment failed           │ Effective at period end
           ▼                          ▼
     ┌──────────┐               ┌──────────┐
     │ EXPIRED  │               │  FREE    │
     └──────────┘               │ (revert) │
                                └──────────┘

TRIAL:
  • 14 days Pro features
  • No credit card required to start
  • Credits: 200 (trial allocation)
  • Auto-converts to Free if no payment

GRACE PERIOD:
  • Payment failed but retrying
  • Full access maintained
  • Auto-retry payment (3 attempts)
  • Email notifications sent

EXPIRED:
  • Subscription ended
  • Reverts to Free plan
  • Credits reset to Free allocation
  • Purchased credits retained
```

---

# 4. Wallet & Transactions

## 4.1 Wallet Structure

```
Each user has ONE wallet:

  wallet
  ├── id
  ├── user_id          → user
  ├── balance          → Current available credits
  ├── reserved_balance → Credits reserved for in-progress jobs
  ├── total_earned     → Lifetime credits received
  ├── total_spent      → Lifetime credits consumed
  ├── currency         → USD (display only)
  ├── created_at
  └── updated_at

Available = balance - reserved_balance

Example:
  balance:           500
  reserved_balance:   20 (2 jobs in progress, 10 each)
  available:         480
```

## 4.2 Transaction Types

```
┌──────────────────────────────────────────────────────────────┐
│                  TRANSACTION TYPES                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  CREDIT EARNED     → Credits from referral, signup bonus    │
│  CREDIT PURCHASED  → Credits bought with money              │
│  CREDIT BONUS      → Promotional/gifted credits             │
│  CREDIT SUBSCRIPTION→ Monthly allocation from plan          │
│  CREDIT CONSUMED   → Credits used for AI job (negative)     │
│  CREDIT REFUNDED   → Credits returned from failed job       │
│  CREDIT EXPIRED    → Credits past expiry date (negative)    │
│  CREDIT ADJUSTED   → Manual admin adjustment                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 4.3 Transaction Record (Immutable)

```
Every credit change creates a wallet_transaction:

  {
    id:               uuid,
    wallet_id:        uuid,
    user_id:          uuid,
    transaction_type: consumed,
    state:            completed,
    amount:           -5,           (negative for consumption)
    balance_before:   505,          (balance before transaction)
    balance_after:    500,          (balance after transaction)
    description:      "Subtitle generation",
    reference: {
      type:           ai_job,
      id:             uuid           (which job consumed it)
    },
    metadata: {
      provider:       openrouter,
      model:          whisper-v3,
      clip_id:        uuid
    },
    created_at:       timestamp
  }

RULES:
  ✓ Every transaction has balance_before and balance_after
  ✓ balance_after = balance_before + amount (always)
  ✓ Transactions are APPEND-ONLY (never edited)
  ✓ Admin CANNOT delete transactions
  ✓ Any discrepancy triggers alert
```

## 4.4 Double-Entry Ledger

```
For audit compliance, credit system uses double-entry bookkeeping:

  DEBIT (from)            CREDIT (to)
  ─────────────────       ──────────────────
  Revenue Account         User Wallet
  (subscription revenue)  (credit allocation)

  User Wallet             AI Cost Account
  (credit consumed)       (operational cost)

Every credit movement has a matching entry:
  Source → Destination
  Amount always balances to zero
  Enables full audit trail
```

---

# 5. Payment Integration

## 5.1 Payment Provider Abstraction

```
┌──────────────────────────────────────────────────────────┐
│              PAYMENT GATEWAY ABSTRACTION                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              IPaymentGateway (interface)                 │
│                   │                                      │
│    ┌──────────────┼──────────────┐                      │
│    │              │              │                      │
│    ▼              ▼              ▼                      │
│ Stripe         Midtrans       Xendit                     │
│ (International) (Indonesia)   (SEA)                      │
│                                                          │
│  Methods:                                                │
│  • createPaymentIntent()                                │
│  • confirmPayment()                                     │
│  • refundPayment()                                      │
│  • createSubscription()                                 │
│  • cancelSubscription()                                 │
│  • handleWebhook()                                      │
│                                                          │
└──────────────────────────────────────────────────────────┘

MVP: Stripe (international) + Midtrans/Xendit (Indonesia)
Future: PayPal, Apple Pay, Google Pay
```

## 5.2 Payment Flow

```
USER CHECKOUT
  │
  ▼
POST /billing/subscription (or /billing/credits/purchase)
  │
  ▼
API creates Payment record (status: pending)
  │
  ▼
API calls Payment Provider (createPaymentIntent)
  │
  ▼
Return client_secret / payment URL to frontend
  │
  ▼
FRONTEND renders payment form (Stripe Elements / redirect)
  │
  ▼
User completes payment
  │
  ▼
Payment Provider processes payment
  │
  ▼
Payment Provider sends WEBHOOK to /billing/webhook/:provider
  │
  ▼
WEBHOOK HANDLER:
  1. Verify signature
  2. Update Payment record (status: completed)
  3. Create Invoice
  4. If subscription:
     → Update subscription status
     → Allocate credits to wallet
  5. If credit purchase:
     → Add credits to wallet
  6. Create wallet_transaction (type: purchased/subscription)
  7. Send confirmation email
  8. Return 200 OK to provider
```

## 5.3 Subscription Billing

```
RECURRING BILLING:
  • Payment provider handles recurring charges
  • Webhook notifies on each successful charge
  • Failed charges trigger grace period
  • 3 retry attempts over 7 days
  • After 3 failures → subscription expires

UPGRADE/DOWNGRADE:
  • Proration calculated automatically
  • Immediate or next-cycle (configurable)
  • Credit allocation adjusted

CANCEL:
  • User-initiated: Effective at period end
  • Immediate: Prorated refund (if applicable)
  • Retention offer: Discount to prevent churn
```

---

# 6. Invoice System

## 6.1 Invoice Generation

```
Every successful payment generates an invoice:

  INVOICE
  ├── Invoice Number (sequential, unique: INV-2026-001234)
  ├── Issue Date
  ├── Due Date (immediate for auto-pay)
  ├── User Info (name, email, address)
  ├── Line Items
  │   ├── Subscription: Pro Plan (Monthly) .... $29.00
  │   ├── Credits: 500 pack ................... $9.00
  │   └── Tax (VAT 11%) ....................... $4.18
  ├── Subtotal ................................. $38.00
  ├── Tax ...................................... $4.18
  ├── Total .................................... $42.18
  ├── Payment Status: Paid
  ├── Payment Date
  └── PDF URL

Features:
  ✓ Auto-generated PDF
  ✓ Downloadable from billing page
  ✓ Emailed to user
  ✓ Stored permanently
  ✓ Accessible via API
```

## 6.2 Tax Handling

```
Tax calculation based on:
  • User's country (from billing address)
  • Product type (digital service)
  • Local tax rates (VAT, GST, sales tax)

Indonesia: PPN 11%
Other countries: Per local regulations

Tax ID field available for businesses.
Tax-exempt status supported for qualifying organizations.
```

---

# 7. Coupon & Promo System

## 7.1 Coupon Types

```
┌──────────────────────────────────────────────────────┐
│                  COUPON TYPES                        │
├──────────────────────────────────────────────────────┤
│                                                    │
│  PERCENTAGE DISCOUNT                               │
│    code: LAUNCH20                                  │
│    discount: 20% off                               │
│    applies to: first subscription payment          │
│                                                    │
│  FIXED AMOUNT DISCOUNT                             │
│    code: SAVE10                                    │
│    discount: $10 off                               │
│    applies to: any purchase                        │
│                                                    │
│  FREE MONTHS                                       │
│    code: FREEMONTH                                 │
│    discount: 1 month free                          │
│    applies to: subscription                        │
│                                                    │
│  EXTRA CREDITS                                     │
│    code: BONUS500                                  │
│    reward: 500 bonus credits                       │
│    applies to: any subscription                    │
│                                                    │
└──────────────────────────────────────────────────────┘
```

## 7.2 Coupon Rules

```
Each coupon has:
  • Code (unique, case-insensitive)
  • Discount type (percentage/fixed/months/credits)
  • Discount value
  • Applies to (subscription/credits/any)
  • Valid from / until dates
  • Max total uses
  • Max uses per user
  • Minimum purchase amount
  • First-time customer only?
  • Stackable? (usually no)

Validation on checkout:
  1. Code exists and is active
  2. Within valid date range
  3. Max uses not exceeded
  4. User hasn't exceeded per-user limit
  5. Meets minimum purchase
  6. Applies to selected plan/product

If valid: apply discount, record in coupon_usage
If invalid: return error with reason
```

---

# 8. Webhook Handling

## 8.1 Webhook Security

```
CRITICAL: Webhook endpoints must be secure.

Security measures:
  1. Signature verification
     • Each provider signs webhooks with secret key
     • Verify signature before processing
     • Reject if signature invalid

  2. Idempotency
     • Each webhook has unique event ID
     • Check if already processed
     • Skip duplicates

  3. IP allowlist (optional)
     • Only accept from provider's IP ranges

  4. HTTPS only
     • Never accept webhooks over HTTP

  5. Timeout
     • Respond 200 within 5 seconds
     • Process async if heavy work needed
```

## 8.2 Webhook Events

```
┌──────────────────────────────────────────────────────┐
│                  WEBHOOK EVENTS                      │
├──────────────────────────────────────────────────────┤
│                                                    │
│  PAYMENT SUCCEEDED                                 │
│    → Update payment status                         │
│    → Generate invoice                              │
│    → Allocate credits                              │
│    → Send confirmation email                       │
│                                                    │
│  PAYMENT FAILED                                    │
│    → Update payment status                         │
│    → Notify user                                   │
│    → If subscription: start grace period           │
│                                                    │
│  SUBSCRIPTION CREATED                              │
│    → Activate subscription                         │
│    → Allocate initial credits                      │
│                                                    │
│  SUBSCRIPTION RENEWED                              │
│    → Extend subscription                           │
│    → Allocate new credits                          │
│    → Generate invoice                              │
│                                                    │
│  SUBSCRIPTION CANCELLED                            │
│    → Mark subscription cancelled                   │
│    → Schedule downgrade to free                    │
│                                                    │
│  REFUND PROCESSED                                  │
│    → Reverse credit allocation                     │
│    → Update invoice                                │
│    → Notify user                                   │
│                                                    │
└──────────────────────────────────────────────────────┘
```

---

# 9. Credit Lifecycle

## 9.1 Credit State Machine

```
                    ┌──────────┐
                    │ CREATED  │ ← Transaction created
                    └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
                    │ PENDING  │ ← Awaiting processing
                    └────┬─────┘
                         │
                         ▼
              ┌──────────────────┐
              │ RESERVED         │ ← (Optional) Held for in-progress job
              │ (optional)       │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ PROCESSING       │ ← Job running, credits will be deducted
              └────────┬─────────┘
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        ┌──────────┐     ┌──────────┐
        │COMMITTED │     │CANCELLED │
        └────┬─────┘     └──────────┘
             │                  (job cancelled before completion)
             ▼
        ┌──────────┐
        │COMPLETED │ ← Credits deducted from wallet
        └────┬─────┘
             │
             ├──→ If job fails later: ──→ REFUNDED
             │
             ▼
        ┌──────────┐
        │ EXPIRED  │ ← (For time-limited credits)
        └──────────┘
```

## 9.2 Credit Reservation

```
For jobs with estimated cost > 0:

  BEFORE EXECUTION:
    1. Check available credits ≥ estimated credits
    2. Reserve: reserved_balance += estimated
    3. available = balance - reserved_balance

  DURING EXECUTION:
    Job runs (credits held but not yet deducted)

  ON COMPLETION:
    1. Calculate actual cost
    2. Deduct: balance -= actual_cost
    3. Release: reserved_balance -= estimated
    4. Create wallet_transaction (consumed)

  ON FAILURE (after retries):
    1. Release: reserved_balance -= estimated
    2. No deduction
    3. Create wallet_transaction (refunded)

  ON CANCEL:
    1. Release: reserved_balance -= estimated
    2. No deduction
```

---

# 10. Pricing Strategy

## 10.1 Pricing Principles

```
1. VALUE-BASED PRICING
   Price reflects value delivered (time saved), not just cost.

2. AI COST COVERAGE
   Subscription + credit purchases must cover AI provider costs.
   Target margin: 60-70% after AI costs.

3. CREDIT FRICTION
   Credits create awareness of usage.
   Prevents abuse.
   Allows flexible pricing per feature.

4. FREEMIUM FUNNEL
   Free plan → showcase value → upgrade.
   Conversion target: 15% free → paid.

5. COMPETITIVE
   Priced competitively vs Opus Clip, Vizard, VEED.
   Lower price + more features = better value.
```

## 10.2 Cost Structure Analysis

```
Per-user AI cost (estimated):
  Average pipeline: ~150 credits
  AI provider cost: ~$0.50 per pipeline
  Platform cost: ~$0.10 (compute, storage, bandwidth)
  Total cost per pipeline: ~$0.60

Revenue per user (Pro plan):
  $29/month
  Average pipelines/month: 10
  Credits used: ~1,500 (of 2,000 allocation)

  Revenue: $29.00
  AI Cost: $6.00 (10 pipelines × $0.60)
  Gross Margin: $23.00 (79%)

Free user cost:
  100 credits = ~0.7 pipelines
  AI Cost: ~$0.42
  Covered by: marketing budget (acquisition cost)
```

## 10.3 Dynamic Pricing (Future)

```
Future capabilities:
  • Volume discounts for large credit purchases
  • Off-peak pricing (cheaper during low-demand hours)
  • Enterprise custom pricing
  • Regional pricing (purchasing power parity)
  • Usage-based overage charges
```

---

**Next Document:** [13-SECURITY.md](13-SECURITY.md)
