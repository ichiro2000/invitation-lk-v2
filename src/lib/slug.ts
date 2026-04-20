const RESERVED_SLUGS = new Set([
  "admin", "api", "auth", "dashboard", "login", "logout", "register", "signup", "signin",
  "contact", "pricing", "privacy", "terms", "features", "templates", "samples",
  "i", "w", "invitation", "invitations", "about", "help", "support",
  "settings", "profile", "account", "billing", "checkout", "rsvp",
  "new", "edit", "delete", "create", "update", "draft", "preview",
  "static", "public", "assets", "images", "img", "favicon", "robots", "sitemap",
]);

export const SLUG_MIN = 3;
export const SLUG_MAX = 60;

export function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/&/g, "-and-")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export type SlugValidation = { ok: true; slug: string } | { ok: false; error: string };

export function validateSlug(raw: string): SlugValidation {
  if (typeof raw !== "string") return { ok: false, error: "Invalid link" };
  const slug = normalizeSlug(raw);
  if (slug.length < SLUG_MIN) return { ok: false, error: `Link must be at least ${SLUG_MIN} characters` };
  if (slug.length > SLUG_MAX) return { ok: false, error: `Link must be at most ${SLUG_MAX} characters` };
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
    return { ok: false, error: "Use lowercase letters, numbers and hyphens only" };
  }
  if (RESERVED_SLUGS.has(slug)) return { ok: false, error: "That link is reserved — try another" };
  return { ok: true, slug };
}
