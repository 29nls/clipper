# 13-SECURITY.md

**Version:** 1.0.0
**Status:** Draft
**Reference:** PRD v1.0, SRS v1.0

---

# Table of Contents

1. [Security Overview](#1-security-overview)
2. [Authentication Security](#2-authentication-security)
3. [Authorization](#3-authorization)
4. [Transport Security](#4-transport-security)
5. [Data Protection](#5-data-protection)
6. [API Security](#6-api-security)
7. [Input Validation](#7-input-validation)
8. [Rate Limiting](#8-rate-limiting)
9. [Audit Logging](#9-audit-logging)
10. [AI Security](#10-ai-security)
11. [OWASP Top 10 Compliance](#11-owasp-top-10-compliance)
12. [Incident Response](#12-incident-response)

---

# 1. Security Overview

## Security Principles

```
DEFENSE IN DEPTH
  Multiple layers of security. No single point of failure.

LEAST PRIVILEGE
  Users and services have minimum permissions needed.

SECURE BY DEFAULT
  Security settings are ON by default.

NEVER TRUST INPUT
  All user input is validated and sanitized.

AUDIT EVERYTHING
  All critical actions are logged and traceable.

SECRETS NEVER EXPOSED
  API keys, passwords, tokens never in client-side code.
```

## Security Architecture Layers

```
┌──────────────────────────────────────────────────────────────┐
│  LAYER 1: NETWORK SECURITY                                   │
│  • TLS 1.3 everywhere                                       │
│  • HSTS, CSP, Security Headers                              │
│  • DDoS protection (Cloudflare)                             │
│  • Firewall rules                                           │
├──────────────────────────────────────────────────────────────┤
│  LAYER 2: APPLICATION SECURITY                               │
│  • JWT authentication                                       │
│  • RBAC authorization                                       │
│  • Input validation (Zod)                                   │
│  • Rate limiting                                            │
│  • CSRF protection                                          │
│  • XSS prevention                                           │
│  • SQL injection prevention (Prisma parameterized)          │
├──────────────────────────────────────────────────────────────┤
│  LAYER 3: DATA SECURITY                                      │
│  • Password hashing (Argon2id)                              │
│  • Encryption at rest (AES-256)                             │
│  • Encryption in transit (TLS 1.3)                          │
│  • Signed URLs for file access                              │
│  • Secret management (Vault/Environment)                    │
├──────────────────────────────────────────────────────────────┤
│  LAYER 4: MONITORING & AUDIT                                 │
│  • Audit logs (immutable)                                   │
│  • Security event monitoring                                │
│  • Anomaly detection                                        │
│  • Alerting                                                 │
│  • Incident response plan                                   │
└──────────────────────────────────────────────────────────────┘
```

---

# 2. Authentication Security

## 2.1 Password Security

```
PASSWORD HASHING
  Algorithm: Argon2id (winner of Password Hashing Competition)
  Parameters:
    • Memory: 64 MB
    • Iterations: 3
    • Parallelism: 4
    • Hash length: 32 bytes

PASSWORD POLICY
  • Minimum length: 8 characters
  • Must contain: uppercase, lowercase, number
  • Recommended: special characters
  • Checked against breach database (HaveIBeenPwned API)
  • Cannot reuse last 5 passwords

PASSWORD STORAGE
  • Never stored in plaintext
  • Hash stored in user_credentials table
  • Hash includes salt + algorithm parameters
  • Original password NEVER logged
```

## 2.2 JWT Security

```
ACCESS TOKEN
  • Algorithm: RS256 (asymmetric)
  • Lifetime: 15 minutes
  • Contains: userId, email, role, permissions, iat, exp
  • Signed with private key (server-side only)
  • Verified with public key

REFRESH TOKEN
  • Lifetime: 30 days
  • Stored as HASH in database (user_sessions)
  • Rotation: New token on each refresh use
  • Reuse detection: If old token used → revoke all sessions
  • Bound to: device, IP range, user agent

TOKEN SECURITY
  • Private key stored in secret manager (never in code)
  • Key rotation: Every 90 days
  • Token revocation: Via session table
  • Logout: Revoke session + clear tokens
  • Logout All: Revoke all user sessions
```

## 2.3 Session Management

```
SESSION PROPERTIES
  • Bound to device fingerprint
  • IP address recorded
  • User agent recorded
  • Expiration time
  • Revocation timestamp

SECURITY CHECKS ON EACH REQUEST
  1. Token signature valid?
  2. Token not expired?
  3. Session not revoked?
  4. User status active?
  5. IP within allowed range? (configurable)
  6. Device fingerprint matches? (configurable)

SUSPICIOUS ACTIVITY
  • Login from new country → require email verification
  • Multiple failed logins → lock account (15 min)
  • Concurrent sessions from different regions → alert user
  • Token reuse after rotation → revoke all sessions immediately
```

## 2.4 OAuth Security

```
SUPPORTED PROVIDERS
  • Google (OIDC)
  • GitHub (OAuth 2.0)

SECURITY MEASURES
  • State parameter (CSRF protection)
  • PKCE (Proof Key for Code Exchange)
  • Nonce (replay protection)
  • Redirect URL validation (exact match only)
  • Token encryption at rest (access + refresh tokens)
  • Scope minimization (request only needed scopes)

TOKEN STORAGE
  • OAuth tokens encrypted with AES-256-GCM
  • Encryption key from secret manager
  • Never exposed to frontend
  • Used server-side only for API calls
```

## 2.5 Multi-Factor Authentication (Future)

```
PLANNED MFA
  • TOTP (Google Authenticator, Authy)
  • SMS OTP (for phone-verified users)
  • WebAuthn / Passkeys (future)
  • Backup codes

ENFORCEMENT
  • Required for admin accounts
  • Optional for regular users
  • Required for high-risk operations (billing changes)
```

---

# 3. Authorization

## 3.1 Role-Based Access Control (RBAC)

```
┌─────────────────┬─────────────────────────────────────────────┐
│ Role            │ Permissions                                │
├─────────────────┼─────────────────────────────────────────────┤
│ guest           │ Public pages only                          │
│ user            │ Own projects, own billing, own profile     │
│ admin           │ Admin panel, all users, system config      │
│ super_admin     │ Everything + manage admins                 │
│ api_key         │ API access (scoped)                        │
│ worker          │ Internal service (queue processing)        │
└─────────────────┴─────────────────────────────────────────────┘
```

## 3.2 Resource Ownership

```
Every resource belongs to a user:

  Project → owner_id (user)
  MediaFile → project_id → owner_id
  AiJob → user_id + project_id
  RenderJob → user_id + project_id

Authorization checks:
  1. Is user authenticated? (JWT valid)
  2. Does user own the resource? (user_id match)
  3. Does user have required role? (admin check)
  4. Is action allowed? (plan limits, feature flags)

If ANY check fails → 403 Forbidden
```

## 3.3 Plan-Based Authorization

```
Feature access gated by subscription plan:

  Free Plan:
    ✗ Cloud rendering
    ✗ Voice clone
    ✗ Dubbing
    ✗ 4K export
    ✗ Priority queue
    ✓ Basic AI pipeline
    ✓ 720p export

  Pro Plan:
    ✓ Everything in Free
    ✓ Cloud rendering
    ✓ Voice clone
    ✓ Dubbing
    ✓ 1080p export
    ✓ Priority queue
    ✗ 4K export

  Checked at: API middleware + Service layer + UI
```

---

# 4. Transport Security

## 4.1 TLS Configuration

```
TLS VERSION
  • Minimum: TLS 1.2
  • Preferred: TLS 1.3
  • Disabled: SSL 3, TLS 1.0, TLS 1.1

CIPHER SUITES (TLS 1.3)
  • TLS_AES_256_GCM_SHA384
  • TLS_CHACHA20_POLY1305_SHA256
  • TLS_AES_128_GCM_SHA256

CERTIFICATE
  • Let's Encrypt (auto-renewed) or commercial CA
  • ECDSA preferred over RSA
  • Certificate pinning for mobile/desktop (future)
```

## 4.2 Security Headers

```
HTTP RESPONSE HEADERS:

  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-XSS-Protection: 0  (disabled, use CSP instead)
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Resource-Policy: same-origin
```

---

# 5. Data Protection

## 5.1 Encryption at Rest

```
DATABASE
  • PostgreSQL: Transparent encryption at disk level (cloud provider)
  • Column-level encryption for sensitive data:
    - OAuth tokens (AES-256-GCM)
    - API keys (AES-256-GCM)
    - Payment metadata

OBJECT STORAGE
  • Server-side encryption (AES-256)
  • Encryption key managed by cloud provider (KMS)
  • Optional: Customer-managed keys (Enterprise)

BACKUPS
  • Encrypted backups
  • Encryption key separate from data
  • Offline key storage
```

## 5.2 Encryption in Transit

```
ALL connections use TLS 1.3:
  • Client ↔ API Gateway
  • API Gateway ↔ Services
  • Services ↔ Database
  • Services ↔ Redis
  • Services ↔ Object Storage
  • Services ↔ AI Providers
  • Workers ↔ Queue (Redis)
```

## 5.3 Sensitive Data Handling

```
PASSWORDS
  • Hashed with Argon2id
  • Never logged
  • Never returned in API responses
  • Not included in audit logs

TOKENS
  • JWT access token: 15 min lifetime
  • Refresh token: stored as hash (SHA-256)
  • OAuth tokens: encrypted at rest
  • API keys: stored as hash, only prefix visible

PAYMENT DATA
  • PCI DSS: Never store full card numbers
  • Tokenized via payment provider (Stripe, etc.)
  • Only last 4 digits + brand stored
  • Payment intents referenced by ID

PERSONAL DATA (GDPR/Privacy)
  • Email, name, avatar
  • User can export all their data
  • User can delete account (soft delete → purge after retention)
  • Data retention policy enforced
```

## 5.4 Secret Management

```
SECRETS NEVER IN CODE
  • API keys → Environment variables / Secret Manager
  • Database passwords → Secret Manager
  • JWT signing keys → Secret Manager
  • OAuth client secrets → Secret Manager
  • Encryption keys → KMS (Key Management Service)

SECRET ROTATION
  • Database password: Every 90 days
  • JWT keys: Every 90 days
  • API keys: On compromise or schedule
  • OAuth secrets: On compromise

ACCESS
  • Secrets accessible only by application at runtime
  • Not in version control (git)
  • Not in build artifacts
  • Not in logs
  • Not in error messages
```

---

# 6. API Security

## 6.1 Authentication

```
Every API request (except public endpoints):

  Authorization: Bearer <jwt_access_token>

Validation:
  1. Token present?
  2. Token well-formed JWT?
  3. Signature valid?
  4. Not expired?
  5. Issuer matches?
  6. Session not revoked?
  7. User active?

If any fail → 401 Unauthorized
```

## 6.2 API Key Authentication

```
For programmatic API access (Business/Enterprise):

  X-API-Key: <api_key>

Validation:
  1. Key hash matches database
  2. Key is active
  3. Key not expired
  4. Scopes allow requested operation
  5. Rate limits not exceeded

API keys stored as SHA-256 hash.
Only prefix (first 8 chars) visible in UI.
Full key shown ONCE on creation.
```

---

# 7. Input Validation

## 7.1 Validation Strategy

```
ALL input is validated, no exceptions.

LAYER 1: TYPE CHECKING (TypeScript)
  • Compile-time type safety
  • Runtime type checking with Zod

LAYER 2: SCHEMA VALIDATION (Zod)
  • Every API endpoint has Zod schema
  • Request body, query params, path params
  • Reject if validation fails → 400 Bad Request

LAYER 3: BUSINESS RULE VALIDATION
  • Domain-specific checks
  • Authorization checks
  • Plan limit checks
  • Uniqueness checks

LAYER 4: SANITIZATION
  • HTML escaping (XSS prevention)
  • SQL parameterized queries (injection prevention)
  • File type validation
  • File size limits
```

## 7.2 File Upload Security

```
UPLOAD VALIDATION
  1. File type whitelist (MIME + extension check)
     ✓ video/mp4, video/mov, video/avi, video/mkv, video/webm
     ✓ audio/mp3, audio/wav, audio/aac, audio/m4a
  2. File size limit (per plan)
  3. Magic number verification (not just extension)
  4. Malware scan (future)
  5. Chunk integrity (SHA-256 checksum)
  6. Upload rate limiting

STORAGE SECURITY
  • Files stored with random object keys (not original filename)
  • Signed URLs with expiration for access
  • No directory traversal possible
  • Bucket policies restrict public access
```

---

# 8. Rate Limiting

## 8.1 Rate Limit Strategy

```
┌────────────────────┬───────────────┬───────────────────────┐
│ Endpoint Category  │ Limit         │ Window                │
├────────────────────┼───────────────┼───────────────────────┤
│ Login              │ 10 requests   │ per minute per IP     │
│ Register           │ 5 requests    │ per minute per IP     │
│ Forgot Password    │ 3 requests    │ per hour per email    │
│ OTP/Verification   │ 3 requests    │ per hour per user     │
│ AI Endpoints       │ 30 requests   │ per minute per user   │
│ Upload Endpoints   │ 100 requests  │ per minute per user   │
│ Payment Endpoints  │ 5 requests    │ per minute per user   │
│ General API        │ 1000 requests │ per minute per user   │
│ Public API         │ 100 requests  │ per minute per IP     │
└────────────────────┴───────────────┴───────────────────────┘

IMPLEMENTATION
  • Redis-based sliding window counter
  • Keyed by: user_id (authenticated) or IP (public)
  • Headers returned: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
  • On exceed: 429 Too Many Requests + Retry-After header
  • Progressive backoff for repeat offenders
```

## 8.2 Abuse Prevention

```
SUSPICIOUS ACTIVITY DETECTION
  • Rapid successive logins from different IPs
  • Unusual request patterns
  • Credit consumption anomalies
  • Multiple account creation from same IP
  • Scraping attempts (high read volume)

AUTOMATIC ACTIONS
  • Temporary IP block (15 min → 1 hour → 24 hours)
  • Account flag for review
  • CAPTCHA challenge (future)
  • Admin notification

BOT PROTECTION
  • User agent analysis
  • Request fingerprinting
  • Honeypot endpoints
  • Behavioral analysis (future)
```

---

# 9. Audit Logging

## 9.1 What Gets Audited

```
ALL of the following actions are logged to audit_logs:

AUTHENTICATION
  • Registration (success/fail)
  • Login (success/fail)
  • Logout
  • Password change
  • Password reset request
  • OAuth login
  • Token refresh
  • Session revocation

USER MANAGEMENT
  • Profile update
  • Account deletion
  • Avatar upload
  • Settings change

PROJECT OPERATIONS
  • Create / delete / archive project
  • Duplicate project
  • Settings change

BILLING
  • Credit purchase
  • Subscription change
  • Coupon application
  • Refund issued
  • Credit adjustment (admin)

ADMIN ACTIONS
  • User suspension/activation
  • Credit adjustment
  • Config change
  • Feature flag toggle
  • Provider enable/disable
  • Prompt publish
```

## 9.2 Audit Log Structure

```
audit_log record:
  {
    id:            uuid,
    user_id:       uuid (who performed action),
    entity:        "project",        (what type of entity)
    entity_id:     uuid,             (which specific entity)
    action:        "project.create", (what happened)
    before_data:   { ... },          (state before, for updates)
    after_data:    { ... },          (state after, for updates)
    ip_address:    "203.142.82.1",   (where from)
    user_agent:    "Mozilla/5.0...", (client info)
    request_id:    "req_abc123",     (for tracing)
    created_at:    timestamp
  }

RULES:
  ✓ Append-only (never UPDATE or DELETE)
  ✓ Immutable
  ✓ Retained per policy (e.g., 7 years for billing)
  ✓ Admin CANNOT delete logs
  ✓ Accessible for compliance audits
```

---

# 10. AI Security

## 10.1 Prompt Injection Prevention

```
THREAT: User content embedded in AI prompts could contain
malicious instructions ("ignore previous instructions and...").

DEFENSES:
  • User content clearly delimited in prompt template
  • System instructions take precedence
  • Input sanitization (remove control characters)
  • Output validation (schema-constrained responses)
  • Content filtering (reject harmful output)
  • Rate limiting on AI endpoints
```

## 10.2 API Key Protection

```
AI PROVIDER KEYS
  • NEVER stored in Desktop or Frontend
  • Stored encrypted in database or secret manager
  • Used only server-side by AI Orchestrator
  • Rotated regularly
  • Access logged

ARCHITECTURE:
  Desktop/Frontend → API Gateway → AI Orchestrator → Provider
                                        ↑
                                   API Key used here
                                   (server-side only)

Desktop NEVER has direct access to AI provider.
All AI requests go through backend.
```

## 10.3 Content Security

```
USER CONTENT
  • Videos are user's property
  • Not used for model training without consent
  • Access controlled via signed URLs
  • Deleted on account deletion (after retention)

AI OUTPUT
  • Validated before storing
  • No code execution from AI responses
  • Schema-validated JSON only
  • Harmful content filtered
```

---

# 11. OWASP Top 10 Compliance

```
┌──────────────────────────────────┬──────────────────────────┐
│ OWASP Risk                       │ Mitigation               │
├──────────────────────────────────┼──────────────────────────┤
│ A01: Broken Access Control       │ RBAC + ownership checks  │
│                                  │ + server-side validation │
├──────────────────────────────────┼──────────────────────────┤
│ A02: Cryptographic Failures      │ TLS 1.3, AES-256,        │
│                                  │ Argon2id, KMS            │
├──────────────────────────────────┼──────────────────────────┤
│ A03: Injection                   │ Prisma parameterized     │
│                                  │ queries, Zod validation  │
├──────────────────────────────────┼──────────────────────────┤
│ A04: Insecure Design             │ Threat modeling,         │
│                                  │ security review process  │
├──────────────────────────────────┼──────────────────────────┤
│ A05: Security Misconfiguration   │ Hardened configs,        │
│                                  │ security headers, CSP    │
├──────────────────────────────────┼──────────────────────────┤
│ A06: Vulnerable Components       │ Dependabot, npm audit,   │
│                                  │ SBOM generation          │
├──────────────────────────────────┼──────────────────────────┤
│ A07: Auth Failures              │ JWT + rotation +         │
│                                  │ session management       │
├──────────────────────────────────┼──────────────────────────┤
│ A08: Data Integrity Failures     │ Signed webhooks,         │
│                                  │ checksum verification    │
├──────────────────────────────────┼──────────────────────────┤
│ A09: Logging Failures            │ Comprehensive audit      │
│                                  │ logging, immutable logs  │
├──────────────────────────────────┼──────────────────────────┤
│ A10: SSRF                        │ URL validation,          │
│                                  │ allowlist for outbound   │
└──────────────────────────────────┴──────────────────────────┘
```

---

# 12. Incident Response

## 12.1 Incident Severity

```
SEV-1 (Critical)
  • Data breach
  • Authentication bypass
  • Payment system compromise
  Response: Immediate, all hands

SEV-2 (High)
  • Privilege escalation
  • Rate limit bypass
  • AI cost abuse
  Response: Within 1 hour

SEV-3 (Medium)
  • Bug exposing minor data
  • Performance degradation
  Response: Within 4 hours

SEV-4 (Low)
  • Minor security improvement
  • Hardening recommendation
  Response: Next sprint
```

## 12.2 Response Process

```
1. DETECT
   • Alert from monitoring
   • User report
   • Security researcher

2. ASSESS
   • Determine severity
   • Assess scope (how many users affected)
   • Identify attack vector

3. CONTAIN
   • Block attacker IP
   • Revoke compromised tokens
   • Disable vulnerable endpoint
   • Rollback if needed

4. ERADICATE
   • Patch vulnerability
   • Rotate compromised secrets
   • Remove malicious data

5. RECOVER
   • Restore service
   • Verify fix
   • Monitor for recurrence

6. POST-MORTEM
   • Document timeline
   • Root cause analysis
   • Prevention measures
   • Process improvements
```

---

**Next Document:** [14-DEPLOYMENT.md](14-DEPLOYMENT.md)
