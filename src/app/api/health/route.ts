import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: Date.now(),
    services: {
      gemini: !!process.env.GEMINI_API_KEY,
      firebase: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      maps: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  });
}
