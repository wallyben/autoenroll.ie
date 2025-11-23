import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'AutoEnroll.ie API is running',
    timestamp: new Date().toISOString(),
    port: 3000,
    endpoints: {
      health: '/api/health',
      magicLink: '/api/auth/magic-link (POST)',
      verify: '/api/auth/verify (GET)',
    },
  });
}
