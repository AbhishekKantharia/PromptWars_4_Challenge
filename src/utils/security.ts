const RATE_LIMIT_STORE = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = RATE_LIMIT_STORE.get(key);

  if (!record || now > record.resetAt) {
    RATE_LIMIT_STORE.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now\s+(a|an)/i,
  /system\s*:\s*/i,
  /act\s+as\s+if/i,
  /pretend\s+you\s+are/i,
  /disregard\s+(all|any|your)/i,
  /override\s+(your|the|all)/i,
  /new\s+instructions?\s*:/i,
  /forget\s+(everything|all)/i,
  /\[INST\]/i,
  /<\|im_start\|>/i,
  /\/elevate/i,
];

export function detectPromptInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 2000);
}

export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function validateOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.some((allowed) => origin === allowed || origin.endsWith(`.${new URL(allowed).hostname}`));
}
