// Typed catalog of admin-editable settings. The API validates against this
// list and the admin UI renders from it. Keys never surfaced here are rejected.
//
// IMPORTANT: these settings are a pure config store. Consumers (signup,
// payment, email layout) still use their hardcoded values today — toggling a
// feature flag here will not actually disable Stripe/PayHere/etc. When a
// consumer is wired up to read a setting, update the `help` field so admins
// know it is live.

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
  | "feature_whatsapp";

export type SettingType = "text" | "email" | "tel" | "url" | "bool" | "longtext";
export type SettingGroup = "branding" | "regional" | "seo" | "legal" | "features";

export interface SettingDef {
  key: SettingKey;
  label: string;
  help?: string;
  type: SettingType;
  default: string;
  group: SettingGroup;
  maxLength?: number;
}

const NOT_WIRED = "Not yet wired to any consumer — toggling has no runtime effect.";

export const SETTING_DEFS: SettingDef[] = [
  // Branding
  { key: "site_name", label: "Site name", type: "text", default: "Invitation.lk", group: "branding", maxLength: 80 },
  { key: "site_tagline", label: "Tagline", type: "text", default: "Beautiful wedding invitations.", group: "branding", maxLength: 200 },
  { key: "support_email", label: "Support email", type: "email", default: "support@invitation.lk", group: "branding", maxLength: 160 },
  { key: "support_phone", label: "Support phone", type: "tel", default: "", group: "branding", maxLength: 40 },

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

  // Feature flags — STORED ONLY. No consumer reads these yet; they are here so
  // we can turn them on one at a time as consumers get wired.
  { key: "feature_signup_open", label: "Signups open", help: NOT_WIRED, type: "bool", default: "true", group: "features" },
  { key: "feature_bank_transfer", label: "Bank transfer payments", help: NOT_WIRED, type: "bool", default: "true", group: "features" },
  { key: "feature_stripe", label: "Stripe payments", help: NOT_WIRED, type: "bool", default: "true", group: "features" },
  { key: "feature_payhere", label: "PayHere payments", help: NOT_WIRED, type: "bool", default: "true", group: "features" },
  { key: "feature_whatsapp", label: "WhatsApp invites", help: NOT_WIRED, type: "bool", default: "false", group: "features" },
];

export const SETTING_KEYS = SETTING_DEFS.map((s) => s.key) as readonly SettingKey[];
export const SETTING_KEY_SET = new Set<string>(SETTING_KEYS);
export const SETTING_BY_KEY: Map<SettingKey, SettingDef> = new Map(
  SETTING_DEFS.map((s) => [s.key, s])
);

export const GROUP_LABELS: Record<SettingGroup, string> = {
  branding: "Branding & contact",
  regional: "Regional",
  seo: "SEO defaults",
  legal: "Legal",
  features: "Feature flags",
};

export const GROUP_ORDER: SettingGroup[] = ["branding", "regional", "seo", "legal", "features"];

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
