// IN-PROCESS rate limiter. The counter lives in a per-instance Map, so the
// limits below apply *per server instance*, not cluster-wide. Today the app
// runs single-instance on DO App Platform so this is fine. Before scaling
// horizontally (instance_count > 1), swap this for a Redis-backed limiter
// or the protection degrades to limit × N instances in the wild.
//
// Call sites pass a token like `stripe:${userId}:${ip}`. Prefer IDs over
// IPs — `x-forwarded-for` is spoofable — and parse only the first hop via
// `firstForwardedIp()` below so a comma-injected header doesn't give an
// attacker a fresh bucket per request.
const rateLimit = (options: { interval: number; uniqueTokenPerInterval: number }) => {
  const tokenCache = new Map<string, { count: number; resetTime: number }>();
  return {
    check: (limit: number, token: string): { success: boolean; remaining: number } => {
      const now = Date.now();
      const record = tokenCache.get(token);
      if (!record || now > record.resetTime) {
        tokenCache.set(token, { count: 1, resetTime: now + options.interval });
        // Evict expired entries periodically
        if (tokenCache.size > options.uniqueTokenPerInterval) {
          for (const [key, val] of tokenCache) {
            if (now > val.resetTime) tokenCache.delete(key);
          }
        }
        return { success: true, remaining: limit - 1 };
      }
      if (record.count >= limit) return { success: false, remaining: 0 };
      record.count++;
      return { success: true, remaining: limit - record.count };
    },
  };
};

// 5 attempts per minute for auth endpoints
export const authLimiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });

// 3 attempts per hour for email-sending endpoints
export const emailLimiter = rateLimit({ interval: 3_600_000, uniqueTokenPerInterval: 500 });

// 10 checkout attempts per minute per token (user id or ip) — protects against
// double-clicks spraying PENDING orders and against scripted abuse.
export const checkoutLimiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });

// Pull the first hop out of `x-forwarded-for`. DO App Platform appends to
// the header, so the rightmost entry is the trusted edge and the leftmost
// is the client (possibly spoofed by the client before it reached the
// edge). We take the leftmost-after-trim because the *client* IP is what
// we want to key on — but ignore any commas the client might have sent in
// their own header to try to fork themselves a new bucket.
export function firstForwardedIp(headerValue: string | null | undefined): string {
  if (!headerValue) return "unknown";
  const [first] = headerValue.split(",");
  const trimmed = first?.trim() || "";
  return trimmed || "unknown";
}
