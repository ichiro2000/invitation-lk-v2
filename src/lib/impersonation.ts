// Helpers for the admin impersonation cookie-swap flow.
//
// Strategy: when an admin impersonates a customer we overwrite the NextAuth
// session cookie with a freshly-issued JWT representing the target user, and
// stash the admin's original (encrypted) session cookie under a backup name.
// "Exit" restores the backup and deletes the new cookie. The app reads the
// session cookie normally the whole time — only these two endpoints know
// about the swap.

const NEXTAUTH_COOKIE_SECURE = "__Secure-next-auth.session-token";
const NEXTAUTH_COOKIE_INSECURE = "next-auth.session-token";
const BACKUP_COOKIE_SECURE = "__Secure-invitation-lk-impersonation-backup";
const BACKUP_COOKIE_INSECURE = "invitation-lk-impersonation-backup";

function shouldUseSecureCookies(): boolean {
  const url = process.env.NEXTAUTH_URL ?? "";
  return url.startsWith("https://") || process.env.NODE_ENV === "production";
}

export function sessionCookieName(): string {
  return shouldUseSecureCookies() ? NEXTAUTH_COOKIE_SECURE : NEXTAUTH_COOKIE_INSECURE;
}

export function backupCookieName(): string {
  return shouldUseSecureCookies() ? BACKUP_COOKIE_SECURE : BACKUP_COOKIE_INSECURE;
}

export function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
