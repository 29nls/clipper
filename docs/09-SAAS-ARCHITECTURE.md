# 09-SAAS-ARCHITECTURE.md

**Version:** 1.0.0
**Status:** Draft
**Reference:** PRD v1.0, SRS v1.0

---

# Table of Contents

1. [SaaS Overview](#1-saas-overview)
2. [Next.js Architecture](#2-nextjs-architecture)
3. [Application Pages](#3-application-pages)
4. [Public vs Authenticated Areas](#4-public-vs-authenticated-areas)
5. [State Management](#5-state-management)
6. [Authentication Flow](#6-authentication-flow)
7. [Data Fetching Strategy](#7-data-fetching-strategy)
8. [Real-Time Updates](#8-real-time-updates)
9. [SEO & Marketing Pages](#9-seo--marketing-pages)
10. [Performance Optimization](#10-performance-optimization)
11. [Project Structure](#11-project-structure)

---

# 1. SaaS Overview

Web SaaS adalah **cloud control center** untuk akun pengguna, billing, analytics, dan manajemen cloud rendering. Dibangun dengan Next.js 14 App Router + React + TypeScript.

## SaaS Responsibilities

```
┌────────────────────────────────────────────────────┐
│                  WEB SAAS SCOPE                     │
├────────────────────────────────────────────────────┤
│                                                    │
│  MARKETING (Public)                                │
│  • Landing page                                   │
│  • Pricing                                        │
│  • Documentation                                  │
│  • Blog                                           │
│  • Feature pages                                  │
│                                                    │
│  ACCOUNT MANAGEMENT                               │
│  • Registration / Login                           │
│  • Profile management                             │
│  • Subscription management                        │
│  • Credit purchase                                │
│  • Billing & invoices                             │
│  • API key management                             │
│                                                    │
│  DASHBOARD                                         │
│  • Project overview                               │
│  • Recent activity                                │
│  • Credit usage                                   │
│  • Rendering queue                                │
│  • Notifications                                  │
│                                                    │
│  PROJECT MANAGEMENT                               │
│  • Create / delete projects                       │
│  • Upload media (cloud)                           │
│  • View AI results                                │
│  • View clips & scores                            │
│  • Cloud rendering                                │
│  • Publishing                                     │
│                                                    │
│  ANALYTICS                                         │
│  • Usage statistics                               │
│  • Credit consumption                             │
│  • AI provider usage                              │
│  • Render statistics                              │
│  • Export reports                                 │
│                                                    │
│  NOT SUPPORTED (Use Desktop)                      │
│  • Timeline editing                               │
│  • Subtitle editing                               │
│  • Local rendering                                │
│  • FFmpeg operations                              │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

# 2. Next.js Architecture

## 2.1 App Router Structure

```
Next.js 14+ App Router with:

• Server Components (default)  — data fetching, no JS shipped
• Client Components            — interactivity, state, effects
• Route Handlers               — API endpoints (BFF pattern)
• Server Actions               — form mutations
• Middleware                   — auth, redirects, locale
• Streaming                    — Suspense for progressive loading
```

## 2.2 Rendering Strategy

```
┌──────────────────────────────────────────────────────────┐
│                  RENDERING STRATEGY                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Static Site Generation (SSG)                            │
│  • Landing page                                         │
│  • Pricing                                              │
│  • Documentation                                        │
│  • Blog posts                                           │
│  • Privacy Policy, Terms                                │
│                                                          │
│  Server-Side Rendering (SSR)                             │
│  • Dashboard (auth required)                            │
│  • Project pages                                        │
│  • Billing pages                                        │
│  • Analytics                                            │
│                                                          │
│  Incremental Static Regeneration (ISR)                   │
│  • Blog (revalidate: 3600)                              │
│  • Feature pages (revalidate: 3600)                     │
│                                                          │
│  Client-Side Rendering (CSR)                             │
│  • Interactive dashboard widgets                        │
│  • Real-time data (WebSocket)                           │
│  • Charts and graphs                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

# 3. Application Pages

## 3.1 Complete Page Map

```
/                               Landing page (SSG)
/pricing                        Pricing page (SSG)
/features                       Features overview (SSG)
/blog                           Blog list (SSG)
/blog/[slug]                    Blog post (ISR)
/docs                           Documentation home (SSG)
/docs/[...slug]                 Doc page (SSG)
/about                          About page (SSG)
/privacy                        Privacy Policy (SSG)
/terms                          Terms of Service (SSG)

─ AUTHENTICATED ─────────────────────────────────────────

/login                          Login page (SSG, CSR form)
/register                       Registration page (SSG, CSR form)
/forgot-password                Forgot password (SSG)
/reset-password                 Reset password (SSG)
/oauth/callback                 OAuth handler

/dashboard                      Dashboard overview (SSR)
/projects                       Projects list (SSR)
/projects/[id]                  Project detail (SSR)
/projects/[id]/clips            Clip review (SSR)
/projects/[id]/media            Media management (SSR)
/projects/[id]/render           Cloud render queue (SSR)
/projects/[id]/publish          Publishing (SSR)

/billing                        Billing overview (SSR)
/billing/plans                  Plan selection (SSR)
/billing/credits                Credit purchase (SSR)
/billing/invoices               Invoice history (SSR)
/billing/payment-methods        Payment management (SSR)

/analytics                      Analytics dashboard (SSR)
/analytics/usage                Usage details (SSR)
/analytics/ai                   AI usage (SSR)

/settings                       Account settings (SSR)
/settings/profile               Profile (SSR)
/settings/preferences           Preferences (SSR)
/settings/notifications         Notification settings (SSR)
/settings/security              Security settings (SSR)
/settings/api-keys              API key management (SSR)
/settings/sessions              Active sessions (SSR)

/notifications                  Notification center (SSR)
/download                       Desktop app download (SSG)
```

---

# 4. Public vs Authenticated Areas

## 4.1 Middleware Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/', '/login', '/register', '/forgot-password',
  '/pricing', '/features', '/blog', '/docs',
  '/about', '/privacy', '/terms', '/download'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  const isPublic = PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  if (!isPublic && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublic && token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

---

# 5. State Management

## 5.1 State Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  SERVER STATE (TanStack Query)                           │
│  • User profile                                         │
│  • Projects list                                        │
│  • Billing data                                         │
│  • Analytics                                            │
│  • Auto-refetch, cache, optimistic updates              │
│                                                          │
│  CLIENT STATE (Zustand)                                  │
│  • UI state (sidebar, theme, modals)                    │
│  • Selected items                                       │
│  • Toast notifications                                  │
│  • WebSocket connection state                           │
│                                                          │
│  URL STATE (next/navigation)                             │
│  • Current page                                         │
│  • Filters and sorting                                  │
│  • Selected project/clip                               │
│                                                          │
│  FORM STATE (React Hook Form + Zod)                      │
│  • Login/register forms                                 │
│  • Settings forms                                       │
│  • Billing forms                                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 5.2 TanStack Query Setup

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,           // 1 minute
      gcTime: 5 * 60 * 1000,          // 5 minutes
      retry: 3,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys
export const queryKeys = {
  user: ['user'] as const,
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  billing: ['billing'] as const,
  analytics: ['analytics'] as const,
};
```

---

# 6. Authentication Flow

## 6.1 Auth Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  LOGIN                                                   │
│  1. User submits credentials                            │
│  2. Next.js Server Action calls backend API             │
│  3. Backend returns access_token + refresh_token        │
│  4. Server Action sets HTTP-only cookies                │
│  5. Redirect to /dashboard                              │
│                                                          │
│  SUBSEQUENT REQUESTS                                     │
│  1. Middleware reads cookie                             │
│  2. Server Components use cookie for API calls          │
│  3. Token auto-refreshed if expired                     │
│                                                          │
│  TOKEN REFRESH                                           │
│  1. API call returns 401                                │
│  2. Interceptor calls /auth/refresh with refresh_token  │
│  3. New tokens set in cookies                           │
│  4. Original request retried                            │
│                                                          │
│  LOGOUT                                                  │
│  1. Call /auth/logout                                   │
│  2. Clear cookies                                       │
│  3. Clear client cache                                  │
│  4. Redirect to /login                                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 6.2 Cookie-Based Token Storage

```typescript
// Server Action: login
'use server';

import { cookies } from 'next/headers';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  const { accessToken, refreshToken } = await response.json();

  cookies().set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,              // 15 minutes
    path: '/',
  });

  cookies().set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,   // 30 days
    path: '/',
  });

  redirect('/dashboard');
}
```

---

# 7. Data Fetching Strategy

## 7.1 Server Components (Default)

```typescript
// app/dashboard/page.tsx
import { cookies } from 'next/headers';

async function getDashboardData(token: string) {
  const res = await fetch(`${API_URL}/analytics/overview`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0, tags: ['dashboard'] },
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export default async function DashboardPage() {
  const token = cookies().get('access_token')?.value;
  const data = await getDashboardData(token);

  return (
    <DashboardLayout>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards data={data} />
      </Suspense>
    </DashboardLayout>
  );
}
```

## 7.2 Client-Side Fetching

```typescript
// components/ProjectsList.tsx
'use client';

import { useQuery } from '@tanstack/react-query';

export function ProjectsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => apiClient.get('/projects'),
  });

  if (isLoading) return <ProjectSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="grid grid-cols-3 gap-6">
      {data.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

## 7.3 Optimistic Updates

```typescript
// Mutations with optimistic update
const deleteMutation = useMutation({
  mutationFn: (id: string) => apiClient.delete(`/projects/${id}`),
  onMutate: async (deletedId) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.projects });
    const previous = queryClient.getQueryData(queryKeys.projects);
    queryClient.setQueryData(queryKeys.projects, (old) =>
      old.filter(p => p.id !== deletedId)
    );
    return { previous };
  },
  onError: (err, deletedId, context) => {
    queryClient.setQueryData(queryKeys.projects, context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects });
  },
});
```

---

# 8. Real-Time Updates

## 8.1 WebSocket Integration

```typescript
// hooks/useWebSocket.ts
'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}?token=${getToken()}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const { event: eventName, data } = JSON.parse(event.data);

      switch (eventName) {
        case 'job.completed':
          queryClient.invalidateQueries({ queryKey: ['ai-jobs'] });
          toast({ title: 'Job Complete', description: data.message });
          break;

        case 'job.progress':
          // Update progress bar in real-time
          updateJobProgress(data.jobId, data.progress);
          break;

        case 'render.progress':
          queryClient.invalidateQueries({ queryKey: ['render-jobs'] });
          break;

        case 'notification.created':
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          break;

        case 'upload.progress':
          updateUploadProgress(data.uploadId, data.progress);
          break;
      }
    };

    ws.onclose = () => {
      // Reconnect with exponential backoff
      setTimeout(() => reconnect(), 1000);
    };

    return () => ws.close();
  }, [queryClient]);

  return wsRef;
}
```

## 8.2 Real-Time Features

```
┌──────────────────────────────────────────────────────┐
│                  REAL-TIME FEATURES                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  JOB PROGRESS                                       │
│  • AI pipeline progress bar (live)                  │
│  • Render progress (live FPS counter)               │
│  • Upload progress                                  │
│                                                      │
│  NOTIFICATIONS                                      │
│  • Toast notifications (instant)                    │
│  • Notification badge counter                       │
│  • Notification dropdown (live)                     │
│                                                      │
│  DASHBOARD UPDATES                                  │
│  • Auto-refresh stats when job completes            │
│  • Live credit balance update                       │
│  • Queue position updates                           │
│                                                      │
│  COLLABORATION (Future)                             │
│  • Multi-user project editing                       │
│  • Presence indicators                              │
│  • Real-time cursor positions                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

# 9. SEO & Marketing Pages

## 9.1 Metadata Strategy

```typescript
// app/layout.tsx
export const metadata = {
  title: {
    default: 'AI Video Clipper — Turn Long Videos into Viral Shorts',
    template: '%s | AI Video Clipper',
  },
  description: 'Transform your long videos into dozens of AI-powered short clips...',
  keywords: ['video clipper', 'AI video editing', 'shorts generator', ...],
  openGraph: {
    title: 'AI Video Clipper',
    description: '...',
    images: ['/og-image.png'],
    url: 'https://aivideoclipper.com',
  },
  twitter: {
    card: 'summary_large_image',
  },
};
```

## 9.2 Performance for SEO

```
Marketing pages optimized for:
  • Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
  • SSG for instant load
  • Image optimization (next/image)
  • Font optimization (next/font)
  • Minimal client-side JS
  • Structured data (JSON-LD)
  • Sitemap generation
  • robots.txt
```

---

# 10. Performance Optimization

## 10.1 Optimization Techniques

```
┌──────────────────────────────────────────────────────┐
│               PERFORMANCE OPTIMIZATION                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  BUNDLING                                           │
│  • Route-level code splitting                       │
│  • Dynamic imports for heavy components             │
│  • Tree shaking                                     │
│  • Only ship needed polyfills                      │
│                                                      │
│  CACHING                                            │
│  • React Query cache (client)                       │
│  • Next.js Data Cache (server)                      │
│  • Full Route Cache (static pages)                  │
│  • CDN edge caching                                 │
│                                                      │
│  IMAGES                                             │
│  • next/image with automatic optimization           │
│  • WebP/AVIF formats                                │
│  • Responsive sizes                                 │
│  • Lazy loading                                     │
│                                                      │
│  FONTS                                              │
│  • next/font (self-hosted)                          │
│  • Variable fonts                                   │
│  • font-display: swap                               │
│                                                      │
│  DATA                                               │
│  • Prefetch on hover                                │
│  • Stale-while-revalidate                           │
│  • Pagination (no over-fetching)                    │
│  • Skeleton loading states                          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

# 11. Project Structure

```
web/                               # Next.js SaaS application
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
│
├── app/                           # App Router
│   ├── (marketing)/               # Public route group
│   │   ├── page.tsx               # Landing page
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   ├── features/
│   │   │   └── page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── docs/
│   │   └── about/
│   │
│   ├── (auth)/                    # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   │
│   ├── (app)/                     # Authenticated route group
│   │   ├── layout.tsx             # Dashboard layout (sidebar, header)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── clips/
│   │   │       ├── media/
│   │   │       ├── render/
│   │   │       └── publish/
│   │   ├── billing/
│   │   │   ├── page.tsx
│   │   │   ├── plans/
│   │   │   ├── credits/
│   │   │   └── invoices/
│   │   ├── analytics/
│   │   │   ├── page.tsx
│   │   │   ├── usage/
│   │   │   └── ai/
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   ├── profile/
│   │   │   ├── preferences/
│   │   │   ├── security/
│   │   │   ├── api-keys/
│   │   │   └── sessions/
│   │   └── notifications/
│   │       └── page.tsx
│   │
│   ├── api/                       # Route Handlers (BFF)
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── refresh/route.ts
│   │   │   └── logout/route.ts
│   │   └── proxy/                 # Proxy to backend API
│   │
│   ├── layout.tsx                 # Root layout
│   ├── globals.css
│   ├── not-found.tsx
│   └── error.tsx
│
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── marketing/                 # Landing page components
│   ├── dashboard/                 # Dashboard widgets
│   ├── projects/                  # Project components
│   ├── billing/                   # Billing components
│   ├── analytics/                 # Charts, graphs
│   └── shared/                    # Shared components
│
├── lib/
│   ├── api-client.ts              # Backend API client
│   ├── auth.ts                    # Auth utilities
│   ├── query-client.ts            # TanStack Query config
│   ├── utils.ts                   # Utility functions
│   └── constants.ts
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-websocket.ts
│   ├── use-toast.ts
│   └── use-media-query.ts
│
├── stores/                        # Zustand stores
│   ├── ui-store.ts
│   └── notification-store.ts
│
├── types/
│   ├── api.ts                     # API response types
│   ├── models.ts                  # Domain models
│   └── index.ts
│
├── middleware.ts                  # Auth middleware
│
└── public/
    ├── images/
    ├── icons/
    └── og-images/
```

---

**Next Document:** [10-UI-UX.md](10-UI-UX.md)
