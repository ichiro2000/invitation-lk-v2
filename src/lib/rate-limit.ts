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
