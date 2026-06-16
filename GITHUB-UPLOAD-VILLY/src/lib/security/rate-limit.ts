type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;
let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 60_000;

function sweepExpired(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS && buckets.size < MAX_BUCKETS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

/** In-memory sliding window limiter — suitable for single-instance Docker. */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  sweepExpired(now);

  let bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return { allowed: true };
}

export const RATE_LIMITS = {
  adminLogin: { limit: 5, windowMs: 15 * 60 * 1000 },
  booking: { limit: 3, windowMs: 60 * 60 * 1000 },
  gdprRequest: { limit: 3, windowMs: 60 * 60 * 1000 },
  gdprRequestEmail: { limit: 2, windowMs: 24 * 60 * 60 * 1000 },
  gdprConsent: { limit: 30, windowMs: 60 * 60 * 1000 },
  chat: { limit: 20, windowMs: 60 * 1000 },
  i18nDictionary: { limit: 60, windowMs: 60 * 1000 },
  i18nTranslate: { limit: 24, windowMs: 60 * 1000 },
  health: { limit: 30, windowMs: 60 * 1000 },
  weather: { limit: 60, windowMs: 60 * 1000 },
  i18nBlog: { limit: 60, windowMs: 60 * 1000 },
} as const;
