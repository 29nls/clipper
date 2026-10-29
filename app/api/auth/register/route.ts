import { betterAuth } from '@/auth/better-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    const result = await betterAuth.api.signUp({
      email,
      password,
      // Optional additional user data
      // data: { fullName },
    });

    return NextResponse.json({
      success: true,
      user: result.user,
      // Email verification sent asynchronously
    });
  } catch (error) {
    console.error('Registration error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      },
      { status: 400 }
    );
  }
}