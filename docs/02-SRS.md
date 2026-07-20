# Software Requirements Specification (SRS)

Version: 1.0.0

Project

AI Video Clipper Platform

Status

Draft

Reference

PRD v1.0

---

# Revision History

| Version | Date | Author | Description |
|----------|------|---------|-------------|
| 1.0.0 | 2026 | Product Team | Initial Draft |

---

# Table of Contents

1. Introduction
2. Overall Description
3. Product Perspective
4. Product Functions
5. User Characteristics
6. Operating Environment
7. Design Constraints
8. Assumptions
9. Functional Requirements
10. External Interface Requirements
11. Non Functional Requirements
12. Data Requirements
13. State Models
14. Sequence Models
15. Error Handling
16. Acceptance Criteria
17. Traceability Matrix

---

# 1 Introduction

## 1.1 Purpose

Dokumen ini menjelaskan seluruh spesifikasi teknis AI Video Clipper Platform.

Dokumen digunakan sebagai referensi oleh:

- Product Manager
- Backend Engineer
- Frontend Engineer
- Desktop Engineer
- AI Engineer
- DevOps
- QA Engineer
- Security Engineer

Semua implementasi harus mengacu pada dokumen ini.

---

## 1.2 Scope

Produk memungkinkan pengguna:

- Upload video
- AI Processing
- Subtitle
- Translation
- Viral Detection
- Timeline Editing
-Render

---

**Next Document:** [03-ERD.md](03-ERD.md)

ing
- Publishing
- Analytics

Platform:

Desktop Windows

Web SaaS

---

## 1.3 Definitions

AI Job

Unit pekerjaan AI.

Project

Sekumpulan asset video.

Clip

Potongan video hasil AI.

Transcript

Hasil Speech Recognition.

Subtitle

Caption hasil transcript.

Provider

Penyedia AI.

Worker

Service pemrosesan asynchronous.

---

# 2 Overall Description

## 2.1 Product Perspective

Produk terdiri dari beberapa subsystem.

Desktop Client

↓

API Gateway

↓

Business Services

↓

AI Orchestrator

↓

Queue

↓

Worker

↓

Storage

↓

Database

↓

Analytics

---

## 2.2 Major Components

Desktop Application

Backend API

AI Gateway

Queue

Worker

Database

Storage

Notification

Billing

Analytics

Authentication

---

## 2.3 User Classes

Guest

Belum login.

Registered User

Menggunakan Free Plan.

Subscriber

Menggunakan Subscription.

Admin

Mengelola sistem.

System Worker

Service internal.

---

# 3 Operating Environment

Desktop

Windows 10

Windows 11

Minimum RAM

8 GB

Recommended

16 GB

CPU

4 Core

Recommended

8 Core

GPU

Optional

Internet

Required

Browser

Chrome

Edge

Firefox

Safari

---

# 4 Design Constraints

Programming Language

TypeScript

Python

Database

PostgreSQL

Queue

Redis + BullMQ

Storage

Supabase Storage

Cloudflare R2

Authentication

JWT

OAuth

Phone Verification

Architecture

Clean Architecture

Repository Pattern

Dependency Injection

---

# 5 Assumptions

Pengguna memiliki koneksi internet.

AI Provider tersedia.

Supabase berjalan normal.

Redis tersedia.

Storage tersedia.

# 6 Product Functions
## Authentication

- Register
- Login
- Logout
- Refresh Token
- OAuth
- Password Reset

---

## Project

- Create
- Update
- Delete
- Archive
- Restore

---

## Upload

- Video
- Audio
- Chunk
- Resume

---

## AI Processing

- Subtitle
- Translation
- Viral Detection
- Speaker Detection
- Face Tracking
- Hook Detection
- Thumbnail

---

## Timeline

- Split
- Trim
- Merge
- Subtitle

---

##Render

---

**Next Document:** [03-ERD.md](03-ERD.md)

ing

- LocalRender

---

**Next Document:** [03-ERD.md](03-ERD.md)


- CloudRender

---

**Next Document:** [03-ERD.md](03-ERD.md)


- BatchRender

---

