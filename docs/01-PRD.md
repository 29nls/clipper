# Product Requirements Document (PRD)

Version: 1.0.0 (Draft)

Project Name:
AI Video Clipper Platform

Document Owner:
Product Management

Status:
Draft

Target Release:
MVP

Last Updated:
2026

---

# 1. Executive Summary

## 1.1 Overview

AI Video Clipper Platform adalah platform AI Video Editing generasi berikutnya yang dirancang untuk membantu Content Creator, YouTuber, TikTok Creator, dan Social Media Publisher mengubah video berdurasi panjang menjadi banyak video pendek (short-form content) secara otomatis menggunakan Artificial Intelligence.

Platform akan tersedia dalam dua bentuk:

- Desktop Windows
- Web SaaS

Desktop ditujukan untuk editing yang cepat dan nyaman.

SaaS ditujukan untuk sinkronisasi akun, penyimpanan cloud, subscription, credit system, rendering cloud, analytics, dan AI orchestration.

Produk ini dirancang agar dapat bersaing dengan:

- Opus Clip
- Vizard
- Veed
- Kapwing
- Quso
- Spikes
- Creatify
- Ssemble
- YouClip

Target utama bukan hanya menyamai fitur kompetitor, tetapi membangun platform modular yang memungkinkan penambahan AI provider, AI model, dan workflow baru tanpa perubahan besar pada arsitektur.

---

# 1.2 Product Vision

Menjadi platform AI Video Repurposing terbaik yang mampu mengubah satu video panjang menjadi puluhan konten pendek berkualitas tinggi secara otomatis dengan bantuan AI.

Platform harus:

• Cepat

• Akurat

• Modular

• Mudah digunakan

• Mendukung banyak AI Provider

• Mendukung banyak bahasa

• Dapat berkembang menjadi Enterprise Platform

---

# 1.3 Product Mission

Mengurangi waktu editing video hingga lebih dari 90% melalui otomatisasi AI.

Memberikan creator kemampuan untuk:

- menghasilkan subtitle
- membuat thumbnail
- membuat judul
- membuat hashtag
- membuat deskripsi
- melakukan auto crop
- menemukan viral moments
- melakukan publishing

dalam satu workflow.

---

# 1.4 Product Goals

Primary Goals

- Mengurangi waktu editing video.

- Menghasilkan short clips secara otomatis.

- Mempermudah publishing ke media sosial.

- Menjadi platform AI Video Editing yang extensible.

Secondary Goals

- Menjadi AI Platform.

- Menyediakan API.

- Menyediakan White Label.

- Mendukung AI Marketplace.

---

# 1.5 Business Objectives

Dalam 12 bulan pertama:

Target User

10.000 pengguna aktif.

Conversion Rate

15%

Subscription

2.000 pelanggan

Retention

70%

Average Credits Usage

500 credit/user/bulan

---

# 1.6 Success Metrics

KPI Produk

Time to First Clip

< 3 menit

Subtitle Accuracy

>95%

AI Clip Ranking Accuracy

>90%

Crash Rate

<0.5%

Average Rendering Time

<5 menit

Daily Active Users

Target bertahap sesuai roadmap.

---

# 1.7 Scope

Included

✔ Desktop Windows

✔ Web SaaS

✔ Credit System

✔ Subscription

✔ AI Provider Abstraction

✔ Rendering

✔ AI Pipeline

✔ Analytics

✔ Dashboard

✔ Timeline Editor

✔ Export

✔ Publishing

Excluded (MVP)

✘ Android

✘ iOS

✘ Multi-Tenant Workspace

✘ Marketplace

✘ Plugin Adobe Premiere

✘ Plugin DaVinci

✘ Plugin Final Cut

Dokumen ini akan menguraikan kebutuhan produk untuk MVP dengan arsitektur yang siap dikembangkan ke fitur-fitur tersebut di masa depan.

---

# 2. Product Strategy

## 2.1 Target Market

Primary

Content Creator

YouTuber

TikTok Creator

Secondary

Agency

Marketing Team

Podcast Creator

Corporate Media Team

---

## 2.2 Personas

### Persona 1

Nama

Content Creator

Goal

Mengubah video 1 jam menjadi 20 Shorts.

Pain

Editing terlalu lama.

Success

20 video selesai dalam 10 menit.

---

### Persona 2

Nama

YouTuber

Goal

Mengambil highlight dari livestream.

Pain

Sulit mencari bagian menarik.

Success

AI menemukan semua highlight secara otomatis.

---

### Persona 3

Nama

TikTok Creator

Goal

Upload 10 video per hari.

Pain

Harus membuat caption dan subtitle secara manual.

Success

Semua caption dibuat AI.

---

# 3. Product Principles

Platform harus memiliki prinsip berikut:

## AI First

Semua fitur utama menggunakan AI.

---

## Modular

Setiap AI provider dapat diganti tanpa mengubah aplikasi.

---

## Extensible

Semua modul baru dapat ditambahkan sebagai plugin internal.

---

## Cloud Native

Backend dirancang sebagai layanan modular dengan API yang jelas.

---

## Desktop Friendly

Desktop tetap menjadi pengalaman utama untuk proses editing dan rendering, sementara SaaS menangani autentikasi, sinkronisasi, serta layanan cloud.

---

# 4. Competitive Analysis

## 4.1 Industry Overview

Pasar AI Video Editing berkembang sangat cepat karena meningkatnya kebutuhan pembuatan konten untuk:

- YouTube Shorts
- TikTok
- Instagram Reels
- Facebook Reels
- LinkedIn Video
- X Video
- Podcast Clips

Creator saat ini lebih membutuhkan workflow otomatis dibanding editor tradisional.

