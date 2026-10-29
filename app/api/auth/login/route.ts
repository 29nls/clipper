import { betterAuth } from '@/auth/better-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const result = await betterAuth.api.signInEmailPassword({
      identifier: email,
      password,
    });

    return NextResponse.json({
      success: true,
      user: result.user,
      // Session cookie is set in response by Better Auth
      // Redirect URL can be determined from context
    });
  } catch (error) {
    console.error('Login error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      },
      { status: 401 }
    );
  }
}