**Next Document:** [03-ERD.md](03-ERD.md)



---

## Publishing

- YouTube
- TikTok

---

## Billing

- Credit
- Subscription
- Coupon

---

## Analytics

- Usage
-Render

---

**Next Document:** [03-ERD.md](03-ERD.md)

ing
- AI Cost

# 7 User Characteristics
Content Creator

Skill

Basic

Needs

Fast workflow

---

YouTuber

Skill

Intermediate

Needs

Batch clipping

---

TikTok Creator

Needs

Daily upload

---

Administrator

Needs

User management

Credit management

AI Provider management

---

# 8 System Context Diagram
                Desktop

                   │

                   ▼

            REST API Gateway

                   │

────────────────────────────────

 Authentication

 Billing

 Projects

 AI

 Upload

Render

---

**Next Document:** [03-ERD.md](03-ERD.md)

ing

 Analytics

────────────────────────────────

                   │

             AI Orchestrator

                   │

         Queue (BullMQ)

                   │

        Worker Cluster

                   │

       AI Providers


# 9 Functional Requirements Specification

---

# 9.1 Authentication Module

---

## SRS-AUTH-001

Requirement Name

User Registration

Reference

PRD

FR-AUTH-001

Priority

Critical

Actors

Guest

Goal

Membuat akun baru.

Trigger

User menekan tombol Register.

Preconditions

- Email belum digunakan.
- Password memenuhi policy.
- Sistem tersedia.

Main Flow

1. User membuka halaman Register.

2. Mengisi:

- Name
- Email
- Password
- Confirm Password

3. Sistem melakukan validasi.

4. Password di-hash menggunakan Argon2id.

5. User dibuat.

6. Verification Token dibuat.

7. Email Verification dikirim.

8. Audit Log dibuat.

9. Response sukses.

Alternative Flow

AF-1

Email sudah ada

↓

Return

409 Conflict

AF-2

Password lemah

↓

Return

400 Bad Request

Exception

Database Error

↓

Rollback Transaction

↓

Log Error

↓

Return

500

Business Rules

BR-001

Email harus unik.

BR-002

Password minimal 8 karakter.

BR-003

Password harus mengandung:

Huruf besar

Huruf kecil

Angka

BR-004

Verification Token berlaku 24 jam.

Validation Rules

Email

RFC 5322

Password

Regex

Display Name

maksimum 100 karakter.

Related Tables

users

user_credentials

verification_tokens

audit_logs

Related API

POST

/auth/register

Success Response

201 Created

Acceptance Criteria

✓ User berhasil dibuat.

✓ Email Verification terkirim.

✓ Audit Log dibuat.

---

## SRS-AUTH-002

Requirement

Login

Reference

FR-AUTH-002

Actors

Registered User

Main Flow

1 Login.

2 Validasi.

3 Generate JWT.

4 Generate Refresh Token.

5 Simpan Session.

6 Return Success.

Business Rules

Session Timeout

30 hari.

Access Token

15 menit.

Acceptance

JWT valid.

Refresh Token valid.

---

## SRS-AUTH-003

Google OAuth

---

## SRS-AUTH-004

GitHub OAuth

---

## SRS-AUTH-005

Forgot Password

---

## SRS-AUTH-006

Reset Password

---

## SRS-AUTH-007

Refresh Token

---

## SRS-AUTH-008

Logout

---

## SRS-AUTH-009

Logout All Devices

---

# 9.2 User Module

---

## SRS-USER-001

Update Profile

Reference

FR-USER-001

Actors

Registered User

Flow

Open Profile

↓

Update

↓

Save

↓

Audit

↓

Success

Validation

Nama

100 karakter.

Avatar

10 MB.

Related API

PATCH

/users/profile

---

## SRS-USER-002

Upload Avatar

---

## SRS-USER-003

Delete Account

Soft Delete.

---

# 9.3 Project Module

---

## SRS-PROJECT-001

Create Project

Reference

FR-PROJECT-001

Actors

Registered User

Input

Project Name

Description

Output

Project dibuat.

Business Rules

Nama wajib.

Maksimum

255 karakter.

Related Tables

