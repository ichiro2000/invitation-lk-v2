// Separate HTTP-only cookie that marks the current admin session as having
// passed a TOTP challenge. Format: <expiryUnixSec>.<hmacHex> — no session id
// or user id inside (the JWT already identifies the user). The HMAC binds
// the expiry to NEXTAUTH_SECRET so it can't be tampered.
//
// Uses Web Crypto so the verify path works inside Edge Middleware.

const SECURE_NAME = "__Secure-invitation-lk-admin-2fa";
const INSECURE_NAME = "invitation-lk-admin-2fa";

export const TWO_FACTOR_COOKIE_TTL_SECONDS = 12 * 60 * 60; // 12 h

function shouldUseSecureCookie(): boolean {
  const url = process.env.NEXTAUTH_URL ?? "";
  return url.startsWith("https://") || process.env.NODE_ENV === "production";
}

export function twoFactorCookieName(): string {
  return shouldUseSecureCookie() ? SECURE_NAME : INSECURE_NAME;
}

export function twoFactorCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: shouldUseSecureCookie(),
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

function toHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    s += bytes[i].toString(16).padStart(2, "0");
  }
  return s;
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return toHex(sig);
}

// Constant-time string compare for equal-length hex strings.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function issueTwoFactorCookieValue(
  secret: string,
  ttlSeconds = TWO_FACTOR_COOKIE_TTL_SECONDS
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = String(exp);
  const sig = await hmacSha256Hex(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifyTwoFactorCookieValue(
  value: string | undefined,
  secret: string
): Promise<boolean> {
  if (!value) return false;
  const dot = value.indexOf(".");
  if (dot <= 0) return false;
  const exp = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!/^\d+$/.test(exp) || !/^[0-9a-f]+$/i.test(sig)) return false;
  const expected = await hmacSha256Hex(secret, exp);
  if (!safeEqual(sig, expected)) return false;
  const now = Math.floor(Date.now() / 1000);
  return Number(exp) > now;
}
