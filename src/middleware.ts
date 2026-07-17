import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(self)');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );

  if (pathname.startsWith('/api/') && !pathname.includes('/health')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      `https://${host}`,
      'https://smart-stadium-2026.vercel.app',
      'https://fifa-stadiumiq-2026.firebaseapp.com',
      'https://fifa-stadiumiq-2026.web.app',
    ];
    if (origin && !allowedOrigins.includes(origin) && !origin.endsWith('.vercel.app')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let matchedOrigin = allowedOrigins.find(o => o === origin);
    if (!matchedOrigin && origin?.endsWith('.vercel.app')) {
      matchedOrigin = origin;
    }
    if (!matchedOrigin) {
      matchedOrigin = allowedOrigins[1]; // fallback to https://${host}
    }
    response.headers.set('Access-Control-Allow-Origin', matchedOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
