# 04-DATABASE-SCHEMA.md

**Version:** 1.0.0
**Status:** Draft
**Reference:** PRD v1.0, SRS v1.0, ERD v1.0
**Database:** PostgreSQL 15+
**ORM:** Prisma 5+

---

# Table of Contents

1. [Schema Conventions](#1-schema-conventions)
2. [Prisma Configuration](#2-prisma-configuration)
3. [Enums](#3-enums)
4. [Authentication Domain](#4-authentication-domain)
5. [User Domain](#5-user-domain)
6. [Project Domain](#6-project-domain)
7. [Media Domain](#7-media-domain)
8. [Transcript Domain](#8-transcript-domain)
9. [Subtitle Domain](#9-subtitle-domain)
10. [AI Domain](#10-ai-domain)
11. [Timeline Domain](#11-timeline-domain)
12. [Rendering Domain](#12-rendering-domain)
13. [Publishing Domain](#13-publishing-domain)
14. [Analytics Domain](#14-analytics-domain)
15. [Billing Domain](#15-billing-domain)
16. [Notification Domain](#16-notification-domain)
17. [System Domain](#17-system-domain)
18. [Migration Strategy](#18-migration-strategy)

---

# 1. Schema Conventions

## 1.1 Naming

| Item | Convention | Example |
|------|-----------|---------|
| Table | snake_case | `media_files` |
| Column | snake_case | `created_at` |
| Primary Key | `id` (UUID) | `id UUID` |
| Foreign Key | `<entity>_id` (UUID) | `user_id` |
| Index | `idx_<table>_<cols>` | `idx_users_email` |
| Unique | `uq_<table>_<cols>` | `uq_users_email` |
| Check | `chk_<table>_<col>` | `chk_users_status` |

## 1.2 Standard Audit Columns

Every entity includes:

```prisma
id          String    @id @default(uuid()) @db.Uuid
createdAt   DateTime  @default(now()) @map("created_at")
updatedAt   DateTime  @updatedAt @map("updated_at")
deletedAt   DateTime? @map("deleted_at")
createdBy   String?   @map("created_by") @db.Uuid
updatedBy   String?   @map("updated_by") @db.Uuid
version     Int       @default(1)
status      String    @default("active")
```

## 1.3 Principles

- **UUID Primary Keys** — all tables use UUID v4
- **Soft Delete** — `deleted_at` nullable timestamp; queries filter `WHERE deleted_at IS NULL`
- **UTC Timestamps** — all timestamps stored in UTC
- **Optimistic Locking** — `version` column incremented on update
- **Audit Trail** — all critical mutations logged to `audit_logs`
- **No Hard Delete** — except log tables with retention policy
- **Foreign Keys** — all FK use UUID

---

# 2. Prisma Configuration

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [uuid_ossp, pgcrypto]
}
```

---

# 3. Enums

```prisma
enum UserStatus {
  pending
  active
  suspended
  deleted
}

enum ProviderType {
  openrouter
  opencode
  nvidia
  openai
  anthropic
  google
  groq
  togetherai
  ollama
  azure
  bedrock
  vertex
}

enum ProviderHealthStatus {
  healthy
  warning
  degraded
  offline
}

enum JobStatus {
  created
  queued
  waiting_worker
  running
  retry
  completed
  failed
  cancelled
  archived
}

enum UploadStatus {
  created
  uploading
  paused
  completed
  verified
  failed
  cancelled
}

enum RenderStatus {
  created
  queued
  encoding
  muxing
  uploading
  completed
  failed
  cancelled
}

enum PublishStatus {
  draft
  scheduled
  publishing
  published
  failed
}

enum SubscriptionStatus {
  trial
  active
  grace_period
  expired
  cancelled
  renewed
}

enum CreditTxType {
  earned
  purchased
  bonus
  subscription
  consumed
  refunded
  expired
  adjusted
}

enum CreditTxState {
  created
  pending
  reserved
  committed
  completed
  cancelled
  refunded
  expired
}

enum ProjectStatus {
  created
  draft
  processing
  ready
  archived
  deleted
}

enum MediaType {
  video
  audio
  subtitle
  image
  thumbnail
  proxy
  waveform
}

enum NotificationChannel {
  in_app
  email
  push
  webhook
}

enum NotificationType {
  success
  warning
  error
  information
  system
}

enum Severity {
  INFO
  WARNING
  HIGH
  CRITICAL
}
```

---

# 4. Authentication Domain

## users

```prisma
model User {
  id              String    @id @default(uuid()) @db.Uuid
  email           String    @unique
  username        String    @unique
  displayName     String    @map("display_name")
  status          UserStatus @default(pending)
  emailVerifiedAt DateTime? @map("email_verified_at")
  lastLoginAt     DateTime? @map("last_login_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")
  version         Int       @default(1)

  credentials       UserCredential?
  sessions          UserSession[]
  oauthAccounts     OAuthAccount[]
  verificationTokens VerificationToken[]
  passwordResetTokens PasswordResetToken[]
  devices           Device[]
  loginHistory      LoginHistory[]
  securityEvents    SecurityEvent[]
  profile           Profile?
  preferences       Preference?
  projects          Project[]
  wallet            Wallet?
  subscription      Subscription?
  notifications     Notification[]
  auditLogs         AuditLog[]

  @@index([email])
  @@index([status])
  @@index([lastLoginAt])
  @@map("users")
}
```

## user_credentials

```prisma
model UserCredential {
  id                  String   @id @default(uuid()) @db.Uuid
  userId              String   @unique @map("user_id") @db.Uuid
  passwordHash        String   @map("password_hash")
  passwordAlgorithm   String   @default("argon2id") @map("password_algorithm")
  passwordChangedAt   DateTime @default(now()) @map("password_changed_at")
  failedLoginCount    Int      @default(0) @map("failed_login_count")
  lockedUntil         DateTime? @map("locked_until")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")
  deletedAt           DateTime? @map("deleted_at")
  version             Int      @default(1)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([lockedUntil])
  @@map("user_credentials")
}
```

## user_sessions

```prisma
model UserSession {
  id               String   @id @default(uuid()) @db.Uuid
  userId           String   @map("user_id") @db.Uuid
  refreshTokenHash String   @map("refresh_token_hash")
  deviceId         String?  @map("device_id") @db.Uuid
  ipAddress        String?  @map("ip_address")
  userAgent        String?  @map("user_agent")
  expiresAt        DateTime @map("expires_at")
  revokedAt        DateTime? @map("revoked_at")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  deletedAt        DateTime? @map("deleted_at")
  version          Int      @default(1)

  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  refreshTokens RefreshToken[]

  @@index([userId])
  @@index([expiresAt])
  @@index([revokedAt])
  @@map("user_sessions")
}
```

## oauth_accounts

```prisma
model OAuthAccount {
  id                    String   @id @default(uuid()) @db.Uuid
  userId                String   @map("user_id") @db.Uuid
  provider              String
  providerUserId        String   @map("provider_user_id")
  accessTokenEncrypted  String   @map("access_token_encrypted")
  refreshTokenEncrypted String?  @map("refresh_token_encrypted")
  expiresAt             DateTime? @map("expires_at")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")
  deletedAt             DateTime? @map("deleted_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerUserId])
  @@index([userId])
  @@map("oauth_accounts")
}
```

## verification_tokens

```prisma
model VerificationToken {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  tokenHash String   @map("token_hash")
  purpose   String   // email_verification | phone_verification
  expiresAt DateTime @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tokenHash])
  @@map("verification_tokens")
}
```

## password_reset_tokens

```prisma
model PasswordResetToken {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  tokenHash String   @map("token_hash")
  expiresAt DateTime @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([tokenHash])
  @@map("password_reset_tokens")
}
```

## refresh_tokens

```prisma
model RefreshToken {
  id               String   @id @default(uuid()) @db.Uuid
  sessionId        String   @map("session_id") @db.Uuid
  tokenHash        String   @map("token_hash")
  issuedAt         DateTime @default(now()) @map("issued_at")
  expiresAt        DateTime @map("expires_at")
  revokedAt        DateTime? @map("revoked_at")
  rotationCounter  Int      @default(0) @map("rotation_counter")

  session UserSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}
```

## devices

```prisma
model Device {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @map("user_id") @db.Uuid
  deviceName      String   @map("device_name")
  deviceType      String   @map("device_type")
  os              String?
  browser         String?
  fingerprintHash String   @map("fingerprint_hash")
  lastSeen        DateTime @default(now()) @map("last_seen")
  createdAt       DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("devices")
}
```

## login_history

```prisma
model LoginHistory {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  sessionId  String?  @map("session_id") @db.Uuid
  success    Boolean
  ipAddress  String?  @map("ip_address")
  country    String?
  city       String?
  device     String?
  browser    String?
  createdAt  DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
  @@map("login_history")
}
```

## security_events

```prisma
model SecurityEvent {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String?  @map("user_id") @db.Uuid
  eventType   String   @map("event_type")
  severity    Severity @default(INFO)
  description String
  metadata    Json?
  createdAt   DateTime @default(now()) @map("created_at")

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([severity])
  @@index([createdAt])
  @@map("security_events")
}
```

---

# 5. User Domain

## profiles

```prisma
model Profile {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @unique @map("user_id") @db.Uuid
  bio         String?  @db.Text
  website     String?
  timezone    String   @default("UTC")
  locale      String   @default("en")
  avatarUrl   String?  @map("avatar_url")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}
```

## avatars

```prisma
model Avatar {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @map("user_id") @db.Uuid
  storageObjectId String   @map("storage_object_id") @db.Uuid
  width           Int
  height          Int
  sizeBytes       BigInt   @map("size_bytes")
  isActive        Boolean  @default(false) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@map("avatars")
}
```

## preferences

```prisma
model Preference {
  id                  String   @id @default(uuid()) @db.Uuid
  userId              String   @unique @map("user_id") @db.Uuid
  defaultAspectRatio  String   @default("9:16") @map("default_aspect_ratio")
  defaultResolution   String   @default("1080p") @map("default_resolution")
  defaultFps          Int      @default(30) @map("default_fps")
  defaultCodec        String   @default("h264") @map("default_codec")
  autoGenerateSubtitle Boolean @default(true) @map("auto_generate_subtitle")
  aiProviderMode     String   @default("automatic") @map("ai_provider_mode")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("preferences")
}
```

## languages

```prisma
model Language {
  id           String   @id @default(uuid()) @db.Uuid
  userId       String   @map("user_id") @db.Uuid
  languageCode String   @map("language_code")
  proficiency  String   @default("native")
  isPrimary    Boolean  @default(false) @map("is_primary")
  createdAt    DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@map("languages")
}
```

## notification_settings

```prisma
model NotificationSetting {
  id                    String  @id @default(uuid()) @db.Uuid
  userId                String  @unique @map("user_id") @db.Uuid
  emailNotifications    Boolean @default(true) @map("email_notifications")
  inAppNotifications    Boolean @default(true) @map("in_app_notifications")
  renderComplete        Boolean @default(true) @map("render_complete")
  creditLow             Boolean @default(true) @map("credit_low")
  subscriptionExpiring  Boolean @default(true) @map("subscription_expiring")
  systemAnnouncements   Boolean @default(true) @map("system_announcements")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notification_settings")
}
```

## user_settings

```prisma
model UserSetting {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  key       String
  value     String   @db.Text
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([userId, key])
  @@map("user_settings")
}
```

## export_settings

```prisma
model ExportSetting {
  id             String   @id @default(uuid()) @db.Uuid
  userId         String   @map("user_id") @db.Uuid
  format         String   @default("mp4")
  resolution     String   @default("1080p")
  fps            Int      @default(30)
  codec          String   @default("h264")
  includeSubtitle Boolean  @default(true) @map("include_subtitle")
  watermark      Boolean  @default(false)
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@map("export_settings")
}
```

---

# 6. Project Domain

## projects

```prisma
model Project {
  id          String        @id @default(uuid()) @db.Uuid
  ownerId     String        @map("owner_id") @db.Uuid
  title       String
  description String?       @db.Text
  thumbnailUrl String?      @map("thumbnail_url")
  status      ProjectStatus @default(created)
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")
  deletedAt   DateTime?     @map("deleted_at")
  version     Int           @default(1)

  owner       User          @relation(fields: [ownerId], references: [id])
  versions    ProjectVersion[]
  settings    ProjectSetting?
  assets      ProjectAsset[]
  tags        ProjectTag[]
  labels      ProjectLabel[]
  history     ProjectHistory[]
  bookmarks   ProjectBookmark[]
  mediaFiles  MediaFile[]
  aiJobs      AiJob[]
  timelines   Timeline[]
  renderJobs  RenderJob[]
  publishJobs PublishJob[]
  transcripts Transcript[]

  @@index([ownerId])
  @@index([status])
  @@map("projects")
}
```

## project_versions

```prisma
model ProjectVersion {
  id          String   @id @default(uuid()) @db.Uuid
  projectId   String   @map("project_id") @db.Uuid
  versionNum  Int      @map("version_num")
  snapshot    Json
  changelog   String?  @db.Text
  createdBy   String?  @map("created_by") @db.Uuid
  createdAt   DateTime @default(now()) @map("created_at")

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@map("project_versions")
}
```

## project_settings

```prisma
model ProjectSetting {
  id              String   @id @default(uuid()) @db.Uuid
  projectId       String   @unique @map("project_id") @db.Uuid
  targetPlatform  String   @default("youtube") @map("target_platform")
  aspectRatio     String   @default("9:16") @map("aspect_ratio")
  clipMinDuration Int      @default(15) @map("clip_min_duration")
  clipMaxDuration Int      @default(60) @map("clip_max_duration")
  autoCaption     Boolean  @default(true) @map("auto_caption")
  autoReframe     Boolean  @default(true) @map("auto_reframe")
  customSettings  Json?
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@map("project_settings")
}
```

## project_assets

```prisma
model ProjectAsset {
  id             String   @id @default(uuid()) @db.Uuid
  projectId      String   @map("project_id") @db.Uuid
  assetType      String   @map("asset_type")
  storageObjectId String? @map("storage_object_id") @db.Uuid
  name           String
  metadata       Json?
  createdAt      DateTime @default(now()) @map("created_at")

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@map("project_assets")
}
```

## project_tags

```prisma
model ProjectTag {
  id        String   @id @default(uuid()) @db.Uuid
  projectId String   @map("project_id") @db.Uuid
  tag       String
  createdAt DateTime @default(now()) @map("created_at")

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, tag])
  @@map("project_tags")
}
```

## project_labels

```prisma
model ProjectLabel {
  id        String   @id @default(uuid()) @db.Uuid
  projectId String   @map("project_id") @db.Uuid
  label     String
  color     String   @default("#6366f1")
  createdAt DateTime @default(now()) @map("created_at")

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@map("project_labels")
}
```

## project_history

```prisma
model ProjectHistory {
  id        String   @id @default(uuid()) @db.Uuid
  projectId String   @map("project_id") @db.Uuid
  action    String
  details   Json?
  userId    String?  @map("user_id") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at")

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@map("project_history")
}
```

## project_bookmarks

```prisma
model ProjectBookmark {
  id        String   @id @default(uuid()) @db.Uuid
  projectId String   @map("project_id") @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([projectId, userId])
  @@map("project_bookmarks")
}
```

## project_recent

```prisma
model ProjectRecent {
  id        String   @id @default(uuid()) @db.Uuid
  projectId String   @map("project_id") @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  lastOpened DateTime @default(now()) @map("last_opened")

  @@unique([projectId, userId])
  @@index([userId, lastOpened])
  @@map("project_recent")
}
```

## project_templates

```prisma
model ProjectTemplate {
  id          String   @id @default(uuid()) @db.Uuid
  name        String
  description String?  @db.Text
  category    String
  configJson  Json     @map("config_json")
  thumbnailUrl String? @map("thumbnail_url")
  isPublic    Boolean  @default(false) @map("is_public")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([category])
  @@map("project_templates")
}
```

---

# 7. Media Domain

## storage_objects

```prisma
model StorageObject {
  id                 String   @id @default(uuid()) @db.Uuid
  provider           String   // supabase | r2 | s3
  bucket             String
  objectKey          String   @map("object_key")
  originalFilename   String   @map("original_filename")
  mimeType           String   @map("mime_type")
  extension          String
  sizeBytes          BigInt   @map("size_bytes")
  checksumSha256     String   @unique @map("checksum_sha256") @db.Char(64)
  storageClass       String   @default("standard") @map("storage_class")
  encryptionType     String   @default("aes256") @map("encryption_type")
  isPublic           Boolean  @default(false) @map("is_public")
  signedUrlExpiredAt DateTime? @map("signed_url_expired_at")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")
  deletedAt          DateTime? @map("deleted_at")
  version            Int      @default(1)

  mediaFiles    MediaFile[]
  mediaThumbnails MediaThumbnail[]
  mediaWaveforms MediaWaveform[]
  mediaProxies  MediaProxy[]

  @@unique([provider, bucket, objectKey])
  @@index([checksumSha256])
  @@map("storage_objects")
}
```

## uploads

```prisma
model Upload {
  id              String       @id @default(uuid()) @db.Uuid
  userId          String       @map("user_id") @db.Uuid
  projectId       String?      @map("project_id") @db.Uuid
  storageObjectId String?      @map("storage_object_id") @db.Uuid
  status          UploadStatus @default(created)
  uploadMethod    String       @default("chunk") @map("upload_method")
  totalSize       BigInt       @map("total_size")
  uploadedSize    BigInt       @default(0) @map("uploaded_size")
  totalChunks     Int          @map("total_chunks")
  uploadedChunks  Int          @default(0) @map("uploaded_chunks")
  checksumSha256  String?      @map("checksum_sha256") @db.Char(64)
  startedAt       DateTime?    @map("started_at")
  completedAt     DateTime?    @map("completed_at")
  cancelledAt     DateTime?    @map("cancelled_at")
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  chunks UploadChunk[]

  @@index([userId])
  @@index([projectId])
  @@index([status])
  @@map("uploads")
}
```

## upload_chunks

```prisma
model UploadChunk {
  id          String   @id @default(uuid()) @db.Uuid
  uploadId    String   @map("upload_id") @db.Uuid
  chunkNumber Int      @map("chunk_number")
  offsetStart BigInt   @map("offset_start")
  offsetEnd   BigInt   @map("offset_end")
  sizeBytes   BigInt   @map("size_bytes")
  checksum    String
  status      String   @default("pending")
  uploadedAt  DateTime? @map("uploaded_at")

  upload Upload @relation(fields: [uploadId], references: [id], onDelete: Cascade)

  @@unique([uploadId, chunkNumber])
  @@index([uploadId])
  @@map("upload_chunks")
}
```

## media_files

```prisma
model MediaFile {
  id              String   @id @default(uuid()) @db.Uuid
  projectId       String   @map("project_id") @db.Uuid
  storageObjectId String   @map("storage_object_id") @db.Uuid
  mediaType       MediaType @map("media_type")
  filename        String
  durationMs      BigInt   @map("duration_ms")
  status          String   @default("ready")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")

  project      Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  storageObject StorageObject @relation(fields: [storageObjectId], references: [id])
  videoMeta    MediaVideo?
  audioMeta    MediaAudio?
  generalMeta  MediaMetadata?
  thumbnails   MediaThumbnail[]
  proxies      MediaProxy[]
  waveforms    MediaWaveform[]
  transcripts  Transcript[]

  @@index([projectId])
  @@index([mediaType])
  @@map("media_files")
}
```

## media_video

```prisma
model MediaVideo {
  id           String   @id @default(uuid()) @db.Uuid
  mediaFileId  String   @unique @map("media_file_id") @db.Uuid
  width        Int
  height       Int
  fps          Float
  frameCount   BigInt   @map("frame_count")
  codec        String
  bitrate      BigInt
  pixelFormat  String?  @map("pixel_format")
  colorSpace   String?  @map("color_space")
  rotation     Int      @default(0)
  durationMs   BigInt   @map("duration_ms")
  hasAudio     Boolean  @default(true) @map("has_audio")
  createdAt    DateTime @default(now()) @map("created_at")

  mediaFile MediaFile @relation(fields: [mediaFileId], references: [id], onDelete: Cascade)

  @@index([codec])
  @@map("media_video")
}
```

## media_audio

```prisma
model MediaAudio {
  id            String   @id @default(uuid()) @db.Uuid
  mediaFileId   String   @unique @map("media_file_id") @db.Uuid
  codec         String
  sampleRate    Int      @map("sample_rate")
  channels      Int
  bitDepth      Int?     @map("bit_depth")
  bitrate       BigInt
  loudnessLufs  Float?   @map("loudness_lufs")
  durationMs    BigInt   @map("duration_ms")
  createdAt     DateTime @default(now()) @map("created_at")

  mediaFile MediaFile @relation(fields: [mediaFileId], references: [id], onDelete: Cascade)

  @@map("media_audio")
}
```

## media_metadata

```prisma
model MediaMetadata {
  id            String   @id @default(uuid()) @db.Uuid
  mediaFileId   String   @unique @map("media_file_id") @db.Uuid
  title         String?
  description   String?  @db.Text
  author        String?
  cameraModel   String?  @map("camera_model")
  software      String?
  gpsLatitude   Float?   @map("gps_latitude")
  gpsLongitude  Float?   @map("gps_longitude")
  captureDate   DateTime? @map("capture_date")
  metadataJson  Json?    @map("metadata_json")
  createdAt     DateTime @default(now()) @map("created_at")

  mediaFile MediaFile @relation(fields: [mediaFileId], references: [id], onDelete: Cascade)

  @@map("media_metadata")
}
```

## media_proxy

```prisma
model MediaProxy {
  id              String   @id @default(uuid()) @db.Uuid
  mediaFileId     String   @map("media_file_id") @db.Uuid
  proxyStorageId  String   @map("proxy_storage_id") @db.Uuid
  resolution      String
  codec           String
  sizeBytes       BigInt   @map("size_bytes")
  createdAt       DateTime @default(now()) @map("created_at")

  mediaFile     MediaFile     @relation(fields: [mediaFileId], references: [id], onDelete: Cascade)
  storageObject StorageObject @relation(fields: [proxyStorageId], references: [id])

  @@index([mediaFileId])
  @@map("media_proxy")
}
```

## media_waveform

```prisma
model MediaWaveform {
  id              String   @id @default(uuid()) @db.Uuid
  mediaFileId     String   @map("media_file_id") @db.Uuid
  storageObjectId String   @map("storage_object_id") @db.Uuid
  sampleCount     Int      @map("sample_count")
  durationMs      BigInt   @map("duration_ms")
  createdAt       DateTime @default(now()) @map("created_at")

  mediaFile     MediaFile     @relation(fields: [mediaFileId], references: [id], onDelete: Cascade)
  storageObject StorageObject @relation(fields: [storageObjectId], references: [id])

  @@index([mediaFileId])
  @@map("media_waveform")
}
```

## media_thumbnail

```prisma
model MediaThumbnail {
  id              String   @id @default(uuid()) @db.Uuid
  mediaFileId     String   @map("media_file_id") @db.Uuid
  storageObjectId String   @map("storage_object_id") @db.Uuid
  thumbnailType   String   @map("thumbnail_type") // frame | ai | manual
  width           Int
  height          Int
  generatedByAi   Boolean  @default(false) @map("generated_by_ai")
  score           Float?   @db.Decimal(5, 2)
  createdAt       DateTime @default(now()) @map("created_at")

  mediaFile     MediaFile     @relation(fields: [mediaFileId], references: [id], onDelete: Cascade)
  storageObject StorageObject @relation(fields: [storageObjectId], references: [id])

  @@index([mediaFileId])
  @@map("media_thumbnail")
}
```

---

# 8. Transcript Domain

## transcripts

```prisma
model Transcript {
  id               String   @id @default(uuid()) @db.Uuid
  projectId        String   @map("project_id") @db.Uuid
  mediaFileId      String   @map("media_file_id") @db.Uuid
  language         String
  providerId       String?  @map("provider_id") @db.Uuid
  modelId          String?  @map("model_id") @db.Uuid
  confidenceScore  Float?   @map("confidence_score") @db.Decimal(5, 4)
  processingTimeMs BigInt?  @map("processing_time_ms")
  status           String   @default("pending")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  project   Project   @relation(fields: [projectId], references: [id])
  mediaFile MediaFile @relation(fields: [mediaFileId], references: [id])
  segments  TranscriptSegment[]
  words     TranscriptWord[]
  speakers  Speaker[]
  subtitles Subtitle[]
  detectedLanguages DetectedLanguage[]

  @@index([projectId])
  @@index([language])
  @@map("transcripts")
}
```

## transcript_segments

```prisma
model TranscriptSegment {
  id            String   @id @default(uuid()) @db.Uuid
  transcriptId  String   @map("transcript_id") @db.Uuid
  segmentIndex  Int      @map("segment_index")
  startMs       BigInt   @map("start_ms")
  endMs         BigInt   @map("end_ms")
  speakerId     String?  @map("speaker_id") @db.Uuid
  text          String   @db.Text
  confidence    Float?   @db.Decimal(5, 4)
  createdAt     DateTime @default(now()) @map("created_at")

  transcript Transcript       @relation(fields: [transcriptId], references: [id], onDelete: Cascade)
  words      TranscriptWord[]

  @@index([transcriptId])
  @@index([startMs])
  @@map("transcript_segments")
}
```

## transcript_words

```prisma
model TranscriptWord {
  id          String   @id @default(uuid()) @db.Uuid
  segmentId   String   @map("segment_id") @db.Uuid
  word        String
  startMs     BigInt   @map("start_ms")
  endMs       BigInt   @map("end_ms")
  confidence  Float?   @db.Decimal(5, 4)
  position    Int
  createdAt   DateTime @default(now()) @map("created_at")

  segment TranscriptSegment @relation(fields: [segmentId], references: [id], onDelete: Cascade)

  @@index([segmentId])
  @@map("transcript_words")
}
```

## speakers

```prisma
model Speaker {
  id               String   @id @default(uuid()) @db.Uuid
  transcriptId     String   @map("transcript_id") @db.Uuid
  speakerLabel     String   @map("speaker_label")
  speakerName      String?  @map("speaker_name")
  voiceEmbeddingId String?  @map("voice_embedding_id")
  createdAt        DateTime @default(now()) @map("created_at")

  transcript Transcript @relation(fields: [transcriptId], references: [id], onDelete: Cascade)

  @@index([transcriptId])
  @@map("speakers")
}
```

## speaker_segments

```prisma
model SpeakerSegment {
  id          String   @id @default(uuid()) @db.Uuid
  speakerId   String   @map("speaker_id") @db.Uuid
  segmentId   String   @map("segment_id") @db.Uuid
  startMs     BigInt   @map("start_ms")
  endMs       BigInt   @map("end_ms")
  confidence  Float?   @db.Decimal(5, 4)
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([speakerId])
  @@map("speaker_segments")
}
```

## detected_languages

```prisma
model DetectedLanguage {
  id           String   @id @default(uuid()) @db.Uuid
  transcriptId String   @map("transcript_id") @db.Uuid
  languageCode String   @map("language_code")
  confidence   Float?   @db.Decimal(5, 4)
  createdAt    DateTime @default(now()) @map("created_at")

  transcript Transcript @relation(fields: [transcriptId], references: [id], onDelete: Cascade)

  @@index([transcriptId])
  @@map("detected_languages")
}
```

---

# 9. Subtitle Domain

## subtitles

```prisma
model Subtitle {
  id           String   @id @default(uuid()) @db.Uuid
  projectId    String   @map("project_id") @db.Uuid
  transcriptId String?  @map("transcript_id") @db.Uuid
  language     String
  styleId      String?  @map("style_id") @db.Uuid
  status       String   @default("draft")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  project    Project          @relation(fields: [projectId], references: [id])
  transcript Transcript?       @relation(fields: [transcriptId], references: [id])
  segments   SubtitleSegment[]
  translations SubtitleTranslation[]

  @@index([projectId])
  @@map("subtitles")
}
```

## subtitle_segments

```prisma
model SubtitleSegment {
  id            String   @id @default(uuid()) @db.Uuid
  subtitleId    String   @map("subtitle_id") @db.Uuid
  segmentIndex  Int      @map("segment_index")
  startMs       BigInt   @map("start_ms")
  endMs         BigInt   @map("end_ms")
  text          String   @db.Text
  animationType String?  @map("animation_type")
  positionX     Float?   @map("position_x")
  positionY     Float?   @map("position_y")
  createdAt     DateTime @default(now()) @map("created_at")

  subtitle Subtitle @relation(fields: [subtitleId], references: [id], onDelete: Cascade)

  @@index([subtitleId])
  @@index([startMs])
  @@map("subtitle_segments")
}
```

## subtitle_styles

```prisma
model SubtitleStyle {
  id              String   @id @default(uuid()) @db.Uuid
  name            String
  fontFamily      String   @map("font_family")
  fontSize        Int      @map("font_size")
  fontWeight      String   @default("bold") @map("font_weight")
  fontColor       String   @default("#FFFFFF") @map("font_color")
  backgroundColor String?  @default("#000000") @map("background_color")
  outlineColor    String?  @map("outline_color")
  shadow          Boolean  @default(true)
  animation       String   @default("pop")
  createdAt       DateTime @default(now()) @map("created_at")

  @@map("subtitle_styles")
}
```

## subtitle_templates

```prisma
model SubtitleTemplate {
  id                String   @id @default(uuid()) @db.Uuid
  templateName      String   @map("template_name")
  description       String?  @db.Text
  styleJson         Json     @map("style_json")
  previewStorageId  String?  @map("preview_storage_id") @db.Uuid
  createdAt         DateTime @default(now()) @map("created_at")

  @@map("subtitle_templates")
}
```

## subtitle_translation

```prisma
model SubtitleTranslation {
  id              String   @id @default(uuid()) @db.Uuid
  subtitleId      String   @map("subtitle_id") @db.Uuid
  sourceLanguage  String   @map("source_language")
  targetLanguage  String   @map("target_language")
  providerId      String?  @map("provider_id") @db.Uuid
  status          String   @default("pending")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  subtitle Subtitle @relation(fields: [subtitleId], references: [id], onDelete: Cascade)

  @@index([subtitleId])
  @@map("subtitle_translation")
}
```

---

# 10. AI Domain

## ai_providers

```prisma
model AiProvider {
  id                   String               @id @default(uuid()) @db.Uuid
  providerCode         String               @unique @map("provider_code")
  providerName         String               @map("provider_name")
  providerType         ProviderType         @map("provider_type")
  baseUrl              String               @map("base_url")
  status               ProviderHealthStatus @default(healthy)
  priority             Int                  @default(100)
  supportsStream       Boolean              @default(false) @map("supports_stream")
  supportsImage        Boolean              @default(false) @map("supports_image")
  supportsAudio        Boolean              @default(false) @map("supports_audio")
  supportsVideo        Boolean              @default(false) @map("supports_video")
  supportsEmbedding    Boolean              @default(false) @map("supports_embedding")
  supportsFunctionCall Boolean              @default(false) @map("supports_function_call")
  supportsJsonMode     Boolean              @default(false) @map("supports_json_mode")
  dailyRateLimit       Int?                 @map("daily_rate_limit")
  monthlyRateLimit     Int?                 @map("monthly_rate_limit")
  createdAt            DateTime             @default(now()) @map("created_at")
  updatedAt            DateTime             @updatedAt @map("updated_at")
  deletedAt            DateTime?            @map("deleted_at")
  version              Int                  @default(1)

  models        AiModel[]
  jobs          AiJob[]
  routingRules  AiRoutingRule[]
  healthChecks  AiProviderHealth[]
  cache         AiCache[]

  @@index([status])
  @@index([priority])
  @@map("ai_providers")
}
```

## ai_models

```prisma
model AiModel {
  id               String   @id @default(uuid()) @db.Uuid
  providerId       String   @map("provider_id") @db.Uuid
  modelCode        String   @map("model_code")
  modelName        String   @map("model_name")
  modelFamily      String   @map("model_family")
  modelVersion     String   @map("model_version")
  modelType        String   @map("model_type")
  contextWindow    Int?     @map("context_window")
  maxOutputTokens  Int?     @map("max_output_tokens")
  supportsStream   Boolean  @default(false) @map("supports_stream")
  supportsImage    Boolean  @default(false) @map("supports_image")
  supportsAudio    Boolean  @default(false) @map("supports_audio")
  supportsVideo    Boolean  @default(false) @map("supports_video")
  supportsJson     Boolean  @default(false) @map("supports_json")
  supportsTool     Boolean  @default(false) @map("supports_tool")
  supportsReasoning Boolean @default(false) @map("supports_reasoning")
  pricingInput     Float?   @map("pricing_input") @db.Decimal(10, 6)
  pricingOutput    Float?   @map("pricing_output") @db.Decimal(10, 6)
  creditMultiplier Float    @default(1.0) @map("credit_multiplier") @db.Decimal(5, 2)
  latencyScore     Float?   @map("latency_score") @db.Decimal(3, 2)
  qualityScore     Float?   @map("quality_score") @db.Decimal(3, 2)
  costScore        Float?   @map("cost_score") @db.Decimal(3, 2)
  status           String   @default("active")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  provider     AiProvider            @relation(fields: [providerId], references: [id])
  capabilities AiModelCapability[]
  jobs         AiJob[]

  @@unique([providerId, modelCode])
  @@index([modelFamily])
  @@index([status])
  @@map("ai_models")
}
```

## ai_model_capabilities

```prisma
model AiModelCapability {
  id           String  @id @default(uuid()) @db.Uuid
  modelId      String  @map("model_id") @db.Uuid
  capability   String  // subtitle | translation | title | thumbnail | voice_clone | ...
  supported    Boolean @default(false)
  maxDuration  Int?    @map("max_duration")
  maxFileSize  BigInt? @map("max_file_size")
  notes        String? @db.Text

  model AiModel @relation(fields: [modelId], references: [id], onDelete: Cascade)

  @@unique([modelId, capability])
  @@map("ai_model_capabilities")
}
```

## ai_workflows

```prisma
model AiWorkflow {
  id            String   @id @default(uuid()) @db.Uuid
  workflowName  String   @map("workflow_name")
  description   String?  @db.Text
  version       Int      @default(1)
  workflowJson  Json     @map("workflow_json")
  isDefault     Boolean  @default(false) @map("is_default")
  createdAt     DateTime @default(now()) @map("created_at")

  steps AiWorkflowStep[]
  jobs  AiJob[]

  @@map("ai_workflows")
}
```

## ai_workflow_steps

```prisma
model AiWorkflowStep {
  id            String  @id @default(uuid()) @db.Uuid
  workflowId    String  @map("workflow_id") @db.Uuid
  stepNumber    Int     @map("step_number")
  stepName      String  @map("step_name")
  providerId    String? @map("provider_id") @db.Uuid
  modelId       String? @map("model_id") @db.Uuid
  retryPolicy   Json?
  timeout       Int     @default(300)
  parallel      Boolean @default(false)
  inputMapping  Json?   @map("input_mapping")
  outputMapping Json?   @map("output_mapping")

  workflow AiWorkflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)

  @@index([workflowId])
  @@map("ai_workflow_steps")
}
```

## ai_jobs

```prisma
model AiJob {
  id               String    @id @default(uuid()) @db.Uuid
  projectId        String    @map("project_id") @db.Uuid
  userId           String    @map("user_id") @db.Uuid
  providerId       String?   @map("provider_id") @db.Uuid
  modelId          String?   @map("model_id") @db.Uuid
  workflowId       String?   @map("workflow_id") @db.Uuid
  jobType          String    @map("job_type")
  priority         Int       @default(5)
  status           JobStatus @default(created)
  inputStorageId   String?   @map("input_storage_id") @db.Uuid
  outputStorageId  String?   @map("output_storage_id") @db.Uuid
  estimatedCredit  Int       @default(0) @map("estimated_credit")
  actualCredit     Int       @default(0) @map("actual_credit")
  estimatedCost    Float?    @map("estimated_cost") @db.Decimal(10, 4)
  actualCost       Float?    @map("actual_cost") @db.Decimal(10, 4)
  queueName        String    @default("default") @map("queue_name")
  workerId         String?   @map("worker_id")
  startedAt        DateTime? @map("started_at")
  finishedAt       DateTime? @map("finished_at")
  retryCount       Int       @default(0) @map("retry_count")
  errorCode        String?   @map("error_code")
  errorMessage     String?   @map("error_message") @db.Text
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  project    Project     @relation(fields: [projectId], references: [id])
  provider   AiProvider? @relation(fields: [providerId], references: [id])
  model      AiModel?    @relation(fields: [modelId], references: [id])
  workflow   AiWorkflow? @relation(fields: [workflowId], references: [id])
  results    AiResult[]
  metrics    AiMetric?
  cost       AiCost?
  promptExecs AiPromptExecution[]

  @@index([projectId])
  @@index([status])
  @@index([queueName])
  @@index([jobType])
  @@index([createdAt])
  @@map("ai_jobs")
}
```

## ai_prompts

```prisma
model AiPrompt {
  id        String   @id @default(uuid()) @db.Uuid
  promptCode String  @unique @map("prompt_code")
  title     String
  category  String
  owner     String?
  status    String   @default("active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  versions AiPromptVersion[]

  @@map("ai_prompts")
}
```

## ai_prompt_versions

```prisma
model AiPromptVersion {
  id                 String   @id @default(uuid()) @db.Uuid
  promptId           String   @map("prompt_id") @db.Uuid
  version            Int
  template           String   @db.Text
  variablesJson      Json     @map("variables_json")
  expectedOutputJson Json?    @map("expected_output_json")
  temperature        Float    @default(0.7) @db.Decimal(3, 2)
  topP               Float    @default(1.0) @db.Decimal(3, 2)
  frequencyPenalty   Float    @default(0) @db.Decimal(3, 2)
  presencePenalty    Float    @default(0) @db.Decimal(3, 2)
  createdAt          DateTime @default(now()) @map("created_at")

  prompt      AiPrompt             @relation(fields: [promptId], references: [id], onDelete: Cascade)
  executions  AiPromptExecution[]

  @@unique([promptId, version])
  @@map("ai_prompt_versions")
}
```

## ai_prompt_executions

```prisma
model AiPromptExecution {
  id                  String   @id @default(uuid()) @db.Uuid
  jobId               String   @map("job_id") @db.Uuid
  promptVersionId     String   @map("prompt_version_id") @db.Uuid
  inputTokens         Int      @default(0) @map("input_tokens")
  outputTokens        Int      @default(0) @map("output_tokens")
  latencyMs           BigInt   @default(0) @map("latency_ms")
  cacheHit            Boolean  @default(false) @map("cache_hit")
  providerResponseId  String?  @map("provider_response_id")
  createdAt           DateTime @default(now()) @map("created_at")

  job          AiJob           @relation(fields: [jobId], references: [id], onDelete: Cascade)
  promptVersion AiPromptVersion @relation(fields: [promptVersionId], references: [id])

  @@index([jobId])
  @@map("ai_prompt_executions")
}
```

## ai_results

```prisma
model AiResult {
  id              String   @id @default(uuid()) @db.Uuid
  jobId           String   @unique @map("job_id") @db.Uuid
  resultType      String   @map("result_type")
  storageObjectId String?  @map("storage_object_id") @db.Uuid
  jsonResult      Json?    @map("json_result")
  confidence      Float?   @db.Decimal(5, 4)
  qualityScore    Float?   @map("quality_score") @db.Decimal(5, 4)
  humanVerified   Boolean  @default(false) @map("human_verified")
  approved        Boolean  @default(false)
  createdAt       DateTime @default(now()) @map("created_at")

  job AiJob @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@map("ai_results")
}
```

## ai_metrics

```prisma
model AiMetric {
  id              String   @id @default(uuid()) @db.Uuid
  jobId           String   @unique @map("job_id") @db.Uuid
  providerLatency BigInt?  @map("provider_latency")
  queueWaitTime   BigInt?  @map("queue_wait_time")
  workerTime      BigInt?  @map("worker_time")
  totalTime       BigInt?  @map("total_time")
  gpuUsage        Float?   @map("gpu_usage") @db.Decimal(5, 2)
  cpuUsage        Float?   @map("cpu_usage") @db.Decimal(5, 2)
  memoryUsage     BigInt?  @map("memory_usage")
  tokenInput      Int      @default(0) @map("token_input")
  tokenOutput     Int      @default(0) @map("token_output")
  cacheHit        Boolean  @default(false) @map("cache_hit")
  createdAt       DateTime @default(now()) @map("created_at")

  job AiJob @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@map("ai_metrics")
}
```

## ai_costs

```prisma
model AiCost {
  id               String   @id @default(uuid()) @db.Uuid
  jobId            String   @unique @map("job_id") @db.Uuid
  providerCost     Float    @map("provider_cost") @db.Decimal(10, 6)
  platformCost     Float    @map("platform_cost") @db.Decimal(10, 6)
  creditUsed       Int      @default(0) @map("credit_used")
  currency         String   @default("USD")
  billingReference String?  @map("billing_reference")
  createdAt        DateTime @default(now()) @map("created_at")

  job AiJob @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@map("ai_costs")
}
```

## ai_cache

```prisma
model AiCache {
  id              String   @id @default(uuid()) @db.Uuid
  cacheKey        String   @unique @map("cache_key")
  providerId      String?  @map("provider_id") @db.Uuid
  modelId         String?  @map("model_id") @db.Uuid
  hash            String
  storageObjectId String?  @map("storage_object_id") @db.Uuid
  expiresAt       DateTime @map("expires_at")
  hitCount        Int      @default(0) @map("hit_count")
  createdAt       DateTime @default(now()) @map("created_at")

  provider AiProvider? @relation(fields: [providerId], references: [id])

  @@index([expiresAt])
  @@map("ai_cache")
}
```

## ai_provider_health

```prisma
model AiProviderHealth {
  id             String   @id @default(uuid()) @db.Uuid
  providerId     String   @map("provider_id") @db.Uuid
  status         ProviderHealthStatus @default(healthy)
  responseTime   Int?     @map("response_time")
  uptime         Float?   @db.Decimal(5, 2)
  errorRate      Float?   @map("error_rate") @db.Decimal(5, 4)
  lastCheckedAt  DateTime @default(now()) @map("last_checked_at")
  createdAt      DateTime @default(now()) @map("created_at")

  provider AiProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)

  @@index([providerId])
  @@map("ai_provider_health")
}
```

## ai_routing_rules

```prisma
model AiRoutingRule {
  id                 String  @id @default(uuid()) @db.Uuid
  jobType            String  @map("job_type")
  providerId         String  @map("provider_id") @db.Uuid
  modelId            String? @map("model_id") @db.Uuid
  priority           Int     @default(100)
  maxCost            Float?  @map("max_cost") @db.Decimal(10, 4)
  maxLatency         Int?    @map("max_latency")
  fallbackProviderId String? @map("fallback_provider_id") @db.Uuid
  enabled            Boolean @default(true)
  createdAt          DateTime @default(now()) @map("created_at")

  provider AiProvider @relation(fields: [providerId], references: [id])

  @@index([jobType])
  @@map("ai_routing_rules")
}
```

## ai_experiments

```prisma
model AiExperiment {
  id               String   @id @default(uuid()) @db.Uuid
  experimentName   String   @map("experiment_name")
  controlModel     String   @map("control_model") @db.Uuid
  candidateModel   String   @map("candidate_model") @db.Uuid
  trafficPercentage Int     @default(50) @map("traffic_percentage")
  status           String   @default("draft")
  createdAt        DateTime @default(now()) @map("created_at")

  @@map("ai_experiments")
}
```

## ai_evaluations

```prisma
model AiEvaluation {
  id              String   @id @default(uuid()) @db.Uuid
  jobId           String   @map("job_id") @db.Uuid
  humanScore      Float?   @map("human_score") @db.Decimal(3, 2)
  automaticScore  Float?   @map("automatic_score") @db.Decimal(3, 2)
  feedback        String?  @db.Text
  reviewedBy      String?  @map("reviewed_by") @db.Uuid
  createdAt       DateTime @default(now()) @map("created_at")

  @@index([jobId])
  @@map("ai_evaluations")
}
```

---

# 11. Timeline Domain

## timelines

```prisma
model Timeline {
  id        String   @id @default(uuid()) @db.Uuid
  projectId String   @unique @map("project_id") @db.Uuid
  durationMs BigInt  @default(0) @map("duration_ms")
  fps       Float    @default(30)
  width     Int      @default(1080)
  height    Int      @default(1920)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  project Project        @relation(fields: [projectId], references: [id])
  tracks  TimelineTrack[]

  @@map("timelines")
}
```

## timeline_tracks

```prisma
model TimelineTrack {
  id         String   @id @default(uuid()) @db.Uuid
  timelineId String   @map("timeline_id") @db.Uuid
  trackType  String   @map("track_type") // video | audio | subtitle
  name       String
  position   Int
  isLocked   Boolean  @default(false) @map("is_locked")
  isMuted    Boolean  @default(false) @map("is_muted")
  isHidden   Boolean  @default(false) @map("is_hidden")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  timeline Timeline       @relation(fields: [timelineId], references: [id], onDelete: Cascade)
  clips    TimelineClip[]
  markers  TimelineMarker[]

  @@index([timelineId])
  @@map("timeline_tracks")
}
```

## timeline_clips

```prisma
model TimelineClip {
  id         String   @id @default(uuid()) @db.Uuid
  trackId    String   @map("track_id") @db.Uuid
  mediaFileId String? @map("media_file_id") @db.Uuid
  startMs    BigInt   @map("start_ms")
  endMs      BigInt   @map("end_ms")
  inPointMs  BigInt   @default(0) @map("in_point_ms")
  outPointMs BigInt?  @map("out_point_ms")
  position   Int
  properties Json?
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  track TimelineTrack @relation(fields: [trackId], references: [id], onDelete: Cascade)

  @@index([trackId])
  @@map("timeline_clips")
}
```

## timeline_audio

```prisma
model TimelineAudio {
  id         String   @id @default(uuid()) @db.Uuid
  trackId    String   @map("track_id") @db.Uuid
  startMs    BigInt   @map("start_ms")
  endMs      BigInt   @map("end_ms")
  volume     Float    @default(1.0) @db.Decimal(5, 4)
  fadeInMs   Int      @default(0) @map("fade_in_ms")
  fadeOutMs  Int      @default(0) @map("fade_out_ms")
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([trackId])
  @@map("timeline_audio")
}
```

## timeline_markers

```prisma
model TimelineMarker {
  id         String   @id @default(uuid()) @db.Uuid
  trackId    String   @map("track_id") @db.Uuid
  positionMs BigInt   @map("position_ms")
  label      String
  color      String   @default("#f59e0b")
  createdAt  DateTime @default(now()) @map("created_at")

  track TimelineTrack @relation(fields: [trackId], references: [id], onDelete: Cascade)

  @@map("timeline_markers")
}
```

## timeline_keyframes

```prisma
model TimelineKeyframe {
  id        String   @id @default(uuid()) @db.Uuid
  clipId    String   @map("clip_id") @db.Uuid
  property  String
  timeMs    BigInt   @map("time_ms")
  value     Float
  easing    String   @default("linear")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([clipId])
  @@map("timeline_keyframes")
}
```

## timeline_history

```prisma
model TimelineHistory {
  id        String   @id @default(uuid()) @db.Uuid
  timelineId String  @map("timeline_id") @db.Uuid
  action    String
  snapshot  Json
  userId    String?  @map("user_id") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at")

  @@index([timelineId])
  @@map("timeline_history")
}
```

---

# 12. Rendering Domain

## render_jobs

```prisma
model RenderJob {
  id            String       @id @default(uuid()) @db.Uuid
  projectId     String       @map("project_id") @db.Uuid
  userId        String       @map("user_id") @db.Uuid
  presetId      String?      @map("preset_id") @db.Uuid
  status        RenderStatus @default(created)
  renderType    String       @default("local") @map("render_type") // local | cloud
  outputFormat  String       @default("mp4") @map("output_format")
  resolution    String       @default("1080p")
  fps           Int          @default(30)
  codec         String       @default("h264")
  quality       String       @default("high")
  width         Int          @default(1080)
  height        Int          @default(1920)
  includeSubtitle Boolean    @default(true) @map("include_subtitle")
  includeWatermark Boolean   @default(false) @map("include_watermark")
  progress      Int          @default(0)
  workerId      String?      @map("worker_id")
  errorMessage  String?      @map("error_message") @db.Text
  startedAt     DateTime?    @map("started_at")
  completedAt   DateTime?    @map("completed_at")
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  project Project      @relation(fields: [projectId], references: [id])
  preset  RenderPreset? @relation(fields: [presetId], references: [id])
  exports RenderExport[]
  logs    RenderLog[]

  @@index([projectId])
  @@index([status])
  @@index([userId])
  @@map("render_jobs")
}
```

## render_queue

```prisma
model RenderQueueItem {
  id          String   @id @default(uuid()) @db.Uuid
  renderJobId String   @unique @map("render_job_id") @db.Uuid
  priority    Int      @default(5)
  workerId    String?  @map("worker_id")
  queueName   String   @default("render") @map("queue_name")
  attempts    Int      @default(0)
  scheduledAt DateTime @default(now()) @map("scheduled_at")
  startedAt   DateTime? @map("started_at")

  @@index([priority])
  @@index([queueName])
  @@map("render_queue")
}
```

## render_presets

```prisma
model RenderPreset {
  id            String   @id @default(uuid()) @db.Uuid
  name          String
  platform      String   // youtube | tiktok | instagram | custom
  aspectRatio   String   @map("aspect_ratio")
  resolution    String
  fps           Int
  codec         String
  quality       String   @default("high")
  configJson    Json     @map("config_json")
  isSystem      Boolean  @default(false) @map("is_system")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  jobs RenderJob[]

  @@map("render_presets")
}
```

## render_exports

```prisma
model RenderExport {
  id              String   @id @default(uuid()) @db.Uuid
  renderJobId     String   @map("render_job_id") @db.Uuid
  storageObjectId String   @map("storage_object_id") @db.Uuid
  filename        String
  sizeBytes       BigInt   @map("size_bytes")
  durationMs      BigInt   @map("duration_ms")
  checksumSha256  String   @map("checksum_sha256") @db.Char(64)
  downloadUrl     String?  @map("download_url")
  expiresAt       DateTime? @map("expires_at")
  createdAt       DateTime @default(now()) @map("created_at")

  renderJob RenderJob @relation(fields: [renderJobId], references: [id], onDelete: Cascade)

  @@index([renderJobId])
  @@map("render_exports")
}
```

## render_logs

```prisma
model RenderLog {
  id          String   @id @default(uuid()) @db.Uuid
  renderJobId String   @map("render_job_id") @db.Uuid
  level       String   @default("info")
  message     String   @db.Text
  metadata    Json?
  createdAt   DateTime @default(now()) @map("created_at")

  renderJob RenderJob @relation(fields: [renderJobId], references: [id], onDelete: Cascade)

  @@index([renderJobId])
  @@map("render_logs")
}
```

---

# 13. Publishing Domain

## social_accounts

```prisma
model SocialAccount {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @map("user_id") @db.Uuid
  platform        String   // youtube | tiktok | instagram | facebook
  accountId       String   @map("account_id")
  username        String
  displayName     String   @map("display_name")
  avatarUrl       String?  @map("avatar_url")
  isConnected     Boolean  @default(true) @map("is_connected")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  tokens       SocialToken[]
  publishJobs  PublishJob[]

  @@unique([userId, platform, accountId])
  @@map("social_accounts")
}
```

## publish_jobs

```prisma
model PublishJob {
  id              String        @id @default(uuid()) @db.Uuid
  projectId       String        @map("project_id") @db.Uuid
  socialAccountId String        @map("social_account_id") @db.Uuid
  renderExportId  String        @map("render_export_id") @db.Uuid
  status          PublishStatus @default(draft)
  title           String
  description     String?       @db.Text
  tags            String[]
  privacyStatus   String        @default("public") @map("privacy_status")
  scheduledAt     DateTime?     @map("scheduled_at")
  publishedAt     DateTime?     @map("published_at")
  platformPostId  String?       @map("platform_post_id")
  errorMessage    String?       @map("error_message") @db.Text
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  project        Project        @relation(fields: [projectId], references: [id])
  socialAccount  SocialAccount  @relation(fields: [socialAccountId], references: [id])

  @@index([projectId])
  @@index([status])
  @@index([scheduledAt])
  @@map("publish_jobs")
}
```

## publish_history

```prisma
model PublishHistory {
  id            String   @id @default(uuid()) @db.Uuid
  publishJobId  String   @map("publish_job_id") @db.Uuid
  action        String
  details       Json?
  createdAt     DateTime @default(now()) @map("created_at")

  @@index([publishJobId])
  @@map("publish_history")
}
```

## scheduled_posts

```prisma
model ScheduledPost {
  id            String   @id @default(uuid()) @db.Uuid
  publishJobId  String   @unique @map("publish_job_id") @db.Uuid
  scheduledAt   DateTime @map("scheduled_at")
  processedAt   DateTime? @map("processed_at")
  status        String   @default("pending")
  createdAt     DateTime @default(now()) @map("created_at")

  @@index([scheduledAt])
  @@map("scheduled_posts")
}
```

## social_tokens

```prisma
model SocialToken {
  id                      String   @id @default(uuid()) @db.Uuid
  socialAccountId         String   @unique @map("social_account_id") @db.Uuid
  accessTokenEncrypted    String   @map("access_token_encrypted")
  refreshTokenEncrypted   String?  @map("refresh_token_encrypted")
  expiresAt               DateTime? @map("expires_at")
  scope                   String?
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  socialAccount SocialAccount @relation(fields: [socialAccountId], references: [id], onDelete: Cascade)

  @@map("social_tokens")
}
```

---

# 14. Analytics Domain

## analytics_events

```prisma
model AnalyticsEvent {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String?  @map("user_id") @db.Uuid
  projectId String?  @map("project_id") @db.Uuid
  eventType String   @map("event_type")
  eventCategory String @map("event_category")
  properties Json?
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([projectId])
  @@index([eventType])
  @@index([createdAt])
  @@map("analytics_events")
}
```

## analytics_daily

```prisma
model AnalyticsDaily {
  id           String   @id @default(uuid()) @db.Uuid
  userId       String   @map("user_id") @db.Uuid
  date         DateTime @db.Date
  projectsCreated Int   @default(0) @map("projects_created")
  videosUploaded  Int   @default(0) @map("videos_uploaded")
  clipsGenerated  Int   @default(0) @map("clips_generated")
  rendersCompleted Int  @default(0) @map("renders_completed")
  creditsUsed     Int   @default(0) @map("credits_used")
  aiJobsRun       Int   @default(0) @map("ai_jobs_run")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@unique([userId, date])
  @@map("analytics_daily")
}
```

## analytics_monthly

```prisma
model AnalyticsMonthly {
  id           String   @id @default(uuid()) @db.Uuid
  userId       String   @map("user_id") @db.Uuid
  month        DateTime @db.Date
  totalProjects Int     @default(0) @map("total_projects")
  totalUploads  Int     @default(0) @map("total_uploads")
  totalClips    Int     @default(0) @map("total_clips")
  totalRenders  Int     @default(0) @map("total_renders")
  totalCredits  Int     @default(0) @map("total_credits")
  totalAiJobs   Int     @default(0) @map("total_ai_jobs")
  totalCost     Float   @default(0) @map("total_cost") @db.Decimal(10, 4)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@unique([userId, month])
  @@map("analytics_monthly")
}
```

## analytics_ai_usage

```prisma
model AnalyticsAiUsage {
  id           String   @id @default(uuid()) @db.Uuid
  userId       String   @map("user_id") @db.Uuid
  date         DateTime @db.Date
  providerId   String?  @map("provider_id") @db.Uuid
  modelId      String?  @map("model_id") @db.Uuid
  jobType      String   @map("job_type")
  jobCount     Int      @default(0) @map("job_count")
  totalCredits Int      @default(0) @map("total_credits")
  totalCost    Float    @default(0) @map("total_cost") @db.Decimal(10, 6)
  createdAt    DateTime @default(now()) @map("created_at")

  @@unique([userId, date, jobType, providerId, modelId])
  @@map("analytics_ai_usage")
}
```

## analytics_render_usage

```prisma
model AnalyticsRenderUsage {
  id            String   @id @default(uuid()) @db.Uuid
  userId        String   @map("user_id") @db.Uuid
  date          DateTime @db.Date
  renderType    String   @map("render_type")
  totalJobs     Int      @default(0) @map("total_jobs")
  totalDurationMs BigInt @default(0) @map("total_duration_ms")
  totalSizeBytes BigInt  @default(0) @map("total_size_bytes")
  avgRenderTimeMs BigInt @default(0) @map("avg_render_time_ms")
  createdAt     DateTime @default(now()) @map("created_at")

  @@unique([userId, date, renderType])
  @@map("analytics_render_usage")
}
```

---

# 15. Billing Domain

## wallet

```prisma
model Wallet {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @unique @map("user_id") @db.Uuid
  balance         Int      @default(0)
  reservedBalance Int      @default(0) @map("reserved_balance")
  totalEarned     Int      @default(0) @map("total_earned")
  totalSpent      Int      @default(0) @map("total_spent")
  currency        String   @default("USD")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  user         User               @relation(fields: [userId], references: [id])
  transactions WalletTransaction[]

  @@map("wallet")
}
```

## wallet_transactions

```prisma
model WalletTransaction {
  id              String          @id @default(uuid()) @db.Uuid
  walletId        String          @map("wallet_id") @db.Uuid
  userId          String          @map("user_id") @db.Uuid
  transactionType CreditTxType    @map("transaction_type")
  state           CreditTxState   @default(created)
  amount          Int
  balanceBefore   Int             @map("balance_before")
  balanceAfter    Int             @map("balance_after")
  description     String?         @db.Text
  reference       String?         // jobId | paymentId | subscriptionId
  referenceType   String?         @map("reference_type")
  metadata        Json?
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  wallet Wallet @relation(fields: [walletId], references: [id])

  @@index([walletId])
  @@index([userId])
  @@index([transactionType])
  @@index([createdAt])
  @@map("wallet_transactions")
}
```

## credits

```prisma
model Credit {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @map("user_id") @db.Uuid
  source          String   // subscription | purchase | bonus | referral
  amount          Int
  remaining       Int      @default(0)
  expiresAt       DateTime? @map("expires_at")
  metadata        Json?
  createdAt       DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([expiresAt])
  @@map("credits")
}
```

## subscription_plans

```prisma
model SubscriptionPlan {
  id               String   @id @default(uuid()) @db.Uuid
  planCode         String   @unique @map("plan_code")
  planName         String   @map("plan_name")
  description      String?  @db.Text
  monthlyPrice     Float    @map("monthly_price") @db.Decimal(10, 2)
  yearlyPrice      Float    @map("yearly_price") @db.Decimal(10, 2)
  creditAllocation Int      @map("credit_allocation")
  dailyLimit       Int      @map("daily_limit")
  concurrentJobs   Int      @default(1) @map("concurrent_jobs")
  priorityQueue    Boolean  @default(false) @map("priority_queue")
  cloudRendering   Boolean  @default(false) @map("cloud_rendering")
  storageQuotaGb   Int      @default(5) @map("storage_quota_gb")
  maxResolution    String   @default("1080p") @map("max_resolution")
  supportLevel     String   @default("standard") @map("support_level")
  features         Json?
  isActive         Boolean  @default(true) @map("is_active")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  subscriptions Subscription[]

  @@map("subscription_plans")
}
```

## subscriptions

```prisma
model Subscription {
  id              String             @id @default(uuid()) @db.Uuid
  userId          String             @unique @map("user_id") @db.Uuid
  planId          String             @map("plan_id") @db.Uuid
  status          SubscriptionStatus @default(trial)
  billingCycle    String             @default("monthly") @map("billing_cycle")
  startDate       DateTime           @default(now()) @map("start_date")
  endDate         DateTime?          @map("end_date")
  trialEndsAt     DateTime?          @map("trial_ends_at")
  cancelledAt     DateTime?          @map("cancelled_at")
  autoRenew       Boolean            @default(true) @map("auto_renew")
  createdAt       DateTime           @default(now()) @map("created_at")
  updatedAt       DateTime           @updatedAt @map("updated_at")

  user      User             @relation(fields: [userId], references: [id])
  plan      SubscriptionPlan @relation(fields: [planId], references: [id])
  payments  Payment[]

  @@map("subscriptions")
}
```

## payments

```prisma
model Payment {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @map("user_id") @db.Uuid
  subscriptionId  String?  @map("subscription_id") @db.Uuid
  amount          Float    @db.Decimal(10, 2)
  currency        String   @default("USD")
  provider        String   // stripe | midtrans | xendit
  providerPaymentId String? @map("provider_payment_id")
  status          String   @default("pending")
  method          String?
  description     String?  @db.Text
  metadata        Json?
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  user         User          @relation(fields: [userId], references: [id])
  subscription Subscription? @relation(fields: [subscriptionId], references: [id])
  history      PaymentHistory[]
  invoice      Invoice?

  @@index([userId])
  @@index([status])
  @@map("payments")
}
```

## payment_history

```prisma
model PaymentHistory {
  id         String   @id @default(uuid()) @db.Uuid
  paymentId  String   @map("payment_id") @db.Uuid
  status     String
  message    String?  @db.Text
  metadata   Json?
  createdAt  DateTime @default(now()) @map("created_at")

  payment Payment @relation(fields: [paymentId], references: [id], onDelete: Cascade)

  @@index([paymentId])
  @@map("payment_history")
}
```

## invoices

```prisma
model Invoice {
  id           String   @id @default(uuid()) @db.Uuid
  paymentId    String   @unique @map("payment_id") @db.Uuid
  invoiceNumber String  @unique @map("invoice_number")
  userId       String   @map("user_id") @db.Uuid
  amount       Float    @db.Decimal(10, 2)
  currency     String   @default("USD")
  taxAmount    Float    @default(0) @map("tax_amount") @db.Decimal(10, 2)
  totalAmount  Float    @map("total_amount") @db.Decimal(10, 2)
  issueDate    DateTime @default(now()) @map("issue_date")
  dueDate      DateTime? @map("due_date")
  paidAt       DateTime? @map("paid_at")
  status       String   @default("issued")
  pdfUrl       String?  @map("pdf_url")
  createdAt    DateTime @default(now()) @map("created_at")

  payment Payment @relation(fields: [paymentId], references: [id])

  @@map("invoices")
}
```

## coupons

```prisma
model Coupon {
  id           String   @id @default(uuid()) @db.Uuid
  code         String   @unique
  description  String?  @db.Text
  discountType String   @map("discount_type") // percentage | fixed
  discountValue Float   @map("discount_value") @db.Decimal(10, 2)
  maxUses      Int?     @map("max_uses")
  usedCount    Int      @default(0) @map("used_count")
  validFrom    DateTime @map("valid_from")
  validUntil   DateTime? @map("valid_until")
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")

  usage CouponUsage[]

  @@map("coupons")
}
```

## coupon_usage

```prisma
model CouponUsage {
  id        String   @id @default(uuid()) @db.Uuid
  couponId  String   @map("coupon_id") @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  paymentId String?  @map("payment_id") @db.Uuid
  discountAmount Float @map("discount_amount") @db.Decimal(10, 2)
  createdAt DateTime @default(now()) @map("created_at")

  coupon Coupon @relation(fields: [couponId], references: [id])

  @@index([couponId])
  @@index([userId])
  @@map("coupon_usage")
}
```

---

# 16. Notification Domain

## notifications

```prisma
model Notification {
  id          String             @id @default(uuid()) @db.Uuid
  userId      String             @map("user_id") @db.Uuid
  channel     NotificationChannel @default(in_app)
  type        NotificationType   @default(information)
  title       String
  message     String             @db.Text
  data        Json?
  readAt      DateTime?          @map("read_at")
  archivedAt  DateTime?          @map("archived_at")
  createdAt   DateTime           @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([readAt])
  @@index([createdAt])
  @@map("notifications")
}
```

## notification_queue

```prisma
model NotificationQueueItem {
  id              String   @id @default(uuid()) @db.Uuid
  notificationId  String?  @map("notification_id") @db.Uuid
  channel         NotificationChannel
  recipient       String
  payload         Json
  status          String   @default("pending")
  attempts        Int      @default(0)
  scheduledAt     DateTime @default(now()) @map("scheduled_at")
  processedAt     DateTime? @map("processed_at")
  errorMessage    String?  @map("error_message") @db.Text
  createdAt       DateTime @default(now()) @map("created_at")

  @@index([status])
  @@index([scheduledAt])
  @@map("notification_queue")
}
```

## notification_templates

```prisma
model NotificationTemplate {
  id         String   @id @default(uuid()) @db.Uuid
  code       String   @unique
  channel    NotificationChannel
  subject    String
  body       String   @db.Text
  variables  Json
  isActive   Boolean  @default(true) @map("is_active")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("notification_templates")
}
```

---

# 17. System Domain

## audit_logs

```prisma
model AuditLog {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String?  @map("user_id") @db.Uuid
  entity     String
  entityId   String   @map("entity_id") @db.Uuid
  action     String
  beforeData Json?    @map("before_data")
  afterData  Json?    @map("after_data")
  ipAddress  String?  @map("ip_address")
  userAgent  String?  @map("user_agent")
  requestId  String?  @map("request_id")
  createdAt  DateTime @default(now()) @map("created_at")

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([entity, entityId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}
```

## system_logs

```prisma
model SystemLog {
  id         String   @id @default(uuid()) @db.Uuid
  level      String   @default("info")
  service    String
  module     String?
  message    String   @db.Text
  metadata   Json?
  requestId  String?  @map("request_id")
  correlationId String? @map("correlation_id")
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([level])
  @@index([service])
  @@index([createdAt])
  @@map("system_logs")
}
```

## worker_logs

```prisma
model WorkerLog {
  id         String   @id @default(uuid()) @db.Uuid
  workerId   String   @map("worker_id")
  workerType String   @map("worker_type")
  level      String   @default("info")
  message    String   @db.Text
  metadata   Json?
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([workerId])
  @@index([workerType])
  @@index([createdAt])
  @@map("worker_logs")
}
```

## queue_logs

```prisma
model QueueLog {
  id         String   @id @default(uuid()) @db.Uuid
  queueName  String   @map("queue_name")
  jobId      String?  @map("job_id")
  event      String
  payload    Json?
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([queueName])
  @@index([jobId])
  @@index([createdAt])
  @@map("queue_logs")
}
```

## feature_flags

```prisma
model FeatureFlag {
  id          String   @id @default(uuid()) @db.Uuid
  key         String   @unique
  name        String
  description String?  @db.Text
  isEnabled   Boolean  @default(false) @map("is_enabled")
  strategy    String   @default("boolean") // boolean | percentage | user_list
  config      Json?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("feature_flags")
}
```

## app_config

```prisma
model AppConfig {
  id        String   @id @default(uuid()) @db.Uuid
  key       String   @unique
  category  String
  value     String   @db.Text
  type      String   @default("string")
  isPublic  Boolean  @default(false) @map("is_public")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([category])
  @@map("app_config")
}
```

## api_keys

```prisma
model ApiKey {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String?  @map("user_id") @db.Uuid
  name       String
  keyHash    String   @unique @map("key_hash")
  keyPrefix  String   @map("key_prefix")
  scopes     String[]
  lastUsedAt DateTime? @map("last_used_at")
  expiresAt  DateTime? @map("expires_at")
  isActive   Boolean  @default(true) @map("is_active")
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([keyHash])
  @@map("api_keys")
}
```

## system_health

```prisma
model SystemHealth {
  id           String   @id @default(uuid()) @db.Uuid
  component    String
  status       String   @default("healthy")
  responseTime Int?     @map("response_time")
  details      Json?
  checkedAt    DateTime @default(now()) @map("checked_at")

  @@index([component])
  @@index([checkedAt])
  @@map("system_health")
}
```

---

# 18. Migration Strategy

## 18.1 Prisma Migrations

```bash
# Create migration
npx prisma migrate dev --name init

# Apply to production
npx prisma migrate deploy

# Generate client
npx prisma generate

# Seed database
npx prisma db seed
```

## 18.2 Migration Rules

1. **Never drop columns** in production — deprecate first
2. **Always backup** before migration
3. **Test migrations** on staging
4. **Use transactions** for data migrations
5. **Zero downtime** — expand → migrate → contract pattern

## 18.3 Indexing Strategy

| Table | Index Purpose |
|-------|--------------|
| users | email lookup, status filter |
| projects | owner_id + status compound |
| ai_jobs | status + queue_name + priority compound |
| uploads | user_id + status |
| wallet_transactions | wallet_id + created_at compound |
| audit_logs | entity + entity_id, created_at |
| analytics_events | user_id + created_at, event_type |

## 18.4 Seed Data

Initial seed includes:
- Default subscription plans (Free, Starter, Pro, Business, Enterprise)
- Default render presets (YouTube, TikTok, Instagram, Custom)
- Default AI providers (OpenRouter, NVIDIA, OpenCode)
- Default subtitle styles and templates
- Default notification templates
- System feature flags
- Admin user account

---

**Next Document:** [05-SYSTEM-ARCHITECTURE.md](05-SYSTEM-ARCHITECTURE.md)