Target produk ini adalah menjadi platform AI Video Repurposing yang mampu mengubah satu video panjang menjadi puluhan aset konten siap dipublikasikan.

---

# 4.2 Competitor Analysis

## Opus Clip

Strength

- Viral Score
- Clip Detection
- Auto Subtitle
- Auto Reframe
- Cloud Rendering

Weakness

- Mahal
- Tidak fleksibel
- Tidak memiliki Desktop
- AI Provider tidak dapat dikustomisasi

Opportunity

- Mendukung banyak AI Provider
- Desktop Windows
- Credit System yang lebih fleksibel

---

## Vizard

Strength

- UI sederhana
- Subtitle cepat

Weakness

- Editing terbatas
- Timeline kurang fleksibel

Opportunity

- Timeline Professional
- AI Pipeline lebih lengkap

---

## Kapwing

Strength

- Editing lengkap

Weakness

- AI belum terintegrasi secara mendalam

Opportunity

- AI First Workflow

---

## VEED

Strength

- Editing lengkap
- Banyak template

Weakness

- Mahal
- Rendering lambat

Opportunity

- Rendering lebih cepat
- Queue Management

---

## Spikes Studio

Strength

- Podcast clipping

Weakness

- Fitur terbatas

Opportunity

- Mendukung seluruh tipe video.

---

# 4.3 Competitive Feature Matrix

| Feature | Our Product | Opus | Vizard | VEED | Kapwing |
|----------|------------|-------|---------|-----------|------------|
| Desktop | ✅ | ❌ | ❌ | ❌ | ❌ |
| SaaS | ✅ | ✅ | ✅ | ✅ | ✅ |
| Viral Detection | ✅ | ✅ | ✅ | ❌ | ❌ |
| Clip Ranking | ✅ | ✅ | ❌ | ❌ | ❌ |
| Subtitle | ✅ | ✅ | ✅ | ✅ | ✅ |
| Speaker Detection | ✅ | ❌ | ❌ | ❌ | ❌ |
| Face Tracking | ✅ | ✅ | ❌ | ❌ | ❌ |
| Translation | ✅ | ✅ | ❌ | ✅ | ✅ |
| Voice Clone | ✅ | ❌ | ❌ | ❌ | ❌ |
| Timeline Editor | ✅ | ❌ | ❌ | ✅ | ✅ |
| Batch Processing | ✅ | ❌ | ❌ | ❌ | ❌ |
| Credit System | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI Provider Switch | ✅ | ❌ | ❌ | ❌ | ❌ |

---

# 5. Product Positioning

## Value Proposition

"Satu platform untuk mengubah video panjang menjadi puluhan konten pendek menggunakan AI."

Platform harus mengurangi pekerjaan manual sebanyak mungkin.

Semua proses dilakukan dalam satu workflow.

Upload

↓

Analisis AI

↓

Clip Detection

↓

Subtitle

↓

Title

↓

Thumbnail

↓

Rendering

↓

Publishing

---

# 6. Product Pillars

## AI First

Seluruh fitur utama menggunakan AI.

---

## Creator First

UI dibuat sederhana.

Tidak membutuhkan pengalaman editing profesional.

---

## Performance

Desktop harus mampu memanfaatkan:

- GPU
- Multi Core CPU
- Hardware Encoding
- FFmpeg Acceleration

---

## Extensible

Semua AI Module bersifat plug-and-play.

---

## Secure

API Key tidak pernah berada di Desktop.

Semua request AI melewati Backend.

---

# 7. Product Modules

Platform dibagi menjadi beberapa domain besar.

## Authentication Module

Fitur

- Register
- Login
- Forgot Password
- OAuth Google
- OAuth GitHub
- Phone Verification
- JWT
- Refresh Token
- Session Management

---

## User Module

Fitur

- Profile
- Avatar
- Preferences
- AI Settings
- Notification

---

## Dashboard Module

Fitur

- Recent Projects
- Credit Usage
- Subscription
- Rendering Queue
- Analytics

---

## Project Module

Fitur

- Create Project
- Open Project
- Save Project
- Duplicate
- Archive
- Delete
- Auto Save

---

## Upload Module

Fitur

- Drag & Drop
- Multi Upload
- Folder Upload
- Resume Upload
- Chunk Upload

Supported Format

MP4

MOV

AVI

MKV

WEBM

MP3

WAV

AAC

M4A

---

## AI Processing Module

Pipeline

Upload

↓

Speech Recognition

↓

Scene Detection

↓

Speaker Detection

↓

Face Tracking

↓

Emotion Analysis

↓

Silence Detection

↓

Viral Detection

↓

Clip Ranking

↓

Subtitle

↓

Translation

↓

Hook Generation

↓

Thumbnail Generation

↓

Rendering

---

## Timeline Editor

Fitur

Multi Track

Zoom

Cut

Trim

Split

Ripple Delete

Undo

Redo

Snap

Markers

Keyframe

Audio Track

Subtitle Track

---

## Subtitle Module

Fitur

Auto Subtitle

Subtitle Edit

Subtitle Translation

Subtitle Style

Subtitle Animation

Subtitle Template

Burn Subtitle

Export SRT

Export VTT

---

## Thumbnail Module

Fitur

AI Thumbnail

Manual Thumbnail

Template

Emoji

Background Removal

Text Overlay

---

## Publishing Module

Fitur

YouTube Upload

TikTok Upload

Future

Instagram

Facebook

LinkedIn

---

## Analytics Module

Fitur

Daily Usage

Credit Usage

Rendering Time

Export Count

Popular Clips

Most Used AI

---

# 8. User Journey

Step 1

Login

↓

Dashboard

↓

