import { checkRateLimit } from '@/utils/security';
import { RATE_LIMIT } from '@/constants';
import { NextResponse } from 'next/server';

export type RateLimitType = 'chat' | 'api' | 'emergency';

export function rateLimit(
  identifier: string,
  type: RateLimitType
): { success: boolean; response?: NextResponse } {
  const config = RATE_LIMIT[type];
  const key = `${type}:${identifier}`;
  const result = checkRateLimit(key, config.maxRequests, config.windowMs);

  const headers = {
    'X-RateLimit-Limit': String(config.maxRequests),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };

  if (!result.allowed) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers }
      ),
    };
  }

  return { success: true };
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'anonymous';
}
