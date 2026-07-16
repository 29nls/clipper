# 06-AI-PIPELINE.md

**Version:** 1.0.0
**Status:** Draft
**Reference:** PRD v1.0, SRS v1.0

---

# Table of Contents

1. [AI Pipeline Overview](#1-ai-pipeline-overview)
2. [AI Orchestrator](#2-ai-orchestrator)
3. [Provider Abstraction](#3-provider-abstraction)
4. [Pipeline Stages](#4-pipeline-stages)
5. [Job Lifecycle](#5-job-lifecycle)
6. [Queue Strategy](#6-queue-strategy)
7. [Retry & Fallback](#7-retry--fallback)
8. [Cache Strategy](#8-cache-strategy)
9. [Cost Engine](#9-cost-engine)
10. [Prompt Management](#10-prompt-management)
11. [Health Monitoring](#11-health-monitoring)
12. [Metrics & Observability](#12-metrics--observability)

---

# 1. AI Pipeline Overview

AI Pipeline adalah inti dari platform yang mengubah video panjang menjadi short clips berkualitas tinggi. Pipeline berjalan secara **asynchronous** dan **fully managed** oleh AI Orchestrator.

## Core Principle

```
> AI adalah layanan (service), bukan bagian yang tertanam di UI.

Desktop/SaaS hanya mengetahui:
  • Request AI
  • Progress
  • Result

AI Orchestrator menangani:
  • Provider selection
  • Model selection
  • Retry
  • Fallback
  • Cache
  • Cost calculation
  • Credit deduction
  • Monitoring
```

## Pipeline Flow

```
Video Upload
      │
      ▼
┌─────────────────┐
│  Metadata       │  ← Extract video/audio info (FFprobe)
│  Extraction     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Speech         │  ← Transcribe audio to text
│  Recognition    │  ← Language detection
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Scene          │  ← Detect scene changes
│  Detection      │  ← Identify visual segments
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Speaker        │  ← Identify who is speaking
│  Detection      │  ← Diarization
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Face Tracking  │  ← Track faces for auto-reframe
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Emotion        │  ← Analyze emotional tone
│  Analysis       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Silence        │  ← Remove dead air
│  Detection      │  ← Detect filler words
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Hook           │  ← Find attention-grabbing moments
│  Detection      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Viral          │  ← Score clips 0-100
│  Detection      │  ← Rank by viral potential
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Clip           │  ← Generate clip boundaries
│  Generation     │  ← Auto-reframe to 9:16 / 1:1
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Subtitle       │  ← Generate captions
│  Generation     │  ← Word-level timing
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Translation    │  ← Multi-language subtitles (optional)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Content        │  ← Title, Description, Hashtags
│  Generation     │  ← Emoji suggestions
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Thumbnail      │  ← AI-generated thumbnail options
│  Generation     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  READY FOR      │  ← Clips displayed to user
│  REVIEW         │  ← User edits/approves
└────────┬────────┘
         │
         ▼
    [Render + Publish]
```

---

# 2. AI Orchestrator

## 2.1 Responsibilities

```
┌──────────────────────────────────────────────────────┐
│                 AI ORCHESTRATOR                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. RECEIVE REQUEST                                  │
│     • From API Server (user-initiated)               │
│     • From Pipeline (chained jobs)                   │
│                                                      │
│  2. VALIDATE                                         │
│     • Check user credits                             │
│     • Check rate limits                              │
│     • Check job dependencies                         │
│                                                      │
│  3. ROUTE                                            │
│     • Select provider (rule engine)                  │
│     • Select model                                   │
│     • Check routing rules                            │
│                                                      │
│  4. ESTIMATE                                         │
│     • Calculate estimated cost                       │
│     • Calculate estimated credits                    │
│     • Reserve credits (if needed)                    │
│                                                      │
│  5. CACHE CHECK                                      │
│     • Hash input parameters                          │
│     • Check cache hit                                │
│     • Return cached result if available              │
│                                                      │
│  6. EXECUTE                                          │
│     • Send to provider                               │
│     • Monitor timeout                                │
│     • Stream progress                                │
│                                                      │
│  7. HANDLE RESULT                                    │
│     • Validate response                              │
│     • Store result                                   │
│     • Cache result                                   │
│     • Deduct credits                                 │
│     • Record metrics                                 │
│                                                      │
│  8. ERROR HANDLING                                   │
│     • Retry on failure                               │
│     • Fallback to alternate provider                 │
│     • Refund credits on failure                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## 2.2 Orchestrator Architecture

```
┌───────────────────────────────────────────────────────────┐
│                   AI ORCHESTRATOR                          │
│                                                           │
│   ┌────────────┐   ┌────────────┐   ┌────────────┐       │
│   │   Router   │   │   Prompt   │   │  Credit    │       │
│   │   Engine   │   │   Engine   │   │  Engine    │       │
│   └──────┬─────┘   └──────┬─────┘   └──────┬─────┘       │
│          │                │                 │              │
│   ┌──────▼────────────────▼─────────────────▼─────┐       │
│   │              EXECUTION ENGINE                  │       │
│   └──────┬─────────────────────────────────┬──────┘       │
│          │                                 │              │
│   ┌──────▼─────┐                    ┌──────▼─────┐        │
│   │   Cache    │                    │  Fallback  │        │
│   │   Engine   │                    │  Manager   │        │
│   └────────────┘                    └────────────┘        │
│                                                           │
└───────────────────────────────────────────────────────────┘
                            │
                            ▼
               ┌────────────────────────┐
               │   PROVIDER ROUTER      │
               │                        │
               │  ┌──────────────────┐  │
               │  │  OpenRouter      │  │
               │  ├──────────────────┤  │
               │  │  NVIDIA          │  │
               │  ├──────────────────┤  │
               │  │  OpenCode        │  │
               │  ├──────────────────┤  │
               │  │  Future: OpenAI, │  │
               │  │  Claude, Gemini  │  │
               │  └──────────────────┘  │
               └────────────────────────┘
```

---

# 3. Provider Abstraction

## 3.1 Provider Interface

Setiap provider harus mengimplementasikan interface yang sama:

```typescript
interface IAIProvider {
  // Lifecycle
  initialize(): Promise<void>;
  healthCheck(): Promise<HealthStatus>;
  shutdown(): Promise<void>;

  // Text / LLM
  generateText(prompt: string, options: LLMOptions): Promise<TextResult>;
  generateTextStream(prompt: string, options: LLMOptions): AsyncGenerator<string>;

  // Speech
  transcribe(audio: AudioInput, options: TranscribeOptions): Promise<TranscriptResult>;
  detectLanguage(audio: AudioInput): Promise<LanguageResult>;

  // Vision
  detectScene(video: VideoInput): Promise<SceneResult[]>;
  detectFace(video: VideoInput): Promise<FaceResult[]>;
  detectObject(video: VideoInput): Promise<ObjectResult[]>;
  generateThumbnail(video: VideoInput, options: ThumbnailOptions): Promise<ThumbnailResult>;

  // Audio Processing
  detectSpeaker(audio: AudioInput): Promise<SpeakerResult[]>;
  voiceClone(source: AudioInput, target: VoiceTarget): Promise<VoiceResult>;
  dubbing(audio: AudioInput, targetLang: string): Promise<DubbingResult>;
  noiseReduction(audio: AudioInput): Promise<AudioResult>;

  // Translation
  translate(text: string, source: string, target: string): Promise<TranslationResult>;

  // Cost
  estimateCost(operation: AIOperation, params: any): Promise<CostEstimate>;
}
```

## 3.2 Supported Providers (MVP)

| Provider | Code | Type | Strengths |
|----------|------|------|-----------|
| OpenRouter | `openrouter` | LLM Gateway | Multi-model, cost-effective |
| NVIDIA | `nvidia` | AI Platform | GPU-accelerated, voice/vision |
| OpenCode | `opencode` | Code/LLM | Fast inference |

## 3.3 Future Providers

```
• OpenAI       (GPT, Whisper, DALL-E)
• Anthropic    (Claude)
• Google       (Gemini)
• Groq         (Ultra-fast inference)
• TogetherAI   (Open-source models)
• Cohere       (NLP focused)
• Azure OpenAI (Enterprise)
• AWS Bedrock  (Multi-model)
• Vertex AI    (Google Cloud)
• Ollama       (Local models)
```

## 3.4 Provider Selection Modes

```
AUTOMATIC
  └─ AI Orchestrator selects best provider based on:
     • Capability matrix
     • Health status
     • Cost
     • Latency
     • Quality score

MANUAL
  └─ User explicitly selects provider per job type
     • Set in preferences
     • Override per project

HYBRID (Default)
  └─ Rule Engine applies user preferences first,
     falls back to automatic selection
```

---

# 4. Pipeline Stages

## Stage 1: Metadata Extraction

```
Input:  Video file (from storage)
Output: media_video, media_audio, media_metadata records

Process:
  1. FFprobe extract container info
  2. Extract video stream metadata (codec, fps, resolution, bitrate)
  3. Extract audio stream metadata (codec, sample rate, channels)
  4. Extract general metadata (duration, author, GPS)

Cost: 0 credits (system operation)
```

## Stage 2: Speech Recognition (Transcription)

```
Input:  Audio track from video
Output: transcript + transcript_segments + transcript_words

Process:
  1. Extract audio from video (if needed)
  2. Detect language(s)
  3. Send to STT provider (Whisper-family)
  4. Receive word-level timestamps
  5. Segment into logical chunks
  6. Calculate confidence scores

Quality Target: WER < 10%

Credit Cost: ~5 credits per 10 minutes of audio
```

## Stage 3: Scene Detection

```
Input:  Video file
Output: Scene boundaries with timestamps

Process:
  1. Sample frames at regular intervals
  2. Detect scene cuts (histogram comparison)
  3. Identify B-roll vs A-roll
  4. Tag scene types (talking head, landscape, action)

Credit Cost: ~3 credits
```

## Stage 4: Speaker Detection (Diarization)

```
Input:  Audio track + transcript
Output: speakers + speaker_segments

Process:
  1. Extract voice embeddings
  2. Cluster similar voices
  3. Assign speaker labels
  4. Map to transcript segments

Credit Cost: ~5 credits
```

## Stage 5: Face Tracking

```
Input:  Video file
Output: Face bounding boxes per frame

Process:
  1. Detect faces in keyframes
  2. Track across frames
  3. Identify primary speaker face
  4. Generate tracking data for auto-reframe

Used by: Auto-Reframe (9:16, 1:1 crop)

Credit Cost: ~5 credits
```

## Stage 6: Emotion Analysis

```
Input:  Transcript + audio
Output: Emotion timeline

Process:
  1. Analyze text sentiment
  2. Analyze audio tone
  3. Classify emotions (excited, sad, angry, funny, etc.)
  4. Mark high-energy moments

Used by: Viral Detection (exciting = more viral)

Credit Cost: ~3 credits
```

## Stage 7: Silence & Filler Detection

```
Input:  Audio track + transcript
Output: Silence segments, filler word timestamps

Process:
  1. Detect silence > 500ms
  2. Detect filler words ("um", "uh", "like")
  3. Mark for potential removal
  4. Calculate talk density

Credit Cost: ~2 credits
```

## Stage 8: Hook Detection

```
Input:  Transcript + emotion timeline
Output: Hook scores per segment

Process:
  1. Identify strong opening statements
  2. Detect questions, surprising facts
  3. Pattern match against viral hooks
  4. Score each segment's hook potential (0-1)

Credit Cost: ~3 credits
```

## Stage 9: Viral Detection & Clip Ranking

```
Input:  All previous outputs
Output: Clip candidates with scores (0-100)

Process:
  1. Combine signals:
     • Hook strength
     • Emotion intensity
     • Talk density
     • Scene quality
     • Duration fit (15-60s for shorts)
  2. Generate clip boundaries
  3. Score each clip (0-100)
  4. Provide ranking reason
  5. Sort by score descending

Credit Cost: ~5 credits
```

## Stage 10: Auto-Reframe

```
Input:  Video + face tracking data
Output: Cropped video segments (9:16, 1:1, 16:9)

Process:
  1. Use face tracking to keep speaker centered
  2. Apply smooth camera movement
  3. Crop to target aspect ratio
  4. Maintain subject in frame

Aspect Ratios: 9:16 (TikTok/Reels), 1:1 (Instagram), 16:9 (YouTube)

Credit Cost: ~5 credits
```

## Stage 11: Subtitle Generation

```
Input:  Transcript with word-level timestamps
Output: subtitles + subtitle_segments

Process:
  1. Group words into subtitle lines (max 42 chars)
  2. Calculate optimal display duration
  3. Position subtitles
  4. Assign animation type
  5. Apply default style

Formats: SRT, VTT, JSON (internal)

Credit Cost: ~2 credits
```

## Stage 12: Translation (Optional)

```
Input:  Subtitle in source language
Output: subtitle_translation records

Process:
  1. Translate subtitle segments
  2. Preserve timing
  3. Maintain context across segments
  4. Quality check

Credit Cost: ~3 credits per target language
```

## Stage 13: Content Generation

```
Input:  Transcript + clip metadata
Output: Title, Description, Hashtags, Emojis

Process:
  1. Generate 3-5 title options per clip
  2. Generate SEO-optimized description
  3. Generate relevant hashtags
  4. Suggest emojis
  5. Generate hook text for caption

Credit Cost: ~3 credits
```

## Stage 14: Thumbnail Generation

```
Input:  Video clip + transcript
Output: Thumbnail candidates

Process:
  1. Select high-quality frames
  2. Apply text overlay with title
  3. Generate AI-enhanced thumbnails
  4. Score each thumbnail
  5. Return top 3-5 options

Credit Cost: ~2 credits
```

---

# 5. Job Lifecycle

```
                    ┌──────────┐
                    │ CREATED  │ ← Job record created in DB
                    └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
                    │  QUEUED  │ ← Added to BullMQ queue
                    └────┬─────┘
                         │
                         ▼
              ┌──────────────────┐
              │ WAITING_WORKER   │ ← In queue, no worker assigned
              └────┬─────────────┘
                   │
                   ▼
              ┌──────────┐
              │ RUNNING  │ ← Worker picked up, executing
              └────┬─────┘
                   │
          ┌────────┼────────┐
          │        │        │
          ▼        ▼        ▼
     ┌────────┐ ┌──────┐ ┌──────────┐
     │RETRY   │ │COMPL.│ │ FAILED   │
     └───┬────┘ └──────┘ └────┬─────┘
         │                     │
         │ (max 3)             │
         ▼                     ▼
     ┌──────────┐        ┌──────────┐
     │ RUNNING  │        │CANCELLED │
     └──────────┘        └──────────┘
                         ┌──────────┐
                         │ ARCHIVED │ ← After retention period
                         └──────────┘
```

## State Transitions

```
created    → queued
queued     → waiting_worker
waiting    → running
running    → completed | failed | cancelled | retry
retry      → queued (re-enqueue)
failed     → archived (after TTL)
completed  → archived (after TTL)
```

---

# 6. Queue Strategy

## 6.1 Queue Topology

```
┌─────────────────────────────────────────────────┐
│                  REDIS + BULLMQ                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────┐  Priority: HIGH            │
│  │ Priority Queue  │  • Paid users              │
│  │ (paid users)    │  • Enterprise              │
│  └─────────────────┘                            │
│                                                 │
│  ┌─────────────────┐  Priority: NORMAL          │
│  │ Standard Queue  │  • Free users              │
│  │ (free users)    │  • Background jobs         │
│  └─────────────────┘                            │
│                                                 │
│  ┌─────────────────┐                            │
│  │ Render Queue    │  • Video encoding jobs     │
│  └─────────────────┘                            │
│                                                 │
│  ┌─────────────────┐                            │
│  │ Upload Queue    │  • Chunk merge             │
│  └─────────────────┘                            │
│                                                 │
│  ┌─────────────────┐                            │
│  │ Publish Queue   │  • Social media upload     │
│  └─────────────────┘                            │
│                                                 │
│  ┌─────────────────┐                            │
│  │ Notif Queue     │  • Email, push             │
│  └─────────────────┘                            │
│                                                 │
│  ┌─────────────────┐                            │
│  │ Cleanup Queue   │  • Temp file removal       │
│  └─────────────────┘                            │
│                                                 │
│  ┌─────────────────┐                            │
│  │ Analytics Queue │  • Event aggregation       │
│  └─────────────────┘                            │
│                                                 │
│  ┌─────────────────┐                            │
│  │ Dead Letter Q   │  • Failed after max retry  │
│  └─────────────────┘                            │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 6.2 Concurrency Control

```
Worker Concurrency Limits:
• AI Worker:        max 5 concurrent jobs per instance
• Render Worker:    max 2 concurrent jobs (CPU intensive)
• Upload Worker:    max 10 concurrent jobs
• Publish Worker:   max 3 concurrent jobs
• Notif Worker:     max 20 concurrent jobs

User-level Limits (by subscription):
• Free:     1 concurrent AI job
• Starter:  3 concurrent AI jobs
• Pro:      5 concurrent AI jobs
• Business: 10 concurrent AI jobs
```

---

# 7. Retry & Fallback

## 7.1 Retry Policy

```
Step 1: Retry on same provider
  ┌─────────┐     ┌─────────┐     ┌─────────┐
  │ Attempt │────▶│ Attempt │────▶│ Attempt │
  │    1    │     │    2    │     │    3    │
  └─────────┘     └─────────┘     └────┬────┘
                                      │
                                      │ If still failing
                                      ▼
Step 2: Fallback to alternate provider
                              ┌─────────────────┐
                              │ Fallback Provider│
                              │ (from rule)      │
                              └────────┬────────┘
                                       │
                                       │ If still failing
                                       ▼
                              ┌─────────────────┐
                              │ Mark as FAILED  │
                              │ Refund credits  │
                              │ Notify user     │
                              └─────────────────┘
```

## 7.2 Backoff Strategy

```
Exponential Backoff with Jitter:

  Retry 1: wait  1s ± random(0-500ms)
  Retry 2: wait  2s ± random(0-500ms)
  Retry 3: wait  4s ± random(0-500ms)
  Fallback: immediate switch

Non-retryable errors:
  • Validation errors
  • Insufficient credits
  • Unsupported format
  • Authentication errors
```

## 7.3 Fallback Chain

```
Example: Subtitle Generation

  Primary:    OpenRouter (Whisper)
      │
      │ Fail
      ▼
  Fallback 1: NVIDIA (Parakeet)
      │
      │ Fail
      ▼
  Fallback 2: OpenCode
      │
      │ Fail
      ▼
  FAILED → Refund credits → Notify user

Fallback rules stored in: ai_routing_rules table
```

---

# 8. Cache Strategy

## 8.1 Cacheable Operations

```
Operation          Cache Key (hash)              TTL
──────────────────────────────────────────────────────────
Transcript         sha256(audio_hash + lang)    30 days
Subtitle           sha256(transcript + style)   7 days
Translation        sha256(text + src + tgt)     30 days
Thumbnail          sha256(frame + params)       7 days
Title/Desc         sha256(transcript + prompt)  24 hours
Provider Response  sha256(prompt + model)       24 hours
```

## 8.2 Cache Flow

```
Request
   │
   ▼
┌──────────────┐     HIT     ┌──────────────┐
│  Hash Input  │────────────▶│ Return Cache │
└──────┬───────┘             └──────────────┘
       │ MISS
       ▼
┌──────────────┐
│  Check Redis │──── HIT ────▶ Return
└──────┬───────┘
       │ MISS
       ▼
┌──────────────┐
│  Check DB    │──── HIT ────▶ Write Redis ──▶ Return
│  (ai_cache)  │
└──────┬───────┘
       │ MISS
       ▼
┌──────────────┐
│  Execute AI  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Store Cache  │──▶ Redis + DB
└──────────────┘
       │
       ▼
   Return Result
```

---

# 9. Cost Engine

## 9.1 Cost Estimation Flow

```
Before Execution:
┌──────────────────────────────────┐
│  Input Parameters                │
│  • Job type                      │
│  • Media duration                │
│  • Provider                      │
│  • Model                         │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  Estimate                        │
│  • Token count (for LLM)         │
│  • Duration (for STT)            │
│  • Frames (for vision)           │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  Calculate                       │
│  • Provider cost (USD)           │
│  • Credit cost                   │
│  • Estimated runtime             │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  Validate Credits                │
│  • User has enough?              │
│  • Reserve if yes                │
│  • Reject if no                  │
└──────────────────────────────────┘
```

## 9.2 Credit Consumption Rules

```
Credit IS deducted when:
  ✓ Job status = COMPLETED
  ✓ Job status = PARTIALLY_COMPLETED (per policy)

Credit IS NOT deducted when:
  ✗ Job created (pending)
  ✗ Job failed (refunded)
  ✗ Job cancelled by user
  ✗ Cache hit (no new processing)

Credit IS refunded when:
  ✓ Job failed after retries
  ✓ Provider error (not user fault)
  ✓ Job cancelled before execution
```

## 9.3 Example Credit Costs

```
┌────────────────────────┬──────────┬───────────────────┐
│ Operation              │ Credits  │ Notes             │
├────────────────────────┼──────────┼───────────────────┤
│ Speech Recognition     │    5     │ per 10 min audio  │
│ Subtitle Generation    │    2     │ per clip          │
│ Subtitle Translation   │    3     │ per language      │
│ Scene Detection        │    3     │ per video         │
│ Speaker Detection      │    5     │ per video         │
│ Face Tracking          │    5     │ per video         │
│ Emotion Analysis       │    3     │ per video         │
│ Silence Detection      │    2     │ per video         │
│ Hook Detection         │    3     │ per video         │
│ Viral Detection        │    5     │ per video         │
│ Clip Ranking           │    0     │ included          │
│ Auto-Reframe           │    5     │ per clip          │
│ Title Generation       │    1     │ per clip          │
│ Description Generation │    1     │ per clip          │
│ Hashtag Generation     │    1     │ per clip          │
│ Thumbnail Generation   │    2     │ per clip          │
│ Voice Clone            │   20     │ per use           │
│ Voice Dubbing          │   15     │ per clip          │
│ Noise Reduction        │    3     │ per clip          │
│ Rendering              │   10     │ per clip          │
│ Publishing             │    0     │ free              │
└────────────────────────┴──────────┴───────────────────┘

NOTE: Values are configurable via admin panel, stored in app_config.
```

---

# 10. Prompt Management

## 10.1 Prompt Structure

```
Prompt tidak boleh hardcode di source code.

Setiap prompt memiliki:
┌──────────────────────────────────────────┐
│  PROMPT METADATA                         │
│  • prompt_code (unique identifier)       │
│  • title                                  │
│  • category                               │
│  • owner                                  │
│  • status (active/draft/archived)        │
├──────────────────────────────────────────┤
│  PROMPT VERSION                           │
│  • version number                         │
│  • template (with {{variables}})          │
│  • variables_json                         │
│  • expected_output_json                   │
│  • temperature                            │
│  • top_p                                  │
│  • frequency_penalty                      │
│  • presence_penalty                       │
└──────────────────────────────────────────┘
```

## 10.2 Example Prompts

```
TITLE_GENERATOR (v3)
─────────────────────────────────────────────
Template:
  "You are a viral content title generator.
   Given this transcript segment, generate 3 catchy titles
   for a {{platform}} short video.

   Rules:
   - Maximum 60 characters
   - Include emotional trigger
   - No clickbait
   - Include relevant keywords

   Transcript: {{transcript}}
   Platform: {{platform}}
   Tone: {{tone}}

   Respond in JSON: {titles: [string, string, string]}"

Variables: {transcript, platform, tone}
Temperature: 0.8
Expected Output: {titles: ["...", "...", "..."]}
```

## 10.3 Prompt Versioning Rules

```
• Prompts are IMMUTABLE once published
• New version = new record (never overwrite)
• Version is locked to job execution
• A/B testing supported via experiments
• Rollback = point to previous version
```

---

# 11. Health Monitoring

## 11.1 Provider Health States

```
┌──────────────────────────────────────────────┐
│              HEALTHY                         │
│  • Response time < threshold                 │
│  • Error rate < 1%                           │
│  • All endpoints responding                  │
├──────────────────────────────────────────────┤
│              WARNING                         │
│  • Response time elevated                    │
│  • Error rate 1-5%                           │
│  • Some degradation                          │
├──────────────────────────────────────────────┤
│              DEGRADED                        │
│  • Response time very high                   │
│  • Error rate 5-15%                          │
│  • Fallback being used                       │
├──────────────────────────────────────────────┤
│              OFFLINE                         │
│  • No response                               │
│  • Error rate > 15%                          │
│  • Provider unreachable                      │
│  • All traffic routed to fallback            │
└──────────────────────────────────────────────┘
```

## 11.2 Health Check Process

```
Every 60 seconds (configurable):

  FOR each provider:
    1. Send test request (lightweight)
    2. Measure response time
    3. Record success/failure
    4. Calculate rolling error rate (last 100 requests)
    5. Update provider status
    6. If status changed → emit event

  Actions on status change:
    healthy → offline   : Route all traffic to fallback
    offline → healthy   : Gradually restore traffic (canary)
```

---

# 12. Metrics & Observability

## 12.1 Metrics Per Job

```
Every AI job records:

  PERFORMANCE
  • provider_latency_ms    — time waiting for provider
  • queue_wait_time_ms     — time in queue
  • worker_time_ms         — total worker processing time
  • total_time_ms          — end-to-end

  RESOURCES
  • gpu_usage_percent
  • cpu_usage_percent
  • memory_usage_mb

  TOKENS
  • input_tokens
  • output_tokens

  COST
  • provider_cost_usd
  • platform_cost_usd
  • credits_used

  QUALITY
  • confidence_score
  • quality_score
  • cache_hit (bool)

  RELIABILITY
  • retry_count
  • fallback_used (bool)
  • success (bool)
```

## 12.2 Aggregate Metrics

```
Dashboard Metrics (admin):
  • Jobs per minute (by type)
  • Average latency (by provider, by type)
  • Error rate (by provider, by type)
  • Cache hit rate
  • Credit consumption rate
  • Cost per job (by type)
  • Provider market share (% of jobs)
  • Queue depth
  • Worker utilization

User Metrics:
  • Credits used (daily/monthly)
  • AI jobs run (by type)
  • Average processing time
  • Success rate
```

## 12.3 Design Principles

```
All AI must satisfy:
  ✓ Provider-independent
  ✓ Asynchronous
  ✓ Observable
  ✓ Cost-aware
  ✓ Secure
  ✓ Retryable
  ✓ Cacheable
  ✓ Versioned
  ✓ Extensible
  ✓ Testable
```

---

**Next Document:** [07-REST-API.md](07-REST-API.md)