Create Project

↓

Upload Video

↓

AI Analysis

↓

Review Clip

↓

Edit Timeline

↓

Generate Subtitle

↓

Generate Title

↓

Generate Thumbnail

↓

Render

↓

Publish

↓

Analytics

---

# 9. User Stories

US-001

Sebagai Content Creator,

Saya ingin mengunggah video,

Agar AI dapat membuat banyak clip otomatis.

Acceptance Criteria

✔ Upload berhasil.

✔ Progress terlihat.

✔ Resume upload tersedia.

---

US-002

Sebagai Creator,

Saya ingin AI mencari bagian viral,

Agar tidak perlu mencari manual.

Acceptance Criteria

✔ AI memberi score.

✔ AI memberi ranking.

✔ AI memberi alasan ranking.

---

US-003

Sebagai YouTuber,

Saya ingin AI membuat subtitle,

Agar video siap upload.

Acceptance Criteria

✔ Subtitle akurat.

✔ Subtitle dapat diedit.

✔ Subtitle dapat diterjemahkan.

---

# 10. Feature Catalog

## 10.1 Authentication Domain

### AUTH-001
User Registration

Priority:
Critical

Description:
Pengguna dapat membuat akun menggunakan email dan password.

Requirements:

- Email unik.
- Password minimal 8 karakter.
- Password di-hash menggunakan Argon2id.
- Email verification.
- Rate limiting.

---

### AUTH-002

Google OAuth Login

Priority

Critical

---

### AUTH-003

GitHub OAuth Login

Priority

Medium

---

### AUTH-004

Phone Verification

Priority

Medium

Status

Future Ready

---

### AUTH-005

Refresh Token Rotation

Priority

Critical

---

### AUTH-006

Device Session Management

Priority

High

---

### AUTH-007

Logout All Devices

Priority

Medium

---

# 10.2 User Profile Domain

USER-001

Edit Profile

---

USER-002

Avatar Upload

---

USER-003

Language Preference

---

USER-004

AI Provider Preference

---

USER-005

Notification Preference

---

USER-006

Dark Mode

---

USER-007

Export Settings

---

# 10.3 Dashboard Domain

DASH-001

Dashboard Overview

Menampilkan:

- Credit
- Subscription
- Recent Projects
- Queue
- Analytics

---

DASH-002

Recent Projects

---

DASH-003

Credit Overview

---

DASH-004

Subscription Overview

---

DASH-005

Rendering Queue

---

DASH-006

Notifications

---

# 10.4 Project Domain

PROJ-001

Create Project

---

PROJ-002

Rename Project

---

PROJ-003

Duplicate Project

---

PROJ-004

Archive Project

---

PROJ-005

Delete Project

Soft Delete

---

PROJ-006

Restore Project

---

PROJ-007

Project Autosave

Interval

30 detik

---

PROJ-008

Version History

Future

---

# 10.5 Media Upload Domain

UPLOAD-001

Drag and Drop Upload

---

UPLOAD-002

Chunk Upload

---

UPLOAD-003

Resume Upload

---

UPLOAD-004

Multi Upload

---

UPLOAD-005

Folder Upload

---

UPLOAD-006

Cloud Upload

Future

---

Supported Format

Video

- mp4
- mov
- avi
- mkv
- webm

Audio

- mp3
- wav
- aac
- m4a

---

# 10.6 AI Processing Domain

AI-001

Speech Recognition

---

AI-002

Speaker Detection

---

AI-003

Scene Detection

---

AI-004

Face Tracking

---

AI-005

Object Detection

Future

---

AI-006

Emotion Detection

---

AI-007

Silence Detection

---

AI-008

Filler Word Detection

---

AI-009

Viral Moment Detection

---

AI-010

Clip Ranking

---

AI-011

Hook Detection

---

AI-012

Highlight Extraction

---

AI-013

Transcript Generation

---

AI-014

Subtitle Generation

---

AI-015

Subtitle Translation

---

AI-016

Caption Animation

---

AI-017

Auto Reframe

---

AI-018

Thumbnail Generation

---

AI-019

Title Generation

---

AI-020

Description Generation

---

AI-021

Hashtag Generation

---

AI-022

Emoji Suggestion

---

AI-023

Background Music Recommendation

---

AI-024

Voice Dubbing

---

AI-025

Voice Clone

---

AI-026

Noise Reduction

---

AI-027

Loudness Normalization

---

AI-028

Rendering Optimization

---

AI-029

Publishing Recommendation

---

AI-030

AI Provider Selection

Automatic

Manual

Hybrid

---

# 10.7 Timeline Domain

TIMELINE-001

Split Clip

---

TIMELINE-002

Trim Clip

---

TIMELINE-003

Ripple Delete

---

TIMELINE-004

Undo

---

TIMELINE-005

Redo

---

TIMELINE-006

Zoom Timeline

---

TIMELINE-007

Markers

---

TIMELINE-008

Subtitle Track

---

TIMELINE-009

Audio Track

---

TIMELINE-010

Video Track

---

TIMELINE-011

Snap

---

TIMELINE-012

Keyboard Shortcut

---

# 10.8 Subtitle Domain

SUB-001

Subtitle Editor

---

SUB-002

Subtitle Animation

---

SUB-003

Subtitle Templates

---

SUB-004

Subtitle Export SRT

---

SUB-005

Subtitle Export VTT

---

SUB-006

Burn Subtitle

---

SUB-007

Subtitle Search

---

SUB-008

Subtitle Replace

---

# 10.9 Rendering Domain

RENDER-001

Queue Rendering

---

RENDER-002

GPU Encoding

---

RENDER-003

CPU Encoding

---

RENDER-004

Preset

