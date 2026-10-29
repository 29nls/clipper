import { betterAuth } from '@/auth/better-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password, token } = await request.json();

    await betterAuth.api.resetPassword({
      password,
      token,
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset password',
      },
      { status: 400 }
    );
  }
}