projects

project_settings

audit_logs

---

## SRS-PROJECT-002

Rename Project

---

## SRS-PROJECT-003

Archive

---

## SRS-PROJECT-004

Restore

---

## SRS-PROJECT-005

Delete

Soft Delete

---

## SRS-PROJECT-006

Auto Save

Interval

30 detik.

---

# 9.4 Upload Module

---

## SRS-UPLOAD-001

Video Upload

Reference

FR-UPLOAD-001

Actors

Registered User

Supported

MP4

MOV

AVI

MKV

WEBM

Max File Size

Ditentukan oleh paket langganan dan kebijakan sistem.

Chunk Size

Konfigurabel (misalnya 5–20 MB).

Main Flow

Create Upload Session

↓

Upload Chunk

↓

Validate

↓

Merge

↓

Checksum

↓

Store

↓

Complete

Validation

SHA256

Related Tables

uploads

media_files

storage_objects

---

## SRS-UPLOAD-002

Resume Upload

---

## SRS-UPLOAD-003

Cancel Upload

---

## SRS-UPLOAD-004

Folder Upload

---

# 9.5 AI Module

---

## SRS-AI-001

Speech Recognition

Reference

FR-AI-001

Actors

Registered User

Worker

Speech Worker

Input

Video

Output

Transcript

Business Rules

Language Detection

Auto

Retry

3

Fallback

Enabled

Acceptance

Transcript berhasil dibuat.

---

## SRS-AI-002

Subtitle Generation

Input

Transcript

Output

Subtitle

Format

SRT

VTT

JSON

---

## SRS-AI-003

Subtitle Translation

---

## SRS-AI-004

Scene Detection

---

## SRS-AI-005

Speaker Detection

---

## SRS-AI-006

Face Tracking

---

## SRS-AI-007

Emotion Detection

---

## SRS-AI-008

Silence Detection

---

## SRS-AI-009

Hook Detection

---

## SRS-AI-010

Viral Detection

Output

Score

0-100

Confidence

0-1

Reason

List

---

## SRS-AI-011

Clip Ranking

Sort

Descending

Acceptance

Ranking konsisten untuk input yang sama apabila model dan parameter identik.

---

## SRS-AI-012

Thumbnail Generation

---

## SRS-AI-013

Title Generation

---

## SRS-AI-014

Description Generation

---

## SRS-AI-015

Hashtag Generation

---

## SRS-AI-016

Voice Clone

---

## SRS-AI-017

Voice Dubbing

---

## SRS-AI-018

Auto Reframe

Supported

9:16

16:9

1:1

---

# 9.6 Timeline Module

---

SRS-TL-001

Split

---

SRS-TL-002

Trim

---

SRS-TL-003

Merge

---

SRS-TL-004

Subtitle Track

---

SRS-TL-005

Undo

---

SRS-TL-006

Redo

---

SRS-TL-007

Snap

---

SRS-TL-008

Marker

---

SRS-TL-009

Ripple Delete

---

SRS-TL-010

Keyboard Shortcut


---


---

# 10. External Interface Requirements

---

# 10.1 Overview

Platform terdiri dari beberapa interface utama.

Desktop
↓

REST API

↓

WebSocket

↓

AI Gateway

↓

Worker

↓

Storage

↓

Database

↓

Analytics

---

# 10.2 User Interface (UI)

## Desktop

Framework

Electron

React

TypeScript

Desktop harus menyediakan halaman berikut.

Authentication

Dashboard

Projects

Timeline Editor

Subtitle Editor

Rendering

Publishing

Billing

Profile

Settings

Analytics

Notification Center

---

## Web SaaS

Framework

Next.js

React

TypeScript

Halaman

Landing

Pricing

Dashboard

Projects

Billing

Analytics

Profile

Documentation

---

# 10.3 REST API Interface

Semua komunikasi dilakukan menggunakan HTTPS.

Base URL

/api/v1

Response Format

JSON

Content Type

application/json

Authentication

Bearer JWT

---

## HTTP Status

200 OK

201 Created

202 Accepted

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

429 Too Many Requests

500 Internal Server Error

