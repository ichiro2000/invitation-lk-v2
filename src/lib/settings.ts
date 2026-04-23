// Typed catalog of admin-editable settings. The API validates against this
// list and the admin UI renders from it. Keys never surfaced here are rejected.
//
// `public: true` = safe to expose via /api/settings/public (unauthenticated).
// That endpoint powers client-side gating on the signup + checkout pages.
// Anything that might include a secret or internal detail must stay private.

export type SettingKey =
  | "site_name"
  | "site_tagline"
  | "support_email"
  | "support_phone"
  | "default_currency"
  | "default_timezone"
  | "default_locale"
  | "seo_title"
  | "seo_description"
  | "seo_og_image_url"
  | "terms_url"
  | "privacy_url"
  | "feature_signup_open"
  | "feature_bank_transfer"
  | "feature_stripe"
  | "feature_payhere"
  | "feature_whatsapp"
  | "email_from_name"
  | "email_from_address"
  | "email_reply_to"
  | "email_admin_recipients";

export type SettingType = "text" | "email" | "tel" | "url" | "bool" | "longtext";
export type SettingGroup = "branding" | "regional" | "seo" | "legal" | "features" | "email";

export interface SettingDef {
  key: SettingKey;
  label: string;
  help?: string;
  type: SettingType;
  default: string;
  group: SettingGroup;
  maxLength?: number;
  public?: boolean;
}

const NOT_WIRED = "Reserved — no consumer exists yet. Toggling has no runtime effect.";

export const SETTING_DEFS: SettingDef[] = [
  // Branding
  { key: "site_name", label: "Site name", type: "text", default: "Invitation.lk", group: "branding", maxLength: 80, public: true },
  { key: "site_tagline", label: "Tagline", type: "text", default: "Beautiful wedding invitations.", group: "branding", maxLength: 200, public: true },
  { key: "support_email", label: "Support email", type: "email", default: "support@invitation.lk", group: "branding", maxLength: 160, public: true },
  { key: "support_phone", label: "Support phone", type: "tel", default: "", group: "branding", maxLength: 40, public: true },

  // Regional
  { key: "default_currency", label: "Default currency (ISO)", help: "Shown on invoices and receipts.", type: "text", default: "LKR", group: "regional", maxLength: 8 },
  { key: "default_timezone", label: "Default timezone", type: "text", default: "Asia/Colombo", group: "regional", maxLength: 60 },
  { key: "default_locale", label: "Default locale", type: "text", default: "en-LK", group: "regional", maxLength: 20 },

  // SEO
  { key: "seo_title", label: "SEO title", type: "text", default: "Invitation.lk — Wedding invitations", group: "seo", maxLength: 120 },
  { key: "seo_description", label: "SEO description", type: "longtext", default: "Design and send beautiful wedding invitations in minutes.", group: "seo", maxLength: 300 },
  { key: "seo_og_image_url", label: "OG image URL", type: "url", default: "", group: "seo", maxLength: 500 },

  // Legal
  { key: "terms_url", label: "Terms URL", type: "url", default: "", group: "legal", maxLength: 500 },
  { key: "privacy_url", label: "Privacy URL", type: "url", default: "", group: "legal", maxLength: 500 },

  // Feature flags — live consumers
  {
    key: "feature_signup_open",
    label: "Signups open",
    help: "When off, /signup rejects new registrations and the signup form is replaced with a 'closed' notice.",
    type: "bool", default: "true", group: "features", public: true,
  },
  {
    key: "feature_bank_transfer",
    label: "Bank transfer payments",
    help: "When off, bank transfer is hidden on checkout and the API refuses new bank-transfer orders.",
    type: "bool", default: "true", group: "features", public: true,
  },
  {
    key: "feature_payhere",
    label: "Card payments (PayHere)",
    help: "When off, card payment is hidden on checkout and the API refuses new PayHere orders.",
    type: "bool", default: "true", group: "features", public: true,
  },

  // Reserved flags — schema ready, no integration yet
  { key: "feature_stripe", label: "Stripe card payments", help: NOT_WIRED, type: "bool", default: "true", group: "features", public: true },
  { key: "feature_whatsapp", label: "WhatsApp invites", help: NOT_WIRED, type: "bool", default: "false", group: "features", public: true },

  // Email provider metadata — credentials stay in env vars (RESEND_API_KEY).
  {
    key: "email_from_name",
    label: "From name",
    help: "Display name shown to recipients. Defaults to INVITATION.LK.",
    type: "text", default: "INVITATION.LK", group: "email", maxLength: 80,
  },
  {
    key: "email_from_address",
    label: "From address",
    help: "Must be a verified sender on Resend. Changing to an unverified domain will fail every send.",
    type: "email", default: "noreply@invitation.lk", group: "email", maxLength: 160,
  },
  {
    key: "email_reply_to",
    label: "Reply-to address",
    help: "Optional. When blank, replies go to the from address.",
    type: "email", default: "", group: "email", maxLength: 160,
  },
  {
    key: "email_admin_recipients",
    label: "Admin notification recipients",
    help: "Comma-separated emails to receive signup/payment/support alerts. When blank, falls back to auto-lookup of users with ADMIN role, then the ADMIN_EMAIL env var.",
    type: "longtext", default: "", group: "email", maxLength: 500,
  },
];

export const SETTING_KEYS = SETTING_DEFS.map((s) => s.key) as readonly SettingKey[];
export const SETTING_KEY_SET = new Set<string>(SETTING_KEYS);
export const SETTING_BY_KEY: Map<SettingKey, SettingDef> = new Map(
  SETTING_DEFS.map((s) => [s.key, s])
);
export const PUBLIC_SETTING_KEYS = SETTING_DEFS.filter((d) => d.public).map((d) => d.key);

export const GROUP_LABELS: Record<SettingGroup, string> = {
  branding: "Branding & contact",
  regional: "Regional",
  seo: "SEO defaults",
  legal: "Legal",
  features: "Feature flags",
  email: "Email provider",
};

export const GROUP_ORDER: SettingGroup[] = ["branding", "regional", "seo", "legal", "features", "email"];

export function defaultFor(key: SettingKey): string {
  return SETTING_BY_KEY.get(key)?.default ?? "";
}

export function validateValue(def: SettingDef, value: string): true | string {
  if (def.type === "bool") {
    return value === "true" || value === "false" ? true : "Must be 'true' or 'false'";
  }
  if (def.maxLength && value.length > def.maxLength) {
    return `Too long (max ${def.maxLength})`;
  }
  if (value === "") return true;
  // longtext is used for both free-form prose AND comma-separated lists —
  // the callers decide how to parse. Validate structure, not semantics.
  if (def.type === "email") {
    return /^\S+@\S+\.\S+$/.test(value) ? true : "Invalid email";
  }
  if (def.type === "url") {
    try {
      new URL(value);
      return true;
    } catch {
      return "Invalid URL";
    }
  }
  return true;
}
