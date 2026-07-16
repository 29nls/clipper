# 10-UI-UX.md

**Version:** 1.0.0
**Status:** Draft
**Reference:** PRD v1.0, SRS v1.0

---

# Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design System](#2-design-system)
3. [Color Palette](#3-color-palette)
4. [Typography](#4-typography)
5. [Spacing & Layout](#5-spacing--layout)
6. [Components](#6-components)
7. [Desktop UI](#7-desktop-ui)
8. [Web SaaS UI](#8-web-saas-ui)
9. [Interaction Patterns](#9-interaction-patterns)
10. [Accessibility](#10-accessibility)
11. [Dark Mode](#11-dark-mode)
12. [Internationalization UI](#12-internationalization-ui)

---

# 1. Design Philosophy

## Core Principles

```
CREATOR FIRST
  UI dibuat sederhana. Tidak membutuhkan pengalaman editing profesional.
  Creator fokus pada konten, bukan tool.

AI FIRST
  Semua fitur utama menggunakan AI.
  AI results ditampilkan dengan transparansi (score, reason, confidence).

CLARITY
  Setiap screen harus memiliki satu primary action yang jelas.
  Informasi hierarki yang tegas.

PERFORMANCE
  UI harus terasa instan.
  Timeline 60 FPS. Preview 30 FPS.
  Skeleton loading. Optimistic updates.

PROFESSIONAL
  Tampil modern, clean, dan trustworthy.
  Konsistensi visual di seluruh platform.
```

---

# 2. Design System

## 2.1 Component Library

```
Foundation: shadcn/ui + Radix UI Primitives
Styling:    Tailwind CSS
Icons:      Lucide Icons
Animation:  Framer Motion
Charts:     Recharts

Design Tokens:
  • Colors (CSS custom properties)
  • Typography scale
  • Spacing scale
  • Border radius
  • Shadows
  • Animation timing
```

## 2.2 Token System

```css
:root {
  /* Colors */
  --color-primary: #6366f1;       /* Indigo 500 */
  --color-primary-hover: #4f46e5; /* Indigo 600 */
  --color-secondary: #8b5cf6;     /* Violet 500 */
  --color-accent: #ec4899;        /* Pink 500 */
  --color-success: #10b981;       /* Emerald 500 */
  --color-warning: #f59e0b;       /* Amber 500 */
  --color-error: #ef4444;         /* Red 500 */
  --color-info: #3b82f6;          /* Blue 500 */

  /* Neutral */
  --color-background: #0a0a0f;    /* Dark bg */
  --color-surface: #131320;       /* Card bg */
  --color-surface-elevated: #1c1c2e;
  --color-border: #2a2a40;
  --color-text: #e4e4e7;
  --color-text-muted: #a1a1aa;
  --color-text-subtle: #71717a;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 20px rgba(99,102,241,0.3);
}
```

---

# 3. Color Palette

## 3.1 Primary Colors

```
┌──────────────────────────────────────────────────────────┐
│                   BRAND COLOR SCALE                       │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│  Indigo  │ Violet   │ Pink     │ Emerald  │  Amber       │
│  #6366F1 │ #8B5CF6  │ #EC4899  │ #10B981  │  #F59E0B     │
│          │          │          │          │              │
│  Primary │ Accent   │ Highlight│ Success  │  Warning     │
│  Actions │ Gradient │ Scores   │ Confirm  │  Caution     │
└──────────┴──────────┴──────────┴──────────┴──────────────┘

Usage:
  Primary (Indigo)  — Main CTAs, active states, links
  Violet            — Gradients, AI badges
  Pink              — High viral scores, highlights
  Emerald           — Success states, completion
  Amber             — Warnings, medium scores
  Red               — Errors, low scores, delete
```

## 3.2 Semantic Colors

```
Score Colors (Viral Score):
  90-100:  #EC4899 (Pink)      — Excellent
  70-89:   #8B5CF6 (Violet)    — Great
  50-69:   #6366F1 (Indigo)    — Good
  30-49:   #F59E0B (Amber)     — Fair
  0-29:    #71717A (Gray)      — Low

Status Colors:
  Active/Completed:   Emerald
  Processing/Running: Indigo (with animation)
  Queued/Waiting:     Gray
  Failed/Error:       Red
  Paused:             Amber
```

---

# 4. Typography

## 4.1 Font Stack

```
Primary Font: Inter (variable)
  Weights: 400, 500, 600, 700, 800
  Used for: All UI text

Monospace: JetBrains Mono
  Weights: 400, 500
  Used for: Timecodes, code snippets, technical data

Heading Font: Inter (700-800 weight)
Body Font: Inter (400-500 weight)
```

## 4.2 Type Scale

```
┌────────────┬────────┬──────────┬────────────────────┐
│ Element    │ Size   │ Weight   │ Usage              │
├────────────┼────────┼──────────┼────────────────────┤
│ Display    │ 48px   │ 800      │ Hero headlines     │
│ H1         │ 36px   │ 700      │ Page titles        │
│ H2         │ 28px   │ 700      │ Section titles     │
│ H3         │ 22px   │ 600      │ Card titles        │
│ H4         │ 18px   │ 600      │ Subsection         │
│ Body Large │ 16px   │ 400      │ Primary content    │
│ Body       │ 14px   │ 400      │ Default text       │
│ Small      │ 12px   │ 400      │ Labels, meta       │
│ Tiny       │ 11px   │ 500      │ Badges, timestamps │
│ Mono       │ 13px   │ 400      │ Timecodes          │
└────────────┴────────┴──────────┴────────────────────┘
```

---

# 5. Spacing & Layout

## 5.1 Desktop Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Title Bar (Custom, frameless window)         [- □ ×]         │
├────────┬─────────────────────────────────────────────────────┤
│        │ Toolbar: [Save] [Undo] [Redo] | [Render] [Export]  │
│        ├─────────────────────────────────────────────────────┤
│  Side  │  ┌─────────────────────┐  ┌──────────────────────┐ │
│  Nav   │  │                     │  │  Properties Panel    │ │
│        │  │   Video Preview     │  │  • Clip info         │ │
│  ┌──┐  │  │   (16:9 or 9:16)   │  │  • Subtitle style    │ │
│  │🏠│  │  │                     │  │  • AI settings       │ │
│  ├──┤  │  │   [Play/Pause]      │  │  • Export settings   │ │
│  │📁│  │  │   00:15 / 01:00    │  │                      │ │
│  ├──┤  │  └─────────────────────┘  └──────────────────────┘ │
│  │🎬│  │  ┌───────────────────────────────────────────────┐ │
│  ├──┤  │  │ TIMELINE                                     │ │
│  │✂️ │  │  │ ──[Video Track]───────────────────────────── │ │
│  ├──┤  │  │ ──[Audio Track]───────────────────────────── │ │
│  │📤│  │  │ ──[Subtitle Track]────────────────────────── │ │
│  ├──┤  │  │ ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮ │ │
│  │📊│  │  └───────────────────────────────────────────────┘ │
│  ├──┤  │                                                     │
│  │⚙️ │  │  Status Bar: GPU: RTX 4070 | CPU: 32% | RAM: 8GB  │
│  └──┘  │                                                     │
└────────┴─────────────────────────────────────────────────────┘

Sidebar: 64px collapsed, 240px expanded
Preview: Flexible (maintains aspect ratio)
Properties: 320px fixed
Timeline: Flexible height (min 200px)
```

## 5.2 Web SaaS Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo]  AI Video Clipper        [Credits: 500]  [👤 Avatar] │
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│ Sidebar  │              Main Content Area                    │
│          │                                                   │
│ 📊 Dash  │  ┌─────────────────────────────────────────────┐  │
│ 📁 Proj  │  │  Page Header (Title + Actions)              │  │
│ 🎬 Clips │  ├─────────────────────────────────────────────┤  │
│ ✂️ Edit  │  │                                             │  │
│ 🎨 Style │  │  Content (Cards, Tables, Charts)            │  │
│ 📤 Pub   │  │                                             │  │
│ 💳 Bill  │  │                                             │  │
│ 📊 Anal  │  │                                             │  │
│ ⚙️ Set   │  └─────────────────────────────────────────────┘  │
│          │                                                   │
│ [Download│                                                   │
│  Desktop]│                                                   │
└──────────┴───────────────────────────────────────────────────┘

Sidebar: 256px (collapsible to 72px on mobile)
Content: Max-width 1400px, centered
Padding: 24px
```

---

# 6. Components

## 6.1 Core Components

```
BUTTONS
  ┌──────────────────────────────────────────────┐
  │  Primary:    [  Render Clip  ]  (filled)     │
  │  Secondary:  [  Cancel  ]       (outline)    │
  │  Ghost:      [  Skip  ]         (text only)  │
  │  Danger:     [  Delete  ]       (red filled) │
  │  Icon:       [⚙️] [📤] [🔍]                  │
  │                                               │
  │  Sizes: sm (32px) | md (40px) | lg (48px)   │
  │  States: default | hover | active | disabled │
  │  Loading: spinner + disabled                 │
  └──────────────────────────────────────────────┘

CARDS
  Project Card:
  ┌─────────────────────────┐
  │  [Thumbnail Image]       │
  │                          │
  │  Podcast Episode #1      │
  │  15 clips • 8 renders    │
  │  ● Ready    2 hours ago  │
  └─────────────────────────┘

  Clip Card (with viral score):
  ┌─────────────────────────┐
  │           ┌────┐        │
  │  [Preview]│ 92 │        │
  │           └────┘        │
  │  "This changed..."      │
  │  0:42 · 9:16 · TikTok   │
  │  [Edit] [Render] [Pub]  │
  └─────────────────────────┘

BADGES
  ┌────────┐ ┌────────┐ ┌────────┐
  │ ●Ready │ │⟳Proc..│ │⚠Failed│
  └────────┘ └────────┘ └────────┘
  Emerald    Indigo     Red

INPUTS
  Text:    [_________________]
  Search:  [🔍 Search projects___]
  Select:  [TikTok           ▾]
  Toggle:  [●——] (on)  [——○] (off)
  Slider:  [━━━━●━━━━━━━━━] 0.7
  Upload:  [📁 Drop video here]

MODALS / DIALOGS
  Center overlay with backdrop blur
  Max-width: 500px (sm) | 700px (md) | 900px (lg)
  Closeable: X button, Escape key, backdrop click

TOAST NOTIFICATIONS
  ┌──────────────────────────────────┐
  │  ✅ Render Complete              │
  │  Your clip has been rendered.    │
  │                        [View]    │
  └──────────────────────────────────┘
  Position: Bottom-right (desktop), Top (mobile)
  Auto-dismiss: 5 seconds
```

## 6.2 Specialized Components

```
VIRAL SCORE BADGE
  Visual indicator of clip quality
  Color-coded circle with number (0-100)
  Animated count-up on first display

PROGRESS BAR (AI Pipeline)
  ┌─────────────────────────────────────────────┐
  │  AI Pipeline                                 │
  │  ━━━━━━━━━━━━━━━━━━●──────────────────────  │
  │  Step 4/14: Speaker Detection                │
  │  ████████████████░░░░░░░░░░░░░░░░ 28%       │
  └─────────────────────────────────────────────┘

TIMELINE COMPONENT
  Multi-track timeline with:
  • Drag-to-move clips
  • Resize handles
  • Snap-to-grid
  • Playhead scrubber
  • Zoom in/out
  • Keyboard navigation

SUBTITLE PREVIEW
  Real-time preview of subtitle overlay on video
  Editable text inline
  Style customization panel

CREDIT METER
  ┌──────────────────────────────┐
  │  Credits: ████████░░  480    │
  │  Used: 520 / 1000 this month │
  └──────────────────────────────┘
```

---

# 7. Desktop UI

## 7.1 Desktop-Specific UI Patterns

```
NATIVE WINDOW CONTROLS
  Custom title bar with traffic lights
  Frameless window with rounded corners
  Snapping: full, left, right

SYSTEM TRAY
  Icon in system tray
  Right-click menu: Open, Quick Render, Settings, Quit
  Badge: notification count

NATIVE MENUS
  File: New Project, Open, Save, Export, Quit
  Edit: Undo, Redo, Cut, Copy, Paste
  View: Zoom In/Out, Full Screen
  Render: Start, Cancel, Batch
  Help: Documentation, Check Updates, About

KEYBOARD SHORTCUTS
  ┌────────────────┬──────────────────┐
  │ Action         │ Shortcut         │
  ├────────────────┼──────────────────┤
  │ New Project    │ Ctrl+N           │
  │ Open Project   │ Ctrl+O           │
  │ Save           │ Ctrl+S           │
  │ Undo           │ Ctrl+Z           │
  │ Redo           │ Ctrl+Y           │
  │ Play/Pause     │ Space            │
  │ Split Clip     │ S                │
  │ Delete Clip    │ Delete           │
  │ Render         │ Ctrl+R           │
  │ Export         │ Ctrl+E           │
  │ Zoom In        │ +                │
  │ Zoom Out       │ -                │
  │ Fit Timeline   │ 0                │
  │ Fullscreen     │ F11              │
  │ Settings       │ Ctrl+,           │
  └────────────────┴──────────────────┘

DRAG & DROP
  • Drag video file → app window to create project
  • Drag clip → timeline to position
  • Drag subtitle → video preview to reposition
  • Drag export → folder to save
```

---

# 8. Web SaaS UI

## 8.1 Landing Page

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo] AI Clipper    Features  Pricing  Blog  [Login] [Start│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│              Turn Long Videos into                           │
│              VIRAL SHORTS with AI                            │
│                                                              │
│         One platform. Dozens of clips. Zero editing.         │
│                                                              │
│         [Get Started Free]    [Watch Demo]                   │
│                                                              │
│              No credit card required                         │
│                                                              │
│         ┌─────────────────────────────────┐                  │
│         │    [Demo Video / Animation]      │                  │
│         │    Showing the workflow          │                  │
│         └─────────────────────────────────┘                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  How It Works                                                │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │ Upload │→ │   AI   │→ │  Edit  │→ │ Publish│            │
│  │ Video  │  │Process │  │ & Render│  │ To All │            │
│  └────────┘  └────────┘  └────────┘  └────────┘            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Features                                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ 🎯 Viral    │ │ 📝 Auto     │ │ 🎨 AI       │           │
│  │ Detection   │ │ Subtitle    │ │ Thumbnail   │           │
│  ├─────────────┤ ├─────────────┤ ├─────────────┤           │
│  │ 🗣️ Speaker  │ │ 📱 Auto     │ │ 🌍 Multi    │           │
│  │ Detection   │ │ Reframe     │ │ Language    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Pricing                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Free    │ │ Starter  │ │   Pro    │ │Business  │       │
│  │  $0/mo   │ │  $9/mo   │ │  $29/mo  │ │ $99/mo   │       │
│  │ 100 cr   │ │ 500 cr   │ │ 2000 cr  │ │ 5000 cr  │       │
│  │[Get Now] │ │[Choose]  │ │[Popular] │ │[Choose]  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Footer: Links | Privacy | Terms | Social                    │
└──────────────────────────────────────────────────────────────┘
```

## 8.2 Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  Welcome back, Creator!                    [Download Desktop] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Credits  │ │ Plan     │ │ Renders  │ │ AI Jobs  │        │
│  │   480    │ │   Pro    │ │   12     │ │   45     │        │
│  │ this mo  │ │ Active   │ │ this mo  │ │ this mo  │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
│  ┌─────────────────────────────┐ ┌──────────────────────┐   │
│  │ Recent Projects              │ │ Rendering Queue      │   │
│  │ ┌─────────────────────────┐ │ │                      │   │
│  │ │ [Thumb] Podcast #1       │ │ │ Job 1 [████░░] 65%  │   │
│  │ │ 15 clips · Ready         │ │ │ Job 2 [░░░░░░] Que. │   │
│  │ └─────────────────────────┘ │ │ Job 3 [░░░░░░] Que. │   │
│  │ ┌─────────────────────────┐ │ │                      │   │
│  │ │ [Thumb] Interview       │ │ └──────────────────────┘   │
│  │ │ 8 clips · Processing    │ │                            │
│  │ └─────────────────────────┘ │ ┌──────────────────────┐   │
│  │ [New Project]               │ │ Credit Usage Chart   │   │
│  └─────────────────────────────┘ │ [Bar chart]          │   │
│                                  └──────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

# 9. Interaction Patterns

## 9.1 Loading States

```
SKELETON (initial load)
  ┌──────────────────────────────┐
  │  ░░░░░░░░░░░░░░░░░░░░░░░░░  │  (shimmer animation)
  │  ░░░░░░░░░░░░░░░░░░░░        │
  │  ░░░░░░░░                    │
  └──────────────────────────────┘

SPINNER (inline action)
  [⟳ Processing...]

PROGRESS (determinate)
  AI Pipeline: ████████████░░░░░░░░ 65%
  Step 9/14: Subtitle Generation

PROGRESS (indeterminate)
  Connecting to AI Provider...
  ━━━━━━━━━━━━━━━━━━━━━━━ (animated)

PARTIAL LOADING (streaming)
  Content renders progressively as data arrives
  Suspense boundaries show skeletons per section
```

## 9.2 Empty States

```
NO PROJECTS:
  ┌──────────────────────────────┐
  │         📁                   │
  │                              │
  │    No projects yet           │
  │                              │
  │  Upload your first video to  │
  │    get started               │
  │                              │
  │  [+ New Project]             │
  └──────────────────────────────┘

NO CREDITS:
  ┌──────────────────────────────┐
  │         ⚡                   │
  │                              │
  │    Out of credits            │
  │                              │
  │  Buy more credits or upgrade │
  │  your plan                   │
  │                              │
  │  [Buy Credits] [Upgrade]     │
  └──────────────────────────────┘

NO NOTIFICATIONS:
  ┌──────────────────────────────┐
  │         🔔                   │
  │                              │
  │    You're all caught up      │
  │                              │
  └──────────────────────────────┘
```

## 9.3 Confirmation Patterns

```
DESTRUCTIVE ACTIONS:
  Modal dialog with:
  • Clear warning text
  • Red confirm button
  • Cancel as default focus

  Example:
  ┌──────────────────────────────┐
  │  ⚠️ Delete Project?           │
  │                              │
  │  This will permanently       │
  │  remove "Podcast #1" and all │
  │  its clips. This cannot be   │
  │  undone.                     │
  │                              │
  │  Type project name to        │
  │  confirm: [____________]     │
  │                              │
  │  [Cancel]      [Delete]      │
  └──────────────────────────────┘
```

---

# 10. Accessibility

## WCAG 2.1 AA Compliance

```
VISUAL
  • Color contrast ratio ≥ 4.5:1 (normal text)
  • Color contrast ratio ≥ 3:1 (large text)
  • Color contrast ratio ≥ 3:1 (UI components)
  • Don't rely on color alone (add icons/labels)

KEYBOARD
  • All interactive elements keyboard accessible
  • Visible focus indicators
  • Logical tab order
  • Escape closes modals/dropdowns
  • Enter/Space activates buttons

SCREEN READER (Future)
  • Semantic HTML
  • ARIA labels where needed
  • Alt text on images
  • Live regions for dynamic content

MOTION
  • Respect prefers-reduced-motion
  • Essential animations only
  • No auto-playing video with sound

COGNITIVE
  • Clear, concise text
  • Consistent navigation
  • Error prevention (confirm destructive)
  • Helpful error messages
```

---

# 11. Dark Mode

## Theme Strategy

```
DEFAULT: Dark Mode (primary)
  Content creators work in dark environments.
  Dark mode reduces eye strain during long editing sessions.

LIGHT MODE: Available
  Toggle in settings.
  System preference detection.

Implementation:
  • CSS custom properties (variable theming)
  • Tailwind dark: variant
  • Persist preference in localStorage
  • Sync across desktop + web

Dark Mode Colors:
  Background:  #0A0A0F (near-black)
  Surface:     #131320 (dark navy)
  Elevated:    #1C1C2E
  Border:      #2A2A40
  Text:        #E4E4E7
  Muted Text:  #A1A1AA

Light Mode Colors:
  Background:  #FAFAFA
  Surface:     #FFFFFF
  Elevated:    #F4F4F5
  Border:      #E4E4E7
  Text:        #18181B
  Muted Text:  #71717A
```

---

# 12. Internationalization UI

## Supported Languages

```
MVP:
  • English (en) — Default
  • Indonesia (id)

Future:
  • Spanish (es)
  • Portuguese (pt)
  • Japanese (ja)
  • Korean (ko)
  • Chinese (zh)
```

## UI Considerations

```
TEXT EXPANSION
  Some languages are 30-40% longer than English.
  Design buttons and labels with flexible width.

DATE/TIME
  • Format per locale (moment/date-fns)
  • Timezone per user preference

CURRENCY
  • Display in user's preferred currency
  • Multi-currency support (future)

RTL (Right-to-Left)
  • Arabic, Hebrew support (future)
  • Layout mirroring
```

---

**Next Document:** [11-ADMIN-PANEL.md](11-ADMIN-PANEL.md)
