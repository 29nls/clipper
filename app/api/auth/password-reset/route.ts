import { betterAuth } from '@/auth/better-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    await betterAuth.api.forgotPassword({
      identifier: email,
    });

    // Always return success for security (don't leak existence)
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate password reset',
      },
      { status: 500 }
    );
  }
}