YouTube

TikTok

Instagram

Custom

---

RENDER-005

Resolution

720p

1080p

1440p

4K

---

RENDER-006

FPS

24

30

60

---

RENDER-007

Codec

H264

H265

AV1

---

RENDER-008

Watermark

---

RENDER-009

Batch Rendering

---

RENDER-010

Cloud Rendering

---

# 10.10 Publishing Domain

PUB-001

YouTube Upload

---

PUB-002

TikTok Upload

---

PUB-003

Scheduled Publishing

---

PUB-004

Draft Publishing

---

PUB-005

Publishing History

---

PUB-006

Retry Failed Upload

---

# 10.11 Analytics Domain

ANA-001

Project Analytics

---

ANA-002

Credit Usage

---

ANA-003

Rendering Statistics

---

ANA-004

AI Usage

---

ANA-005

Export Statistics

---

ANA-006

Daily Activity

---

ANA-007

Monthly Report

---

ANA-008

Provider Cost Report

Admin Only

---

# 10.12 Billing Domain

BILL-001

Credit Wallet

---

BILL-002

Credit Transaction

---

BILL-003

Subscription

---

BILL-004

Invoice

---

BILL-005

Payment History

---

BILL-006

Coupon

---

BILL-007

Promo Code

---

BILL-008

Webhook Payment

---

BILL-009

Refund

Future

---

# 10.13 Notification Domain

NOTIF-001

Email Notification

---

NOTIF-002

In-App Notification

---

NOTIF-003

Rendering Finished

---

NOTIF-004

Credit Low

---

NOTIF-005

Subscription Expiring

---

NOTIF-006

System Announcement

---

# 11. Functional Requirements

## 11.1 Authentication Requirements

---

### FR-AUTH-001

Requirement Name

User Registration

Priority

Critical

Description

Sistem harus memungkinkan pengguna membuat akun baru menggunakan email dan password.

Preconditions

- Email belum terdaftar.

Main Flow

1. User mengisi form.
2. Sistem memvalidasi input.
3. Password di-hash menggunakan Argon2id.
4. User dibuat.
5. Verification email dikirim.

Alternative Flow

Jika email sudah ada

↓

Tampilkan error.

Acceptance Criteria

✓ Email unik

✓ Password terenkripsi

✓ Verification email terkirim

Related API

POST /auth/register

Related Tables

users

user_credentials

verification_tokens

audit_logs

---

### FR-AUTH-002

Login

Priority

Critical

Description

User dapat login menggunakan email.

Acceptance Criteria

✓ JWT dibuat

✓ Refresh Token dibuat

✓ Session dibuat

Related API

POST /auth/login

---

### FR-AUTH-003

Google OAuth

---

### FR-AUTH-004

GitHub OAuth

---

### FR-AUTH-005

Forgot Password

---

### FR-AUTH-006

Reset Password

---

### FR-AUTH-007

Refresh Token

---

### FR-AUTH-008

Logout

---

### FR-AUTH-009

Logout All Devices

---

### FR-AUTH-010

Phone Verification

Future

---

# 11.2 User Requirements

---

### FR-USER-001

Edit Profile

---

### FR-USER-002

Upload Avatar

---

### FR-USER-003

Change Password

---

### FR-USER-004

Notification Settings

---

### FR-USER-005

Language Settings

---

### FR-USER-006

Timezone

---

### FR-USER-007

Delete Account

Soft Delete

---

# 11.3 Project Requirements

---

### FR-PROJECT-001

Create Project

Description

User membuat project baru.

Acceptance

✓ Project muncul di Dashboard.

Related Tables

projects

project_members

---

### FR-PROJECT-002

Rename Project

---

### FR-PROJECT-003

Duplicate Project

---

### FR-PROJECT-004

Archive Project

---

### FR-PROJECT-005

Delete Project

Soft Delete

---

### FR-PROJECT-006

Restore Project

---

### FR-PROJECT-007

Autosave

Autosave setiap 30 detik.

---

### FR-PROJECT-008

Recent Projects

---

# 11.4 Upload Requirements

---

### FR-UPLOAD-001

Upload Video

Description

User dapat mengupload video.

Acceptance

✓ Progress

✓ Resume

✓ Retry

Related Tables

media_files

uploads

storage_objects

---

### FR-UPLOAD-002

Upload Audio

---

### FR-UPLOAD-003

Chunk Upload

---

### FR-UPLOAD-004

Resume Upload

---

### FR-UPLOAD-005

Drag and Drop

---

### FR-UPLOAD-006

Folder Upload

---

### FR-UPLOAD-007

Cancel Upload

---

# 11.5 AI Requirements

---

### FR-AI-001

Speech Recognition

Description

AI menghasilkan transcript.

Acceptance

WER < 10%

Related Tables

transcripts

---

### FR-AI-002

Subtitle Generation

Acceptance

Subtitle dapat diedit.

---

### FR-AI-003

Subtitle Translation

---

### FR-AI-004

Speaker Detection

---

### FR-AI-005

Face Tracking

---

### FR-AI-006

Scene Detection

---

### FR-AI-007

Emotion Detection

---

### FR-AI-008

Silence Detection

---

### FR-AI-009

Filler Word Detection

---

### FR-AI-010

Viral Detection

Acceptance

AI memberi score 0-100.

---

### FR-AI-011

Clip Ranking

Acceptance

Ranking otomatis.

---

### FR-AI-012

Hook Detection

---

### FR-AI-013

Highlight Detection

---

### FR-AI-014

Thumbnail Generation

---

### FR-AI-015

Title Generation

---

### FR-AI-016

Description Generation

---

### FR-AI-017

Hashtag Generation

---

### FR-AI-018