503 Service Unavailable

---

# 10.4 Authentication Interface

Authentication menggunakan

JWT

Refresh Token

OAuth

Semua endpoint privat wajib menggunakan Authorization Header.

Authorization

Bearer <JWT>

---

# 10.5 WebSocket Interface

Digunakan untuk:

Rendering Progress

Upload Progress

AI Progress

Queue Status

Notification

Event

connection

disconnect

job.created

job.started

job.progress

job.completed

job.failed

notification.created

---

# 10.6 Electron IPC Interface

Desktop dipisahkan menjadi:

Main Process

Renderer Process

IPC Channel

system.info

filesystem.open

filesystem.save

filesystem.export

ffmpeg.start

ffmpeg.cancel

render.start

render.stop

notification.show

settings.load

settings.save

---

# 10.7 FFmpeg Interface

Semua rendering menggunakan FFmpeg.

Supported Codec

H264

H265

AV1

AAC

Opus

Container

MP4

MOV

WEBM

MKV

Operations

Trim

Merge

Split

Crop

Scale

Rotate

Overlay

Watermark

Burn Subtitle

Audio Mix

Thumbnail

Metadata

---

# 10.8 AI Provider Interface

Semua AI Provider harus mengimplementasikan interface yang sama.

Methods

Health Check

Generate Text

Generate Subtitle

Translate

Scene Detection

Speaker Detection

Face Detection

Emotion Detection

Hook Detection

Viral Detection

Thumbnail

Voice Clone

Dubbing

Estimate Cost

---

# 10.9 Storage Interface

Provider

Supabase Storage

Future

Cloudflare R2

AWS S3

Supported Operations

Upload

Download

Delete

Move

Copy

Generate Signed URL

Validate Checksum

---

# 10.10 Database Interface

Database

PostgreSQL

ORM

Prisma

Semua transaksi penting harus menggunakan database transaction.

---

# 10.11 Queue Interface

Queue

BullMQ

Redis

Queues

Upload Queue

Subtitle Queue

Translation Queue

Rendering Queue

Thumbnail Queue

Publishing Queue

Notification Queue

Cleanup Queue

Dead Letter Queue

---

# 10.12 Logging Interface

Semua service harus menghasilkan structured log.

Log Level

DEBUG

INFO

WARN

ERROR

FATAL

Log Format

JSON

Setiap log minimal memiliki:

timestamp

service

module

userId (jika tersedia)

requestId

correlationId

level

message

metadata

---

# 10.13 Notification Interface

Channel

In App

Email

Future

Push Notification

Webhook

Notification Type

Success

Warning

Error

Information

System

---

# 10.14 Payment Interface

Payment Provider

Abstract Payment Gateway

MVP

Stripe (primary)

Midtrans

Xendit

Future

PayPal

Webhook

Required

---

# 10.15 OAuth Interface

Supported

Google

GitHub

Future

Microsoft

Apple

Discord

---

# 10.16 File Interface

Supported Video

MP4

MOV

AVI

MKV

WEBM

Supported Audio

MP3

AAC

M4A

WAV

Supported Subtitle

SRT

VTT

JSON

---

# 10.17 Security Interface

HTTPS

TLS 1.3

JWT

Argon2id

Signed URL

Rate Limiter

Audit Log

Input Validation

CSRF Protection (Web)

CSP Header

HSTS

---

# 10.18 Monitoring Interface

Metrics

CPU

RAM

GPU

Queue

Latency

Provider Health

Storage

Database

API

Rendering

AI Cost
---

## 11.1 Performance

API

95%

<500ms

Dashboard

<2 detik

Upload

Resume Supported

Timeline

60 FPS

Preview

30 FPS

GPURender

---

**Next Document:** [03-ERD.md](03-ERD.md)

ing

Supported

---

## 11.2 Scalability

Backend

Stateless

Worker

Horizontal Scaling

Queue

Unlimited Worker

Storage

Scalable

AI Provider

Dynamic

---

## 11.3 Reliability

Retry

3 kali

Fallback

Enabled

Autosave

30 detik

Recovery

Enabled

---

## 11.4 Availability

