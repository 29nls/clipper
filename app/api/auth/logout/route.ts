import { betterAuth } from '@/auth/better-auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  await betterAuth.api.signOut({
    // Redirect after sign out - home page
    // url: '/',
  });

  return NextResponse.redirect(new URL('/' + request.url));
}