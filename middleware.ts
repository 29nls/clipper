/**
 * Next.js Middleware for Clipper Authentication
 * Integrates Better Auth with Next.js App Router
 * 
 * Protects routes and manages auth state
 * Aligned with 09-SAAS-ARCHITECTURE.md §6 Auth Architecture
 */

import { auth } from '@/auth/better-auth';

// Export config from Better Auth for Next.js config usage
export const config = {
  matcher: [
    '/((?!_next|api|static|sitemap|robots).)*',
  ],
};

// Default middleware - protects all routes
export default auth();

// Optional: Specific route handlers
// export const GET = auth(requireAuth);
// export const POST = auth(requireAuth);

// Protected route example
// export async function GET(request: Request) {
//   const user = await auth();
//   if (!user) return new Response('Unauthorized', { status: 401 });
//   // ... handler
// }

// Public routes (no auth required)
// - /, /login, /register, /forgot-password
// - /pricing, /features, /blog, /docs
// - /about, /privacy, /terms, /download