API

99.9%

Storage

99.9%

Database

99.9%

---

## 11.5 Maintainability

Clean Architecture

Repository Pattern

Dependency Injection

Modular Design

---

## 11.6 Security

OWASP

Top 10

Encryption

AES256

Password

Argon2id

Audit

Enabled

Secrets

Encrypted

---

## 11.7 Accessibility

Dark Mode

Keyboard Shortcut

High Contrast

---

## 11.8 Internationalization

Indonesia

English

Timezone

Per User

---

# 12 Data Requirements
---

Semua entity harus memiliki:

id

created_at

updated_at

deleted_at

created_by

updated_by

version

status

---

Audit wajib.

Soft Delete wajib.

Optimistic Locking direkomendasikan untuk operasi edit proyek.

Naming Convention

snake_case

UUID

Primary Key

BIGINT atau UUID (dipilih secara konsisten pada fase desain database)

Foreign Key

fk_<table>_<reference>

Index

idx_

Unique

uq_

Check

chk_

---

# 13. State Models

State Model menjelaskan perubahan status setiap entity utama di dalam sistem.

Semua state harus bersifat deterministic.

Semua perpindahan state harus menghasilkan Audit Log.

---

# 13.1 User Account State

```

Registered
↓

Email Verification Pending

↓

Verified

↓

Active

↓

Suspended

↓

Deleted (Soft Delete)

↓

Purged (Retention Policy)

```

### State Description

Registered

- User berhasil dibuat.

Verification Pending

- Menunggu email verification.

Verified

- Email telah diverifikasi.

Active

- Dapat menggunakan seluruh fitur sesuai subscription.

Suspended

- Akun dibatasi oleh admin atau sistem.

Deleted

- Soft delete.

Purged

- Data dihapus permanen sesuai retention policy.

---

# 13.2 Authentication Session State

```

Created

↓

Authenticated

↓

Refreshed

↓

Expired

↓

Revoked

```

Business Rules

Session Expired

↓

User Login Again

Refresh Token

↓

Rotation

Revoked

↓

Logout All Devices

---

# 13.3 Project State

```

Created

↓

Draft

↓

Processing

↓

Ready

↓

Archived

↓

Deleted

```

Description

Created

Project dibuat.

Draft

Belum diproses AI.

Processing

Sedang diproses.

Ready

Semua AI selesai.

Archived

Disembunyikan.

Deleted

Soft Delete.

---

# 13.4 Upload State

```

Created

↓

Waiting

↓

Uploading

↓

Paused

↓

Resumed

↓

Completed

↓

Verified

↓

Failed

↓

Cancelled

```

Rules

Paused

↓

Resume

Retry

↓

Max 3

Checksum

↓

Verified

---

# 13.5 AI Job State

```

Created

↓

Queued

↓

Waiting Worker

↓

Running

↓

Retry

↓

Completed

↓

Failed

↓

Cancelled

↓

Archived

```

Retry Policy

Maximum

3

Fallback Provider

Enabled

Timeout

Configurable per AI task.

---

# 13.6Render

---

**Next Document:** [03-ERD.md](03-ERD.md)

ing State

```

Created

↓

Queued

↓

Encoding

↓

Muxing

↓

Uploading

↓

Completed

↓

Failed

```

Business Rules

GPU gagal

↓

CPU Fallback

Cloud gagal

↓

Retry Queue

---

# 13.7 Publishing State

```

Draft

↓

Scheduled

↓

Publishing

↓

Published

↓

Failed

↓

Retry

```

---

# 13.8 Credit Transaction State

```

Created

↓

Pending

↓

Reserved (optional)

↓

Committed

↓

Completed

↓

Refunded

↓

Expired

```

Rules

Semua transaksi immutable.

---

# 13.9 Subscription State

```

Trial

↓

Active

↓

Grace Period

↓

Expired

↓

Cancelled

↓

Renewed

```

---

# 13.10 Notification State

```

Created

↓

Queued

↓

Delivered

↓

Read

↓

Archived

```

---

# 13.11 AI Provider State

```

Healthy

↓

Warning

↓

Degraded

↓

Offline

↓

Recovered

```