Emoji Suggestion

---

### FR-AI-019

Translation

---

### FR-AI-020

Voice Clone

---

### FR-AI-021

Voice Dubbing

---

### FR-AI-022

Noise Reduction

---

### FR-AI-023

Background Music

---

### FR-AI-024

Caption Animation

---

### FR-AI-025

Auto Reframe

Acceptance

16:9

9:16

1:1

didukung.

---

### FR-AI-026

Provider Selection

Automatic

Manual

Hybrid

---

# 11.6 Timeline Requirements

---

### FR-TL-001

Split Clip

---

### FR-TL-002

Trim Clip

---

### FR-TL-003

Merge Clip

---

### FR-TL-004

Undo

---

### FR-TL-005

Redo

---

### FR-TL-006

Marker

---

### FR-TL-007

Snap

---

### FR-TL-008

Subtitle Track

---

### FR-TL-009

Audio Track

---

### FR-TL-010

Video Track

---

# 11.7 Rendering Requirements

---

### FR-RENDER-001

Queue Rendering

---

### FR-RENDER-002

GPU Rendering

---

### FR-RENDER-003

CPU Rendering

---

### FR-RENDER-004

Cloud Rendering

---

### FR-RENDER-005

Batch Rendering

---

### FR-RENDER-006

Cancel Rendering

---

### FR-RENDER-007

Retry Rendering

---

### FR-RENDER-008

Export MP4

---

### FR-RENDER-009

Export MOV

---

### FR-RENDER-010

Export WEBM

---

# 11.8 Publishing Requirements

---

### FR-PUB-001

Upload YouTube

---

### FR-PUB-002

Upload TikTok

---

### FR-PUB-003

Schedule Publish

---

### FR-PUB-004

Draft Publish

---

### FR-PUB-005

Retry Publish

---

# 11.9 Billing Requirements

---

### FR-BILL-001

Credit Wallet

---

### FR-BILL-002

Credit Usage

---

### FR-BILL-003

Credit History

---

### FR-BILL-004

Subscription

---

### FR-BILL-005

Upgrade Plan

---

### FR-BILL-006

Cancel Subscription

---

### FR-BILL-007

Coupon

---

### FR-BILL-008

Invoice

---

### FR-BILL-009

Webhook Payment

---

# 11.10 Analytics Requirements

---

### FR-ANA-001

Dashboard Analytics

---

### FR-ANA-002

Credit Analytics

---

### FR-ANA-003

Rendering Analytics

---

### FR-ANA-004

AI Provider Analytics

---

### FR-ANA-005

Export Analytics

---

### FR-ANA-006

Monthly Report

---

---

# 12. Non-Functional Requirements

Non-functional requirements mendefinisikan karakteristik kualitas sistem.

---

# 12.1 Performance

---

## NFR-PERF-001

System Response Time

Requirement

95% API request harus selesai dalam waktu kurang dari:

500 ms

Tidak termasuk AI Processing.

---

## NFR-PERF-002

Dashboard Load Time

Requirement

Dashboard pertama kali terbuka

< 2 detik

---

## NFR-PERF-003

Project Opening

Requirement

Project ukuran 2GB

dibuka

< 5 detik

---

## NFR-PERF-004

Timeline Scrolling

Requirement

Timeline harus tetap

60 FPS

pada video Full HD.

---

## NFR-PERF-005

Preview Rendering

Requirement

Preview tidak boleh lag.

Target

30 FPS

---

## NFR-PERF-006

GPU Acceleration

Desktop harus menggunakan:

- NVENC
- Intel QuickSync (jika tersedia)
- AMD AMF (jika tersedia)

---

## NFR-PERF-007

Concurrent Upload

Minimal

10 upload bersamaan.

---

## NFR-PERF-008

Concurrent Rendering

Desktop

Minimal

3 rendering sekaligus.

Cloud

ditentukan berdasarkan subscription.

---

## NFR-PERF-009

Background Processing

Semua AI Processing

harus berjalan asynchronous.

---

# 12.2 Availability

---

## NFR-AVL-001

API Availability

99.9%

---

## NFR-AVL-002

Database Availability

99.9%

---

## NFR-AVL-003

Storage Availability

99.9%

---

## NFR-AVL-004

Retry Mechanism

Semua request penting

harus memiliki retry.

---

# 12.3 Reliability

---

## NFR-REL-001

Auto Recovery

Jika rendering gagal

↓

Job dapat dilanjutkan.

---

## NFR-REL-002

Upload Resume

Upload terputus

↓

Lanjutkan.

---

## NFR-REL-003

Autosave

Autosave

30 detik.

---

## NFR-REL-004

Project Recovery

Jika aplikasi crash

↓

Project dapat dipulihkan.

---

# 12.4 Scalability

---

## NFR-SCL-001

AI Provider

Harus dapat menambah provider baru

tanpa mengubah business logic.

---

## NFR-SCL-002

Storage

Harus mendukung

Supabase

Cloudflare R2

AWS S3 (future)

---

## NFR-SCL-003

Queue

Harus dapat dijalankan

multi worker.

---

## NFR-SCL-004

Horizontal Scaling

Backend

stateless.

---

# 12.5 Security

---

## NFR-SEC-001

Password

Argon2id

---

## NFR-SEC-002

JWT

Access Token

15 menit.

Refresh Token

30 hari.

---

## NFR-SEC-003

HTTPS

Seluruh komunikasi

TLS 1.3.

---

## NFR-SEC-004

API Key

Tidak pernah disimpan

di Desktop.

---

## NFR-SEC-005

Secrets

Menggunakan Secret Manager.

---

## NFR-SEC-006

Rate Limiting

Login

Register

