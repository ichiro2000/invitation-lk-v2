import Stripe from "stripe";

// Stripe credentials live in DO env vars (STRIPE_SECRET_KEY,
// STRIPE_WEBHOOK_SECRET) — never the DB. See /admin/settings for the
// feature flag + env-status indicator.
//
// Returns null (not throws) when the secret key isn't set so callers can
// render a clean "disabled" state instead of a 500. The checkout route
// turns that into a 503 with a user-friendly message.
let cachedClient: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (cachedClient !== undefined) return cachedClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    cachedClient = null;
    return null;
  }
  cachedClient = new Stripe(key);
  return cachedClient;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function isStripeWebhookConfigured(): boolean {
  return !!process.env.STRIPE_WEBHOOK_SECRET;
}

// "sk_test_..." vs "sk_live_..." — surfaced in admin Settings so an admin
// doesn't have to eyeball the raw key to tell which mode they're in.
export function getStripeMode(): "test" | "live" | null {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (key.startsWith("sk_test_")) return "test";
  if (key.startsWith("sk_live_")) return "live";
  return null;
}

// Stripe calls amounts in the smallest currency unit. LKR in Stripe is a
// 2-decimal currency, so 2500 LKR -> 250000 minor units.
export function toStripeAmount(amountInMajor: number): number {
  return Math.round(amountInMajor * 100);
}
