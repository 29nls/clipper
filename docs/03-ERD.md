1. Database Philosophy
# Entity Relationship Design

Version

1.0

Status

Draft

Reference

PRD v1.0

SRS v1.0

---

# Database Principles

Database menggunakan prinsip:

- Normalized
- Modular
- Audit Friendly
- Event Ready
- High Performance
- Horizontal Ready
- UUID Primary Key
- Immutable Transaction
- Soft Delete
- Version Ready

Semua entity wajib memiliki:

id

created_at

updated_at

deleted_at

created_by

updated_by

version

status

Semua timestamp menggunakan UTC.

Semua foreign key menggunakan UUID.

Tidak ada hard delete kecuali tabel log sementara atau data yang memang memiliki kebijakan retensi khusus.
2. Database Domains

Seluruh sistem akan dibagi menjadi domain.

Authentication

↓

User

↓

Project

↓

Media

↓

AI

↓

Timeline

↓

Rendering

↓

Publishing

↓

Analytics

↓

Billing

↓

Notification

↓

System

Domain dipisahkan supaya nanti mudah menjadi microservice.

3. Database Overview

Saya membaginya menjadi sekitar 85 tabel.

Authentication
users

user_credentials

user_sessions

oauth_accounts

verification_tokens

password_reset_tokens

refresh_tokens

devices

login_history

security_events

10 tabel

User
profiles

avatars

preferences

languages

notification_settings

user_settings

export_settings

7 tabel

Project
projects

project_versions

project_settings

project_assets

project_tags

project_labels

project_history

project_bookmarks

project_recent

project_templates

10 tabel

Media
media_files

media_metadata

media_audio

media_video

media_thumbnail

media_proxy

media_waveform

uploads

upload_chunks

storage_objects

10 tabel

Transcript
transcripts

transcript_segments

transcript_words

speakers

speaker_segments

languages_detected

6 tabel

Subtitle
subtitles

subtitle_segments

subtitle_styles

subtitle_templates

subtitle_translation

5 tabel

AI
ai_jobs

ai_provider

ai_models

ai_prompt

ai_prompt_versions

ai_results

ai_metrics

ai_cost

ai_cache

ai_health

10 tabel

Timeline
timeline

timeline_tracks

timeline_clips

timeline_audio

timeline_markers

timeline_keyframes

timeline_history

7 tabel

Rendering
render_jobs

render_queue

render_presets

render_exports

render_logs

5 tabel

Publishing
social_accounts

publish_jobs

publish_history

scheduled_posts

social_tokens

5 tabel

Analytics
analytics_events

analytics_daily

analytics_monthly

analytics_ai_usage

analytics_render_usage

5 tabel

Billing
wallet

wallet_transactions

credits

subscriptions

subscription_plans

payments

payment_history

invoices

coupons

coupon_usage

10 tabel

Notification
notifications

notification_queue

notification_templates

3 tabel

System
audit_logs

system_logs

worker_logs

queue_logs

feature_flags

app_config

api_keys

system_health

8 tabel

Total

≈91 tabel

4. High Level ER Diagram
erDiagram