Forgot Password

OTP

AI Endpoint

Payment

---

## NFR-SEC-007

Audit Log

Semua aktivitas penting

dicatat.

---

## NFR-SEC-008

Encryption

Sensitive Data

AES-256

---

## NFR-SEC-009

Signed URL

Semua file upload

menggunakan Signed URL.

---

## NFR-SEC-010

Input Validation

Semua endpoint

harus divalidasi.

---

# 12.6 Maintainability

---

## NFR-MNT-001

Clean Architecture

---

## NFR-MNT-002

Dependency Injection

---

## NFR-MNT-003

Repository Pattern

---

## NFR-MNT-004

Unit Test

Coverage

Minimal 80%.

---

## NFR-MNT-005

Integration Test

Seluruh endpoint penting.

---

## NFR-MNT-006

Lint

ESLint

Prettier

---

# 12.7 Observability

---

## NFR-OBS-001

Centralized Logging

---

## NFR-OBS-002

Error Tracking

---

## NFR-OBS-003

Performance Monitoring

---

## NFR-OBS-004

AI Cost Monitoring

---

## NFR-OBS-005

Queue Monitoring

---

# 12.8 Accessibility

---

## NFR-ACC-001

Keyboard Navigation

---

## NFR-ACC-002

Screen Reader

Future

---

## NFR-ACC-003

High Contrast

---

## NFR-ACC-004

Resizable Font

---

# 12.9 Localization

---

## NFR-I18N-001

Bahasa

Indonesia

English

> **Catatan Strategi Bahasa:** PRD menggunakan Bahasa Indonesia sebagai bahasa utama karena target pasar primary adalah Indonesia. Dokumen teknis (SRS, ERD, Database Schema, API, Architecture) menggunakan Bahasa Inggris untuk memudahkan developer internasional dan dokumentasi teknis. Platform UI mendukung kedua bahasa (ID/EN) dengan deteksi otomatis.

---

## NFR-I18N-002

Timezone

Per User.

---

## NFR-I18N-003

Currency

Multi Currency

Future.

---

# 12.10 Privacy

---

## NFR-PRV-001

User Data Ownership

Pengguna tetap menjadi pemilik data.

---

## NFR-PRV-002

Data Deletion

Pengguna dapat menghapus akun beserta data sesuai kebijakan retensi.

---

## NFR-PRV-003

Consent

Pengguna harus menyetujui Terms of Service dan Privacy Policy sebelum menggunakan layanan.

---

# 12.11 Backup & Disaster Recovery

---

## NFR-DR-001

Database Backup

Harian.

---

## NFR-DR-002

Object Storage Backup

Sesuai kebijakan retensi storage.

---

## NFR-DR-003

Recovery Time Objective (RTO)

Target:

< 4 jam.

---

## NFR-DR-004

Recovery Point Objective (RPO)

Target:

< 24 jam.

---

# 12.12 Compliance

---

## NFR-COMP-001

OWASP Top 10

Seluruh endpoint harus ditinjau terhadap risiko umum aplikasi web.

---

## NFR-COMP-002

OpenAPI

REST API didokumentasikan menggunakan spesifikasi OpenAPI.

---

## NFR-COMP-003

License Compliance

Seluruh dependensi pihak ketiga harus memiliki lisensi yang kompatibel dengan distribusi produk.

---

---

# 13. AI System Design

## 13.1 AI Philosophy

Platform dibangun berdasarkan prinsip:

> **AI adalah sebuah layanan (service), bukan bagian yang tertanam di UI.**

Semua fitur AI harus dapat:

- diganti modelnya
- diganti providernya
- di-upgrade versinya
- dijalankan secara asynchronous
- dijalankan secara distributed
- dimonitor
- diukur biayanya

UI Desktop maupun SaaS **tidak mengetahui model AI apa yang sedang digunakan**.

Desktop hanya mengetahui:

- Request AI
- Progress
- Result

Semua keputusan model dilakukan oleh AI Orchestrator.

---

# 13.2 AI Architecture

```
                  Desktop

                      │

               REST / WebSocket

                      │

                API Gateway

                      │

              AI Orchestrator

                      │

      ┌───────────────┼─────────────────┐

      │               │                 │

 Queue Engine     Prompt Engine     Credit Engine

      │               │                 │

      └───────────────┼─────────────────┘

                      │

             AI Provider Router

                      │

 ┌──────────┬──────────┬──────────┬──────────┐

 │          │          │          │

OpenRouter OpenCode NVIDIA Ollama Future

```

---

# 13.3 AI Orchestrator

AI Orchestrator adalah otak seluruh sistem AI.

Responsibilities

- memilih provider
- memilih model
- retry
- fallback
- logging
- cache
- queue
- monitoring
- credit calculation

Desktop tidak pernah memanggil provider AI secara langsung.

Semua request melewati:

AI Gateway

↓

Orchestrator

↓

Provider

---

# 13.4 AI Provider Abstraction

Semua provider harus mengimplementasikan interface yang sama.

```
IAIProvider

initialize()

healthCheck()

generateText()

generateSubtitle()

translate()

detectScene()

detectSpeaker()

detectFace()

generateThumbnail()

voiceClone()

dubbing()

render()

estimateCost()

shutdown()
```

Dengan demikian penambahan provider baru tidak mengubah business logic.

---

# 13.5 Supported AI Providers

## MVP

OpenRouter

OpenCode

NVIDIA

---

## Future

OpenAI

Claude

Gemini

Groq

TogetherAI

Cohere

Azure OpenAI

AWS Bedrock

Vertex AI

Local Llama

Local Qwen

Local DeepSeek

---

# 13.6 AI Provider Selection

Mode

