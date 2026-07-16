# 08-DESKTOP-ARCHITECTURE.md

**Version:** 1.0.0
**Status:** Draft
**Reference:** PRD v1.0, SRS v1.0

---

# Table of Contents

1. [Desktop Overview](#1-desktop-overview)
2. [Electron Architecture](#2-electron-architecture)
3. [Process Model](#3-process-model)
4. [IPC Communication](#4-ipc-communication)
5. [Rendering Pipeline](#5-rendering-pipeline)
6. [FFmpeg Integration](#6-ffmpeg-integration)
7. [Offline Capabilities](#7-offline-capabilities)
8. [Auto-Update](#8-auto-update)
9. [System Requirements](#9-system-requirements)
10. [Project Structure](#10-project-structure)
11. [Security Model](#11-security-model)

---

# 1. Desktop Overview

Desktop Application adalah client utama untuk **editing cepat dan rendering lokal**. Dibangun dengan Electron + React + TypeScript.

## Key Principles

```
✓ Online-First    — Wajib login, AI via backend, sync ke cloud
✓ Local Rendering — FFmpeg berjalan di mesin user (GPU/CPU)
✓ High Performance — Memanfaatkan GPU, multi-core CPU, hardware encoding
✓ Familiar UX    — Native window, keyboard shortcuts, system tray
✓ Secure         — API key tidak pernah di client, semua AI via backend
```

## Desktop vs SaaS Responsibilities

```
┌────────────────────────┬──────────┬──────────┐
│ Capability             │ Desktop  │ SaaS     │
├────────────────────────┼──────────┼──────────┤
│ Authentication         │    ✗     │    ✓     │  (via API)
│ Project Management     │    ✓     │    ✓     │
│ Video Upload           │    ✓     │    ✓     │
│ AI Processing          │    ✗     │    ✓     │  (Desktop triggers, backend runs)
│ Timeline Editor        │    ✓     │    ✗     │
│ Local Rendering        │    ✓     │    ✗     │
│ Cloud Rendering        │    ✗     │    ✓     │
│ Subtitle Editor        │    ✓     │    ✗     │
│ Billing                │    ✗     │    ✓     │
│ Publishing             │    ✗     │    ✓     │
│ Analytics Dashboard    │    ✓     │    ✓     │
│ Notification Center    │    ✓     │    ✓     │
└────────────────────────┴──────────┴──────────┘
```

---

# 2. Electron Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    ELECTRON APPLICATION                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  MAIN PROCESS (Node.js)                │ │
│  │                                                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐     │ │
│  │  │ Window   │  │ System   │  │ FFmpeg Manager   │     │ │
│  │  │ Manager  │  │ Tray     │  │ (spawn process)  │     │ │
│  │  └──────────┘  └──────────┘  └──────────────────┘     │ │
│  │                                                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐     │ │
│  │  │ File     │  │ Auto     │  │ Hardware Detect  │     │ │
│  │  │ System   │  │ Update   │  │ (GPU, CPU, RAM)  │     │ │
│  │  └──────────┘  └──────────┘  └──────────────────┘     │ │
│  │                                                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐     │ │
│  │  │ Local    │  │ Native   │  │ Native Menu      │     │ │
│  │  │ DB/Cache │  │ Notify   │  │ & Shortcuts      │     │ │
│  │  └──────────┘  └──────────┘  └──────────────────┘     │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                        IPC Bridge                            │
│                    (contextBridge + ipcMain)                  │
│                              │                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               RENDERER PROCESS (React)                 │ │
│  │                                                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐     │ │
│  │  │ React UI │  │ State    │  │ API Client       │     │ │
│  │  │ (Vite)   │  │ (Zustand)│  │ (fetch + WS)     │     │ │
│  │  └──────────┘  └──────────┘  └──────────────────┘     │ │
│  │                                                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐     │ │
│  │  │ Timeline │  │ Video    │  │ Subtitle         │     │ │
│  │  │ Editor   │  │ Preview  │  │ Editor           │     │ │
│  │  └──────────┘  └──────────┘  └──────────────────┘     │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS / WSS
                          ▼
              ┌──────────────────────┐
              │   Backend API + WS    │
              └──────────────────────┘
```

---

# 3. Process Model

## 3.1 Main Process

```
Responsibilities:
• Window management (create, close, minimize, maximize)
• Native OS integration (menus, tray, notifications, dialogs)
• FFmpeg process spawning and management
• File system access (read, write, export)
• Hardware capability detection
• Auto-update mechanism
• Local database / cache (SQLite or LevelDB)
• IPC handler registration

Security:
• Node.js integration ENABLED (for system access)
• contextIsolation: true
• sandbox: false (main process)
```

## 3.2 Renderer Process

```
Responsibilities:
• Render React UI
• Handle user interactions
• Canvas / WebGL for video preview
• Timeline rendering
• Subtitle editing
• Communicate with backend API
• Display real-time WebSocket events

Security:
• Node.js integration: DISABLED
• contextIsolation: true
• Only access Node APIs via preload script (contextBridge)
```

## 3.3 Preload Script

```
Bridge between Main and Renderer.

Uses contextBridge to expose safe, whitelisted APIs:

window.electronAPI = {
  system: {
    getInfo()
    openExternal(url)
    showInFolder(path)
  },
  filesystem: {
    openDialog(options)
    saveFile(path, data)
    exportVideo(options)
  },
  ffmpeg: {
    startRender(config)
    cancelRender(jobId)
    getProgress()
  },
  notification: {
    show(options)
  },
  settings: {
    load()
    save(data)
  }
}
```

---

# 4. IPC Communication

## 4.1 IPC Channels

```
┌──────────────────────────────────────────────────────┐
│                   IPC CHANNELS                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  SYSTEM                                             │
│  • system:get-info         → CPU, GPU, RAM, OS      │
│  • system:check-update     → Check for app update    │
│  • system:install-update   → Download & install      │
│                                                      │
│  FILESYSTEM                                         │
│  • fs:open-dialog          → Open file picker        │
│  • fs:save-dialog          → Save file picker        │
│  • fs:read-file            → Read local file         │
│  • fs:write-file           → Write local file        │
│  • fs:export-video         → Export to folder        │
│  • fs:delete-file          → Delete temp file        │
│                                                      │
│  FFMPEG / RENDER                                    │
│  • render:start            → Start FFmpeg render     │
│  • render:cancel           → Cancel render           │
│  • render:progress         → Progress event          │
│  • render:complete         → Render finished         │
│  • render:error            → Render failed           │
│                                                      │
│  HARDWARE                                           │
│  • hw:detect-gpu           → Detect GPU encoder      │
│  • hw:get-capabilities     → Supported codecs        │
│                                                      │
│  NOTIFICATION                                       │
│  • notify:show             → Native notification     │
│  • notify:tray-update      → Update tray icon/text   │
│                                                      │
│  WINDOW                                             │
│  • window:minimize                                  │
│  • window:maximize                                  │
│  • window:close                                     │
│  • window:set-title                                 │
│                                                      │
│  SETTINGS                                           │
│  • settings:load           → Load from local store   │
│  • settings:save           → Save to local store     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## 4.2 IPC Pattern Example

```typescript
// Preload (contextBridge)
contextBridge.exposeInMainWorld('electronAPI', {
  render: {
    start: (config: RenderConfig) =>
      ipcRenderer.invoke('render:start', config),
    onProgress: (callback: (progress: number) => void) =>
      ipcRenderer.on('render:progress', (_, progress) => callback(progress)),
    cancel: (jobId: string) =>
      ipcRenderer.invoke('render:cancel', jobId),
  }
});

// Renderer (React)
const handleRender = async () => {
  await window.electronAPI.render.start(renderConfig);
};

useEffect(() => {
  window.electronAPI.render.onProgress((progress) => {
    setProgress(progress);
  });
}, []);

// Main Process (ipcMain)
ipcMain.handle('render:start', async (event, config) => {
  const job = await ffmpegManager.startRender(config);
  job.on('progress', (p) => {
    event.sender.send('render:progress', p);
  });
  return { jobId: job.id };
});
```

---

# 5. Rendering Pipeline

## 5.1 Local Render Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  LOCAL RENDER PIPELINE                    │
│                                                          │
│  User clicks "Render"                                    │
│        │                                                 │
│        ▼                                                 │
│  ┌─────────────┐                                        │
│  │ Validate    │  Check project, settings, storage       │
│  │ Settings    │                                        │
│  └──────┬──────┘                                        │
│         │                                                │
│         ▼                                                │
│  ┌─────────────┐                                        │
│  │ Detect HW   │  GPU (NVENC/QSV/AMF)? CPU cores?       │
│  │ Encoder     │                                        │
│  └──────┬──────┘                                        │
│         │                                                │
│         ▼                                                │
│  ┌─────────────┐                                        │
│  │ Build FFmpeg│  Compose command with:                 │
│  │ Command     │  • Input files                         │
│  │             │  • Filters (crop, overlay, subtitle)   │
│  │             │  • Encoder settings                    │
│  │             │  • Output format                       │
│  └──────┬──────┘                                        │
│         │                                                │
│         ▼                                                │
│  ┌─────────────┐                                        │
│  │ Spawn       │  child_process.spawn('ffmpeg', args)   │
│  │ FFmpeg      │                                        │
│  └──────┬──────┘                                        │
│         │                                                │
│         ▼                                                │
│  ┌─────────────┐   Progress   ┌──────────────┐          │
│  │ Monitor     │─────────────▶│ IPC → React  │          │
│  │ stderr      │              │ Progress Bar │          │
│  └──────┬──────┘              └──────────────┘          │
│         │                                                │
│         ▼                                                │
│  ┌─────────────┐                                        │
│  │ Complete    │  Upload result to cloud storage        │
│  │             │  Notify backend                        │
│  │             │  Show notification                     │
│  └─────────────┘                                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 5.2 Hardware Encoder Priority

```
GPU Encoding Detection Order:

1. NVIDIA NVENC (h264_nvenc, hevc_nvenc)
   └─ Check: ffmpeg -encoders | grep nvenc

2. Intel QuickSync (h264_qsv, hevc_qsv)
   └─ Check: ffmpeg -encoders | grep qsv

3. AMD AMF (h264_amf, hevc_amf)
   └─ Check: ffmpeg -encoders | grep amf

4. CPU Software (libx264, libx265, libsvtav1)
   └─ Fallback if no GPU

Decision stored in local config.
Re-checked on app startup.
```

## 5.3 Render Queue (Desktop)

```
Desktop maintains a local render queue:

  Job 1: [████████████] Rendering... 80%
  Job 2: [          ] Queued
  Job 3: [          ] Queued

Concurrent renders: max 3 (configurable)
Priority: User-selected order

If app closed mid-render:
  → Save progress state
  → On next launch, offer resume
```

---

# 6. FFmpeg Integration

## 6.1 FFmpeg Binary Management

```
┌──────────────────────────────────────────┐
│  FFmpeg Binary Bundling                  │
├──────────────────────────────────────────┤
│                                          │
│  • ffmpeg + ffprobe bundled with app    │
│  • Platform-specific binaries           │
│  • Static builds (no system dependency) │
│  • Version locked per app release       │
│                                          │
│  Location:                               │
│  Windows: resources/ffmpeg/ffmpeg.exe    │
│           resources/ffmpeg/ffprobe.exe   │
│                                          │
└──────────────────────────────────────────┘
```

## 6.2 FFmpeg Operations

```
┌──────────────────────────────────────────────────┐
│                 FFMPEG OPERATIONS                 │
├──────────────────────────────────────────────────┤
│                                                  │
│  VIDEO                                           │
│  • Trim/Cut        — -ss -to -c copy            │
│  • Merge/Concat    — concat demuxer             │
│  • Split           — segment muxer              │
│  • Crop            — crop filter                │
│  • Scale           — scale filter               │
│  • Rotate          — transpose filter           │
│  • Overlay         — overlay filter             │
│  • Watermark       — overlay with PNG           │
│                                                  │
│  SUBTITLE                                        │
│  • Burn Subtitle   — subtitles filter           │
│  • Extract Subtitle— -map stream                │
│  • Convert SRT/VTT — -f srt/webvtt              │
│                                                  │
│  AUDIO                                           │
│  • Audio Mix       — amix filter                │
│  • Volume Adjust   — volume filter              │
│  • Noise Reduce    — afftdn filter              │
│  • Loudness Norm   — loudnorm filter            │
│  • Extract Audio   — -vn -acodec                │
│                                                  │
│  METADATA                                        │
│  • Probe (ffprobe) — JSON metadata              │
│  • Thumbnail       — -ss -frames:v 1            │
│  • Waveform        — showwaves filter           │
│                                                  │
│  ENCODING                                        │
│  • H.264           — libx264 / h264_nvenc       │
│  • H.265/HEVC      — libx265 / hevc_nvenc       │
│  • AV1             — libsvtav1 / av1_nvenc      │
│  • VP9             — libvpx-vp9                 │
│                                                  │
│  CONTAINERS                                      │
│  • MP4, MOV, WEBM, MKV                          │
│                                                  │
└──────────────────────────────────────────────────┘
```

## 6.3 Example FFmpeg Command

```bash
# Render a 9:16 clip with burned subtitles, GPU encoding

ffmpeg \
  -i input.mp4 \
  -vf "crop=ih*9/16:ih,subtitles=captions.srt:force_style='FontName=Arial-Bold,FontSize=24,PrimaryColour=&Hffffff,OutlineColour=&H000000,BorderStyle=1'" \
  -c:v h264_nvenc \
  -preset p6 \
  -crf 20 \
  -b:v 8M \
  -c:a aac \
  -b:a 192k \
  -r 30 \
  -s 1080x1920 \
  -movflags +faststart \
  output_clip.mp4
```

---

# 7. Offline Capabilities

## 7.1 Online-First Model

```
The app is ONLINE-FIRST, not fully offline.

Requires internet for:
  • Authentication (login)
  • AI processing (all AI via backend)
  • Cloud sync
  • Publishing
  • Credit validation
  • Subscription check

Works offline (temporarily):
  • Timeline editing (on cached projects)
  • Local rendering (if media is available)
  • Subtitle editing
  • Export to local file
  • Settings changes

When connection lost:
  → Show offline indicator
  → Queue actions for retry
  → Auto-reconnect with exponential backoff
  → Sync on reconnect
```

## 7.2 Local Cache

```
┌──────────────────────────────────────────┐
│           LOCAL CACHE (SQLite)           │
├──────────────────────────────────────────┤
│                                          │
│  • Auth token (encrypted)               │
│  • User profile & preferences           │
│  • Recent projects (metadata only)      │
│  • Project timeline state               │
│  • Draft edits                          │
│  • Render queue                         │
│  • App settings                         │
│                                          │
│  Sync strategy:                          │
│  • Pull on app launch                    │
│  • Push on change (debounced)            │
│  • Conflict resolution: server wins     │
│                                          │
└──────────────────────────────────────────┘
```

---

# 8. Auto-Update

```
┌──────────────────────────────────────────────────────┐
│                  AUTO-UPDATE FLOW                     │
│                                                      │
│  App Launch                                          │
│      │                                               │
│      ▼                                               │
│  Check for update (GitHub Releases / S3)            │
│      │                                               │
│      ├── No update ──▶ Continue normally             │
│      │                                               │
│      └── Update available                            │
│          │                                           │
│          ▼                                           │
│      Show notification: "Update available"           │
│          │                                           │
│          ├── User clicks "Update Later"              │
│          │   └─ Remind next launch                   │
│          │                                           │
│          └── User clicks "Update Now"                │
│              │                                       │
│              ▼                                       │
│          Download update in background               │
│              │                                       │
│              ▼                                       │
│          Verify checksum                             │
│              │                                       │
│              ▼                                       │
│          Prompt: "Restart to install?"               │
│              │                                       │
│              ▼                                       │
│          Install & restart                           │
│                                                      │
└──────────────────────────────────────────────────────┘

Technology: electron-updater (electron-builder)

Update channels:
  • stable    — Production releases
  • beta      — Early access
  • nightly   — Dev builds (internal)
```

---

# 9. System Requirements

## Minimum Requirements

```
┌────────────────────┬──────────────────┐
│ Component          │ Minimum          │
├────────────────────┼──────────────────┤
│ OS                 │ Windows 10 (x64) │
│ RAM                │ 8 GB             │
│ CPU                │ 4 cores          │
│ Storage            │ 2 GB free        │
│ GPU                │ Optional         │
│ Internet           │ Required         │
│ Screen             │ 1366 x 768       │
│ .NET Runtime       │ v4.8 (bundled)   │
│ Visual C++ Redist  │ 2015-2022        │
└────────────────────┴──────────────────┘
```

## Recommended Requirements

```
┌────────────────────┬──────────────────┐
│ Component          │ Recommended      │
├────────────────────┼──────────────────┤
│ OS                 │ Windows 11 (x64) │
│ RAM                │ 16 GB            │
│ CPU                │ 8 cores          │
│ Storage            │ 10 GB SSD        │
│ GPU                │ NVIDIA RTX / Intel Arc │
│ Internet           │ Broadband 50+ Mbps    │
│ Screen             │ 1920 x 1080      │
│ Monitor            │ Dual monitor (editing)│
└────────────────────┴──────────────────┘
```

## GPU Encoding Support

```
┌─────────────────┬──────────────┬─────────────────────┐
│ GPU Brand       │ Encoder     │ Codec Support       │
├─────────────────┼──────────────┼─────────────────────┤
│ NVIDIA          │ NVENC       │ H.264, H.265, AV1   │
│ (GTX 16xx+)     │             │ (RTX 40xx for AV1)  │
├─────────────────┼──────────────┼─────────────────────┤
│ Intel           │ QuickSync   │ H.264, H.265, AV1   │
│ (iGPU 11th+)    │ (QSV)       │                     │
├─────────────────┼──────────────┼─────────────────────┤
│ AMD             │ AMF         │ H.264, H.265, AV1   │
│ (RX 6000+)      │             │ (RX 7000 for AV1)   │
├─────────────────┼──────────────┼─────────────────────┤
│ None (CPU)      │ libx264/265 │ H.264, H.265, AV1   │
│                 │ libsvtav1   │ (slower)            │
└─────────────────┴──────────────┴─────────────────────┘
```

---

# 10. Project Structure

```
desktop/
├── package.json
├── electron-builder.yml          # Build configuration
├── electron.vite.config.ts       # Vite config for Electron
├── tsconfig.json
│
├── src/
│   ├── main/                     # Main process
│   │   ├── index.ts              # Entry point
│   │   ├── window.ts             # Window manager
│   │   ├── tray.ts               # System tray
│   │   ├── menu.ts               # Native menu
│   │   ├── ipc/
│   │   │   ├── index.ts          # IPC registration
│   │   │   ├── system.ts         # System info handlers
│   │   │   ├── filesystem.ts     # File operations
│   │   │   ├── render.ts         # Render handlers
│   │   │   └── settings.ts       # Settings handlers
│   │   ├── services/
│   │   │   ├── ffmpeg.ts         # FFmpeg wrapper
│   │   │   ├── hardware.ts       # Hardware detection
│   │   │   ├── updater.ts        # Auto-update
│   │   │   └── storage.ts        # Local storage (SQLite)
│   │   └── utils/
│   │
│   ├── preload/                  # Preload scripts
│   │   ├── index.ts              # contextBridge
│   │   └── api.ts                # Exposed API types
│   │
│   ├── renderer/                 # Renderer process (React)
│   │   ├── index.html
│   │   ├── src/
│   │   │   ├── main.tsx          # React entry
│   │   │   ├── App.tsx
│   │   │   ├── pages/
│   │   │   │   ├── Login/
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── Projects/
│   │   │   │   ├── Editor/       # Timeline editor
│   │   │   │   ├── Render/
│   │   │   │   ├── Publish/
│   │   │   │   ├── Analytics/
│   │   │   │   └── Settings/
│   │   │   ├── components/
│   │   │   │   ├── Timeline/
│   │   │   │   ├── VideoPreview/
│   │   │   │   ├── SubtitleEditor/
│   │   │   │   ├── RenderQueue/
│   │   │   │   └── shared/
│   │   │   ├── stores/           # Zustand stores
│   │   │   ├── hooks/
│   │   │   ├── services/         # API client
│   │   │   ├── types/
│   │   │   └── styles/
│   │   └── tsconfig.json
│   │
│   └── shared/                   # Shared types/utilities
│       ├── types/
│       └── constants/
│
├── resources/                    # Static resources
│   ├── ffmpeg/                   # FFmpeg binaries
│   │   ├── ffmpeg.exe
│   │   └── ffprobe.exe
│   ├── icons/
│   └── fonts/
│
└── build/                        # Build output
    └── installer/
```

---

# 11. Security Model

## 11.1 Security Principles

```
✓ API keys NEVER stored in Desktop
✓ All AI requests go through backend
✓ Auth tokens stored encrypted (Electron safeStorage)
✓ contextIsolation enabled
✓ nodeIntegration disabled in renderer
✓ CSP headers enforced
✓ Sandboxed renderer process
✓ No remote module
✓ Verified FFmpeg binary (checksum)
```

## 11.2 Token Storage

```
Auth tokens stored using Electron safeStorage API:

  main process:
    safeStorage.encryptString(token) → encrypted buffer
    Store in: userData/auth.enc

  On launch:
    Read encrypted buffer
    safeStorage.decryptString() → plaintext token
    Use for API requests

  On logout:
    Delete encrypted file
    Clear in-memory token
```

## 11.3 FFmpeg Security

```
FFmpeg command injection prevention:

  • Never pass user input directly to command line
  • Use argument array (not string concatenation)
  • Validate all file paths
  • Sanitize filter strings
  • Whitelist allowed codecs/formats
  • Sandbox temp file directory
  • Clean up temp files after render
```

---

**Next Document:** [09-SAAS-ARCHITECTURE.md](09-SAAS-ARCHITECTURE.md)