USER ||--o{ PROJECT : owns

PROJECT ||--o{ MEDIA_FILE : contains

MEDIA_FILE ||--o{ TRANSCRIPT : generates

TRANSCRIPT ||--o{ SUBTITLE : creates

PROJECT ||--o{ AI_JOB : executes

AI_JOB ||--|| AI_PROVIDER : uses

AI_PROVIDER ||--o{ AI_MODEL : contains

PROJECT ||--o{ TIMELINE : edits

TIMELINE ||--o{ TIMELINE_CLIP : contains

PROJECT ||--o{ RENDER_JOB : renders

RENDER_JOB ||--o{ EXPORT : creates

PROJECT ||--o{ PUBLISH_JOB : publishes

USER ||--|| WALLET : owns

WALLET ||--o{ WALLET_TRANSACTION : records

USER ||--|| SUBSCRIPTION : subscribes

USER ||--o{ NOTIFICATION : receives
5. Core Entity

Mulai sekarang kita akan mendesain setiap tabel satu per satu.

Misalnya

USER
users

id

email

username

display_name

status

created_at

updated_at

deleted_at

version

Relationship

User

↓

Projects

↓

Wallet

↓

Subscription

↓

Notification

↓

Sessions

↓

OAuth

↓

Settings
PROJECT
projects

id

owner_id

title

description

thumbnail

status

created_at

updated_at

deleted_at

Relationship

Project

↓

Media

↓

Timeline

↓

AI Job

↓

Subtitle

↓

Render

↓

Analytics
MEDIA
media_files

id

project_id

storage_id

filename

duration

fps

resolution

codec

size

checksum

created_at
AI JOB
ai_jobs

id

project_id

provider_id

model_id

job_type

priority

status

started_at

completed_at

credit_cost

actual_cost

retry_count
WALLET
wallet

id

user_id

balance

reserved_balance

currency

updated_at
SUBSCRIPTION
subscriptions

id

user_id

plan_id

status

start_date

end_date

renewal

created_at


# 6 Authentication Domain

Authentication merupakan fondasi seluruh sistem.

Seluruh login, OAuth, session, refresh token,
device, audit dan security berada pada domain ini.

---

# Table : users

Description

Master data pengguna.

Primary Key

id

Columns

id UUID PK

email VARCHAR(255)

username VARCHAR(50)

display_name VARCHAR(100)

status VARCHAR(30)

email_verified_at TIMESTAMP NULL

last_login_at TIMESTAMP NULL

created_at TIMESTAMP

updated_at TIMESTAMP

deleted_at TIMESTAMP NULL

version INTEGER

Constraints

PK

id

Unique

email

username

Check

status IN
(
'pending',
'active',
'suspended',
'deleted'
)

Indexes

email

username

status

last_login_at

Business Rules

Email wajib unik.

Username wajib unik.

Soft delete.

Related

projects

wallet

subscription

notifications

sessions

---

# Table : user_credentials

Description

Credential login.

Columns

id UUID PK

user_id UUID FK

password_hash TEXT

password_algorithm VARCHAR(50)

password_changed_at TIMESTAMP

failed_login_count INTEGER

locked_until TIMESTAMP NULL

created_at

updated_at

deleted_at

version

Foreign Key

user_id

↓

users.id

Indexes

user_id

locked_until

Business Rules

Password disimpan dalam bentuk hash.

Hash algorithm:

Argon2id.

---

# Table : user_sessions

Description

Session aktif.

Columns

id UUID PK

user_id UUID FK

refresh_token_hash TEXT

device_id UUID

ip_address INET

user_agent TEXT

expires_at TIMESTAMP

revoked_at TIMESTAMP NULL

created_at

updated_at

deleted_at

version

Indexes

user_id

expires_at

revoked_at

Business Rules

Refresh token tidak boleh disimpan plaintext.

---

# Table : oauth_accounts

Columns

id UUID

user_id UUID

provider

provider_user_id

access_token_encrypted

refresh_token_encrypted

expires_at

created_at

updated_at

deleted_at

Unique

provider

provider_user_id

Supported Provider

Google

GitHub

Future

Microsoft

Apple

Discord

---

# Table : verification_tokens

Columns

id UUID

user_id UUID

token_hash

purpose

expires_at

used_at

created_at

Business Rules

Token disimpan dalam bentuk hash.

Purpose

email_verification

phone_verification

---

# Table : password_reset_tokens

Columns

id

user_id

token_hash

expires_at

used_at

created_at

Business Rules

Expired

24 jam.

---

# Table : refresh_tokens

Description

Token rotation history.

Columns

id

session_id

token_hash

issued_at

expires_at

revoked_at

rotation_counter

Indexes

session_id

expires_at

---

# Table : devices

Description

Perangkat pengguna.

Columns

id

user_id

device_name

device_type

os

browser

fingerprint_hash

last_seen

created_at

Business Rules

Fingerprint disimpan dalam bentuk hash.

---

# Table : login_history

Columns

id

user_id

session_id

success

ip_address

country

city

device

browser

created_at

Indexes

user_id

created_at

---

# Table : security_events

Columns

id

user_id

event_type

severity

description

metadata JSONB

created_at

Severity

INFO

WARNING

HIGH

CRITICAL


# 9 Media Domain

Media Domain bertanggung jawab mengelola seluruh asset digital.

Asset meliputi:

- Original Video
- Original Audio
- Extracted Audio
- Proxy Video
- Thumbnail
- Waveform
- Metadata
- Preview
- Temporary Files

Semua file fisik berada di Object Storage.

Database hanya menyimpan metadata.

---

# Table : storage_objects

Description

Representasi seluruh file fisik.

Columns

id UUID PK

provider VARCHAR(50)

bucket VARCHAR(100)

object_key TEXT

original_filename VARCHAR(255)

mime_type VARCHAR(120)

extension VARCHAR(20)

size_bytes BIGINT

checksum_sha256 CHAR(64)

storage_class VARCHAR(50)

encryption_type VARCHAR(50)

is_public BOOLEAN

signed_url_expired_at TIMESTAMP NULL

created_at

updated_at

deleted_at

version

Indexes

provider

bucket

object_key

checksum_sha256

Business Rules

Checksum wajib unik per provider + bucket + object_key.

Object tidak boleh dihapus apabila masih direferensikan.

---

# Table : uploads

Description

Upload session.

Columns

id UUID

user_id UUID

project_id UUID

storage_object_id UUID NULL

status

upload_method

total_size

uploaded_size

total_chunks

uploaded_chunks

checksum_sha256

started_at

completed_at

cancelled_at

created_at

updated_at

Status

created

uploading

paused

completed

verified

failed

cancelled

Indexes

user_id

project_id

status

Business Rules

Resume upload wajib didukung.

---

# Table : upload_chunks

Description

Chunk upload.

Columns

id UUID

upload_id UUID

chunk_number

offset_start

offset_end

size_bytes

checksum

status

uploaded_at

Indexes

upload_id

chunk_number

Unique

upload_id

chunk_number

---

# Table : media_files

Description

Master seluruh media.

Columns

id UUID

project_id UUID

storage_object_id UUID

media_type

filename

duration_ms

status

created_at

updated_at

deleted_at

Media Type

video

audio

subtitle

image

thumbnail

proxy

waveform

Business Rules

Satu storage object dapat memiliki banyak metadata turunan.

---

# Table : media_video

Description

Metadata video.

Columns

id UUID

media_file_id UUID

width

height

fps

frame_count

codec

bitrate

pixel_format

color_space

rotation

duration_ms

has_audio

created_at

Indexes

codec

resolution

fps

---

# Table : media_audio

Description

Metadata audio.

Columns

id UUID

media_file_id UUID

codec

sample_rate

channels

bit_depth

bitrate

loudness_lufs

duration_ms

created_at

---

# Table : media_metadata

Description

Metadata umum.

Columns

id UUID

media_file_id UUID

title

description

author

camera_model

software

gps_latitude

gps_longitude

capture_date

metadata_json JSONB

created_at

---

# Table : media_proxy

Description

Proxy video.

Columns

id UUID

media_file_id UUID

proxy_storage_id UUID

resolution

codec

size_bytes

created_at

Business Rules

Proxy digunakan untuk preview timeline.

---

# Table : media_waveform

Description

Waveform audio.

Columns

id UUID

media_file_id UUID

storage_object_id UUID

sample_count

duration_ms

created_at

---

# Table : media_thumbnail

Description

Thumbnail.

Columns

id UUID

media_file_id UUID

storage_object_id UUID

thumbnail_type

width

height

generated_by_ai BOOLEAN

score NUMERIC(5,2)

created_at

Thumbnail Type

frame

ai

manual


10 Transcript Domain
# transcripts

Description

Transcript utama.

Columns

id UUID

project_id UUID

media_file_id UUID

language

provider_id

model_id

confidence_score

processing_time_ms

status

created_at

Indexes

project_id

language

---

# transcript_segments

Description

Potongan transcript.

Columns

id UUID

transcript_id UUID

segment_index

start_ms

end_ms

speaker_id

text

confidence

created_at

Indexes

transcript_id

start_ms

---

# transcript_words

Description

Word-level alignment.

Columns

id UUID

segment_id UUID

word

start_ms

end_ms

confidence

position

created_at

Business Rules

Digunakan untuk subtitle animation.

---

# speakers

Columns

id UUID

project_id UUID

speaker_label

speaker_name

voice_embedding_id NULL

created_at

---

# speaker_segments

Columns

id UUID

speaker_id UUID

segment_id UUID

start_ms

end_ms

confidence

created_at

---

# detected_languages

Columns

id UUID

transcript_id UUID

language_code

confidence

created_at

11 Subtitle Domain
# subtitles

Description

Subtitle utama.

Columns

id UUID

project_id UUID

transcript_id UUID

language

style_id

status

created_at

updated_at

---

# subtitle_segments

Columns

id UUID

subtitle_id UUID

segment_index

start_ms

end_ms

text

animation_type

position_x

position_y

created_at

Indexes

subtitle_id

start_ms

---

# subtitle_styles

Columns

id UUID

name

font_family

font_size

font_weight

font_color

background_color

outline_color

shadow

animation

created_at

---

# subtitle_templates

Columns

id UUID

template_name

description

style_json JSONB

preview_storage_id UUID

created_at

---

# subtitle_translation

Columns

id UUID

subtitle_id UUID

source_language

target_language

provider_id

status

created_at

updated_at

High Level Relationship
erDiagram

PROJECT ||--o{ MEDIA_FILE : contains

MEDIA_FILE ||--|| STORAGE_OBJECT : stored_in

MEDIA_FILE ||--|| MEDIA_VIDEO : metadata

MEDIA_FILE ||--|| MEDIA_AUDIO : metadata

MEDIA_FILE ||--o{ MEDIA_THUMBNAIL : generates

MEDIA_FILE ||--o{ MEDIA_PROXY : generates

MEDIA_FILE ||--o{ MEDIA_WAVEFORM : generates

MEDIA_FILE ||--o{ TRANSCRIPT : creates

TRANSCRIPT ||--o{ TRANSCRIPT_SEGMENT : contains

TRANSCRIPT_SEGMENT ||--o{ TRANSCRIPT_WORD : contains

TRANSCRIPT ||--o{ SPEAKER : detects

TRANSCRIPT ||--o{ DETECTED_LANGUAGES : detects

TRANSCRIPT ||--o{ SUBTITLE : generates

SUBTITLE ||--o{ SUBTITLE_SEGMENT : contains

SUBTITLE ||--|| SUBTITLE_STYLE : uses

SUBTITLE ||--o{ SUBTITLE_TRANSLATION : translates


12 AI Domain
# AI Domain

AI Domain bertanggung jawab terhadap:

- AI Provider
- AI Model Registry
- AI Routing
- Prompt Versioning
- AI Jobs
- AI Pipeline
- AI Workflow
- AI Metrics
- AI Cost
- AI Cache
- AI Health
- AI Experiment
- AI Evaluation

Seluruh AI harus melalui AI Orchestrator.

Desktop maupun Frontend tidak boleh memanggil provider AI secara langsung.
Table : ai_providers
Description

Master AI Provider.

Examples

OpenRouter

OpenCode

NVIDIA

OpenAI

Gemini

Claude

Groq

TogetherAI

Ollama

Columns

id UUID

provider_code

provider_name

provider_type

base_url

status

priority

supports_stream

supports_image

supports_audio

supports_video

supports_embedding

supports_function_call

supports_json_mode

daily_rate_limit

monthly_rate_limit

created_at

updated_at

deleted_at

version

Status

healthy

warning

degraded

offline

Indexes

provider_code

status

priority

Business Rules

Provider tidak boleh dihapus apabila masih memiliki AI Model aktif.

Table : ai_models
Description

Seluruh model AI.

Columns

id UUID

provider_id UUID

model_code

model_name

model_family

model_version

model_type

context_window

max_output_tokens

supports_stream

supports_image

supports_audio

supports_video

supports_json

supports_tool

supports_reasoning

pricing_input

pricing_output

credit_multiplier

latency_score

quality_score

cost_score

status

created_at

updated_at

Indexes

provider_id

model_family

status

Business Rules

Satu provider dapat memiliki banyak model.

Table : ai_model_capabilities
Description

Capability Matrix.

Columns

id

model_id

capability

supported

max_duration

max_file_size

notes

Capability

subtitle

translation

title

description

hashtags

thumbnail

voice_clone

dubbing

emotion

speaker

scene

viral_detection

clip_ranking

hook_detection

object_detection

ocr

embedding

reasoning

Table : ai_jobs
Description

Seluruh AI task.

Columns

id UUID

project_id UUID

user_id UUID

provider_id UUID

model_id UUID

workflow_id UUID

job_type

priority

status

input_storage_id

output_storage_id

estimated_credit

actual_credit

estimated_cost

actual_cost

queue_name

worker_id

started_at

finished_at

retry_count

error_code

error_message

created_at

updated_at

Indexes

project_id

user_id

status

queue_name

job_type

created_at

Business Rules

Semua AI Task immutable.

Update hanya diperbolehkan untuk:

status

retry_count

finished_at

error

Table : ai_workflows
Description

Workflow AI.

Examples

Subtitle

Translation

Podcast

YouTube

TikTok

Voice Clone

Columns

id

workflow_name

description

version

workflow_json

is_default

created_at

Table : ai_workflow_steps
Columns

id

workflow_id

step_number

step_name

provider_id

model_id

retry_policy

timeout

parallel

input_mapping

output_mapping

Table : ai_prompts
Description

Master Prompt.

Columns

id

prompt_code

title

category

owner

status

created_at

updated_at

Examples

TITLE_GENERATOR

DESCRIPTION_GENERATOR

HOOK_GENERATOR

THUMBNAIL_GENERATOR

Table : ai_prompt_versions
Columns

id

prompt_id

version

template

variables_json

expected_output_json

temperature

top_p

frequency_penalty

presence_penalty

created_at

Business Rules

Prompt tidak boleh di-overwrite.

Harus versioning.

Table : ai_prompt_executions
Columns

id

job_id

prompt_version_id

input_tokens

output_tokens

latency_ms

cache_hit

provider_response_id

created_at

Table : ai_results
Description

Output AI.

Columns

id

job_id

result_type

storage_object_id

json_result

confidence

quality_score

human_verified

approved

created_at

Examples

subtitle

clip

title

hashtags

description

translation

thumbnail

voice

embedding

Table : ai_metrics
Columns

id

job_id

provider_latency

queue_wait_time

worker_time

total_time

gpu_usage

cpu_usage

memory_usage

token_input

token_output

cache_hit

created_at

Table : ai_costs
Columns

id

job_id

provider_cost

platform_cost

credit_used

currency

billing_reference

created_at

Business Rules

Semua biaya immutable.

Table : ai_cache
Columns

id

cache_key

provider_id

model_id

hash

storage_object_id

expires_at

hit_count

created_at

Indexes

cache_key

expires_at

Table : ai_provider_health
Columns

id

provider_id

status

response_time

uptime

error_rate

last_checked_at

created_at

Table : ai_routing_rules
Description

Rule Engine.

Columns

id

job_type

provider_id

model_id

priority

max_cost

max_latency

fallback_provider_id

enabled

created_at

Examples

Subtitle

↓

OpenRouter

Translation

↓

OpenRouter

Voice Clone

↓

NVIDIA

Thumbnail

↓

OpenCode

Table : ai_experiments
Description

A/B Testing AI.

Columns

id

experiment_name

control_model

candidate_model

traffic_percentage

status

created_at

Future Ready

Table : ai_evaluations
Columns

id

job_id

human_score

automatic_score

feedback

reviewed_by

created_at

AI Relationship
erDiagram

AI_PROVIDER ||--o{ AI_MODEL : owns

AI_MODEL ||--o{ AI_MODEL_CAPABILITIES : supports

AI_PROVIDER ||--o{ AI_ROUTING_RULE : routes

AI_WORKFLOW ||--o{ AI_WORKFLOW_STEP : contains

AI_JOB ||--|| AI_PROVIDER : uses

AI_JOB ||--|| AI_MODEL : uses

AI_JOB ||--o{ AI_RESULT : produces

AI_JOB ||--o{ AI_METRIC : records

AI_JOB ||--o{ AI_COST : charges

AI_JOB ||--o{ AI_PROMPT_EXECUTION : executes