Automatic

↓

AI memilih provider terbaik.

Manual

↓

User memilih provider.

Hybrid

↓

Rule Engine memilih.

---

Contoh

Subtitle

↓

OpenRouter

Voice Clone

↓

NVIDIA

Translation

↓

OpenRouter

Thumbnail

↓

OpenCode

---

# 13.7 Model Registry

Semua model disimpan dalam registry.

Contoh

```
Model

id

provider

version

type

pricing

maxTokens

maxDuration

status

health

priority

```

Contoh

OpenRouter

↓

Qwen

↓

Version 3

↓

Enabled

---

# 13.8 Prompt Management

Prompt tidak boleh ditulis langsung di source code.

Semua prompt harus memiliki:

Prompt ID

Version

Author

Status

Variables

Model Compatibility

Expected Output

Example

---

Prompt dapat diupdate

tanpa update aplikasi.

---

# 13.9 AI Workflow

Video Upload

↓

Extract Metadata

↓

Scene Detection

↓

Speech Recognition

↓

Transcript

↓

Speaker Detection

↓

Face Detection

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

Title

↓

Description

↓

Hashtag

↓

Thumbnail

↓

Rendering

↓

Publishing

---

# 13.10 AI Job Lifecycle

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

Archived

↓

Deleted

---

Jika gagal

↓

Retry Policy

↓

Fallback Provider

↓

Mark Failed

---

# 13.11 Queue Strategy

Semua AI berjalan asynchronous.

Queue

Subtitle Queue

Rendering Queue

Thumbnail Queue

Translation Queue

Publishing Queue

Analytics Queue

Notification Queue

Cleanup Queue

---

# 13.12 Retry Policy

Retry

1

↓

Retry

2

↓

Retry

3

↓

Fallback Provider

↓

Error

---

Retry menggunakan

Exponential Backoff.

---

# 13.13 Cache Strategy

Cache digunakan untuk

Transcript

Subtitle

Translation

Thumbnail

Prompt

AI Response

Metadata

---

Redis digunakan sebagai

Distributed Cache.

---

# 13.14 AI Cost Optimizer

Setiap request harus dihitung.

Input

↓

Estimated Token

↓

Estimated Duration

↓

Estimated Credit

↓

Estimated Cost

↓

Approval

↓

Execution

---

# 13.15 Credit Consumption

Contoh

Subtitle

5 Credit

Translation

3 Credit

Thumbnail

2 Credit

Voice Clone

20 Credit

Dubbing

15 Credit

Rendering

10 Credit

Publish

0 Credit

Analytics

0 Credit

Catatan: Nilai kredit di atas adalah contoh awal. Angka final akan ditetapkan setelah pemilihan model AI, pengukuran biaya operasional, dan strategi monetisasi selesai.

---

# 13.16 AI Health Monitoring

Semua provider harus memiliki status.

Healthy

Warning

Degraded

Offline

---

Jika provider offline

↓

Fallback otomatis.

---

# 13.17 AI Metrics

Setiap request mencatat:

Latency

Provider

Model

Prompt Version

Token

Duration

Credit

Cost

Result

Retry

Cache Hit

Success Rate

---

# 13.18 AI Security

Prompt Injection Detection

Rate Limit

API Signature

Prompt Sanitization

Content Validation

Token Validation

Provider Isolation

Encrypted Secrets

---

# 13.19 Future AI Roadmap

Planned

AI Agent

AI Planner

AI Video Director

AI Story Generator

AI Content Calendar

AI Social Strategy

AI Trend Prediction

AI Thumbnail A/B Testing

AI Auto Publishing

AI Recommendation Engine

AI Marketplace

AI Plugin SDK

---

# 13.20 Design Principles

Semua AI harus memenuhi prinsip berikut:

- Provider-independent.
- Asynchronous.
- Observable.
- Cost-aware.
- Secure.
- Retryable.
- Cacheable.
- Versioned.
- Extensible.
- Testable.

Dokumen ini menjadi acuan utama bagi implementasi AI Gateway, AI Pipeline, dan seluruh layanan AI pada backend.

---

# 14. Credit System Design

## 14.1 Objectives

Credit System digunakan untuk:

- mengontrol penggunaan AI
- mengukur biaya operasional
- mendukung model Freemium
- mendukung Subscription
- mengontrol abuse
- mengontrol AI Cost

---

# 14.2 Credit Principles

Setiap AI Job memiliki:

- Credit Cost
- Estimated Cost
- Estimated Runtime
- AI Provider
- AI Model

Credit tidak dikurangi ketika job dibuat.

Credit hanya dikurangi ketika:

Status

Completed

atau

Partially Completed (sesuai kebijakan per fitur).

---

# 14.3 Credit Transaction Types

Transaction Type

Credit Earned

Credit Purchased

Credit Bonus

Credit Subscription

Credit Consumed

Credit Refunded

Credit Expired

Credit Adjustment (Admin)

---

# 14.4 Credit Lifecycle

Create Transaction

↓

Pending

↓

Reserved (opsional, bila fitur membutuhkan reservasi kredit)

↓

Processing

↓

Committed

↓

Completed

atau

Cancelled

↓

Refunded (jika memenuhi syarat)

---

# 14.5 Credit Rules

Rule 1

Tidak boleh negatif.

Rule 2

Semua transaksi immutable.

Rule 3

Menggunakan double-entry ledger untuk audit.

Rule 4

Semua perubahan memiliki Audit Log.

Rule 5

Admin tidak boleh menghapus history.

---

# 14.6 Credit Configuration

Konfigurasi kredit harus dikelola melalui Admin Panel.

Contoh konfigurasi:

Subtitle

5 Credit

