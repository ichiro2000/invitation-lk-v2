// Build a user-friendly display name that never collapses to " & " when
// either yourName or partnerName is missing. Used by auth.ts so that
// `session.user.name` is always a sensible non-empty string.
export function displayName(
  yourName: string | null | undefined,
  partnerName: string | null | undefined,
  email: string
): string {
  const a = (yourName ?? "").trim();
  const b = (partnerName ?? "").trim();
  if (a && b) return `${a} & ${b}`;
  if (a) return a;
  if (b) return b;
  // Last resort: local-part of email. Always present because User.email is
  // required and unique.
  return email.split("@")[0] || "there";
}

export function avatarInitial(name: string | null | undefined, fallback = "U"): string {
  const first = (name ?? "").trim().charAt(0).toUpperCase();
  return first || fallback;
}
