/**
 * Better Auth Configuration for Clipper Web SaaS
 * Phase 1 Foundation: Email/Password, JWT, Middleware
 * 
 * This provides MVP authentication with:
 * - Email/password sign up/login
 * - Email verification
 * - Password reset
 * - JWT sessions with HttpOnly cookies
 * - Rate limiting protection
 * - Plan tracking in sessions/tokens
 * 
 * Time to MVP with this config: 3-5 days
 */

import { createBetterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/prisma-adapter';
import { prisma } from './db';

export const betterAuth = createBetterAuth({
  database: prismaAdapter(prisma),

  emailAndPassword: {
    enabled: true,
    requireEmailDomain: false,
    password: { minLength: 12 },
    sendOnSignUp: true,
    verifyEmail: true,
    sendOnPasswordReset: true,
    passwordReset: { expireIn: '15m' },
  },

  session: {
    cookie: {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  },

  rateLimit: {
    enabled: true,
    windowMs: 60 * 1000,
    max: 30,
  },

  callbacks: {
    async signIn({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
      return true;
    },

    async session({ session, user }) {
      session.user.plan = user.plan;
      session.user.credits = user.credits;
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.plan = user.plan;
        token.credits = user.credits;
      }
      return token;
    },
  },
});