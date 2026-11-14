/** Tiny in-memory sliding window rate limit (per process). */

type Bucket = number[];

const buckets = new Map<string, Bucket>();

export function takeRateLimitToken(
  key: string,
  opts: { limit: number; windowMs: number },
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const windowStart = now - opts.windowMs;
  const prev = buckets.get(key) ?? [];
  const recent = prev.filter((t) => t >= windowStart);
  if (recent.length >= opts.limit) {
    const oldest = recent[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + opts.windowMs - now) / 1000));
    buckets.set(key, recent);
    return { ok: false, retryAfterSec };
  }
  recent.push(now);
  buckets.set(key, recent);
  return { ok: true };
}