Health Check

setiap 60 detik (konfigurabel).

---

# 13.12 Worker State

```

Idle

↓

Assigned

↓

Processing

↓

Completed

↓

Idle

```

Jika Error

↓

Retry

↓

Dead Letter Queue

---

# 14.1 User Registration

Guest

↓

Register

↓

Validation

↓

Hash Password

↓

Create User

↓

Create Verification Token

↓

Send Email

↓

Audit Log

↓

Success

---

# 14.2 Login

User

↓

Login

↓

Validate Password

↓

Generate JWT

↓

Generate Refresh Token

↓

Save Session

↓

Return JWT

---

# 14.3 Upload Video

Desktop

↓

API

↓

Upload Session

↓

Chunk Upload

↓

Checksum

↓

Storage

↓

Media Record

↓

Success

---

# 14.4 AI Pipeline

Upload

↓

Metadata Extraction

↓

Transcript

↓

Scene Detection

↓

Speaker Detection

↓

Emotion Analysis

↓

Silence Detection

↓

Hook Detection

↓

Clip Detection

↓

Clip Ranking

↓

Subtitle

↓

Translation

↓

Thumbnail

↓

Rendering

↓

Completed

---

# 14.5Render

---

**Next Document:** [03-ERD.md](03-ERD.md)

ing

Project

↓

Queue

↓

Worker

↓

FFmpeg

↓

Encode

↓

Mux

↓

Export

↓

Storage

↓

Completed

---

# 14.6 Publishing

Project

↓

Generate Metadata

↓

YouTube API

↓

Upload

↓

Publish

↓

Analytics

---

Semua error menggunakan format JSON standar.

{
  success: false,
  error: {
    code,
    message,
    details,
    requestId,
    correlationId
  }
}

---

## Error Categories

Validation Error

Authentication Error

Authorization Error

Business Rule Error

Rate Limit Error

Payment Error

Storage Error

Queue Error

AI Provider Error

Rendering Error

Database Error

Internal Error

---

## Retryable Error

Network

Queue

Provider Timeout

Storage Timeout

---

## Non Retryable

Validation

Permission

Subscription Invalid

Credit Not Enough

Unsupported Format

---

Authentication

✓ Register

✓ Login

✓ Logout

✓ Refresh Token

---

Upload

✓ Resume Upload

✓ Chunk Upload

✓ Checksum

---

AI

✓ Subtitle

✓ Viral Detection

✓ Translation

✓ Speaker Detection

✓ Hook Detection

✓ Thumbnail

---

Rendering

✓ GPU

✓ CPU

✓ Queue

✓ Retry

---

Billing

✓ Credit

✓ Subscription

✓ Coupon

✓ Invoice

---

Analytics

✓ Usage

✓ AI Cost

✓Render

---

**Next Document:** [03-ERD.md](03-ERD.md)

ing

---

PRD

↓

SRS

↓

ERD

↓

Database

↓

REST API

↓

Backend

↓

Frontend

↓

Desktop

↓

QA Test

↓

Deployment

---

Example

FR-AI-010

↓

SRS-AI-010

↓

table_ai_jobs

↓

POST /ai/jobs

↓

AIService

↓

ClipRankingPage

↓

Electron Worker

↓

QA-101

---

Authentication

JWT

Refresh Token Rotation

OAuth

---

Authorization

RBAC Ready

Owner

Admin (future)

User

---

Transport

TLS 1.3

HSTS

CSP

---

Secrets

Vault / Environment Secret Manager

---

Logging

Audit Log

Security Log

Authentication Log

Billing Log

AI Log

---

Compliance

OWASP Top 10

OpenAPI

Dependency Scanning

SBOM (future)

---

Docker Ready

Environment Based Configuration

Stateless Backend

Horizontal Worker

Redis

Supabase

Cloudflare

Nginx

CI/CD

Health Check Endpoint

Readiness Probe

Liveness Probe

---

Reference Documents

PRD

ERD

Architecture

API

Database

Glossary

AI Provider

Credit

Worker

Queue

Transcript

Clip

Subtitle

Render





