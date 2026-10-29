import { betterAuth } from '@/auth/better-auth';
import { NextResponse } from 'next/api'; // Note: this might need adjustment

export async function GET(request: Request) {
  try {
    const result = await betterAuth.api.refreshSession();

    return NextResponse.json({
      success: true,
      user: result.user,
      // New session cookie set by Better Auth
    });
  } catch (error) {
    console.error('Refresh session error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh session',
      },
      { status: 401 }
    );
  }
}