Voice Clone

20 Credit

Rendering

10 Credit

Nilai ini bukan hardcoded.

Disimpan di database.

---

# 15. Subscription System

## 15.1 Plan

Free

Starter

Pro

Business

Enterprise

---

## 15.2 Subscription Attributes

Plan Name

Monthly Price

Yearly Price

Daily Limit

Concurrent Jobs

Priority Queue

Cloud Rendering

Storage Quota

Credit Allocation

Support Level

---

## 15.3 Free Plan

- Limited Credit
- Standard Queue
- Watermark (opsional)
- Limited Export Resolution

---

## 15.4 Pro Plan

- Higher Daily Limit
- Priority Queue
- Faster Processing
- Higher Export Resolution
- Additional Credits
- Advanced AI Features

---

## 15.5 Enterprise

- Custom Limits
- SLA
- Dedicated Support
- Custom AI Provider
- API Access
- White Label (Future)

---

# 16. Release Strategy

## MVP

Target:

Core creator workflow.

Features:

- Authentication
- Upload
- AI Pipeline
- Subtitle
- Viral Detection
- Clip Ranking
- Timeline Editor
- Rendering
- Credit
- Subscription
- Analytics
- YouTube Upload
- TikTok Upload

---

## Version 1.1

- Voice Clone
- Dubbing
- AI Thumbnail
- Background Music
- Caption Animation

---

## Version 1.5

- Team Workspace
- Shared Assets
- AI Marketplace (internal)
- Plugin SDK (internal)

---

## Version 2.0

- Multi-tenant
- Enterprise Administration
- Public API
- White Label
- Billing API
- Organization Management

---

# 17. Risk Analysis

## Technical Risks

AI Provider Downtime

Mitigation:

- Fallback Provider
- Health Monitoring

---

Large Video Files

Mitigation:

- Chunk Upload
- Resume Upload
- Background Processing

---

GPU Compatibility

Mitigation:

- CPU Fallback
- Hardware Capability Detection

---

Queue Congestion

Mitigation:

- BullMQ Priority Queue
- Auto Scaling Workers

---

# Business Risks

High AI Cost

Mitigation:

- Credit System
- Model Routing
- Cost Optimizer

---

Low User Retention

Mitigation:

- Analytics
- User Feedback
- Feature Iteration

---

Third-party Dependency

Mitigation:

- Provider Abstraction
- Multi-provider Support

---

# Security Risks

Credential Theft

Mitigation:

- OAuth
- MFA (future)
- Secret Management

---

API Abuse

Mitigation:

- Rate Limiting
- Bot Detection
- Audit Logs

---

# 18. Success Metrics

## Product KPI

Time to First Clip

Target

< 3 Minutes

---

Subtitle Accuracy

Target

>95%

---

AI Job Success Rate

Target

>99%

---

Crash Free Sessions

Target

>99.5%

---

Daily Active Users

Target

Berdasarkan roadmap bisnis.

---

Customer Satisfaction

Target

CSAT ≥ 4.5/5

---

Net Promoter Score

Target

NPS ≥ 50

---

# 19. Product Roadmap

## Phase 1

Foundation

- Authentication
- Billing
- Credits
- Upload
- Dashboard

---

## Phase 2

AI Engine

- Speech Recognition
- Viral Detection
- Subtitle
- Translation

---

## Phase 3

Editor

- Timeline
- Subtitle Editor
- Rendering
- Export

---

## Phase 4

Publishing

- YouTube
- TikTok
- Scheduler

---

## Phase 5

Advanced AI

- Voice Clone
- Dubbing
- Thumbnail
- AI Planner

---

## Phase 6

Enterprise

- Multi-tenant
- API
- White Label
- Marketplace
- SDK

---

# 20. Assumptions

Dokumen ini dibuat berdasarkan kebutuhan yang telah disepakati bersama.

Beberapa parameter (misalnya tarif kredit, harga langganan, dan daftar AI provider) sengaja dibuat konfigurabel agar dapat berubah tanpa mengubah arsitektur sistem.

Asumsi tambahan harus didokumentasikan dan disetujui sebelum implementasi.

---

# 21. Requirement Traceability

Seluruh requirement memiliki hubungan sebagai berikut:

PRD
↓
SRS
↓
ERD
↓
Database Schema
↓
REST API
↓
Backend
↓
Frontend
↓
Desktop
↓
QA Test Cases
↓
Release Checklist

Requirement ID (misalnya FR-AI-010 atau NFR-SEC-004) wajib dipertahankan di seluruh dokumen agar pelacakan perubahan tetap konsisten.

---

# 22. Glossary

AI Orchestrator
: Layanan backend yang memilih provider, model, dan mengatur eksekusi AI.

Credit
: Satuan konsumsi fitur AI.

OpenCode
: Internal AI provider codename yang digunakan untuk platform AI inference custom. Bukan nama provider publik — digunakan sebagai placeholder untuk sistem AI internal atau partner eksklusif.

Provider
: Penyedia layanan AI (misalnya OpenRouter, NVIDIA, OpenCode).

Job
: Unit kerja asynchronous yang diproses oleh worker.

Workspace
: Entitas organisasi. Tidak termasuk dalam MVP, tetapi desain sistem harus siap untuk mendukungnya di masa depan.

---

# 23. Platform & OS Support Roadmap

## 23.1 Desktop Platform Support

MVP

Windows 10

Windows 11

Future

macOS (Post-MVP, Phase 5)

Linux (Phase 6)

## 23.2 Mobile Support (Future)

iOS (React Native)

Android (React Native)

---

# 24. Approval

Status

Draft

Owner

Product Management

**Next Document:** [02-SRS.md](02-SRS.md)