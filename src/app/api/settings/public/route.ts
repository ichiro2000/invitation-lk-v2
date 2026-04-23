import { NextResponse } from "next/server";
import { PUBLIC_SETTING_KEYS } from "@/lib/settings";
import { getSettings } from "@/lib/settings-read";
import { isStripeConfigured, isStripeWebhookConfigured } from "@/lib/stripe";

// Unauthenticated read of the settings explicitly marked `public: true` in
// src/lib/settings.ts. This powers the signup page and checkout tabs — each
// needs to know whether its feature is enabled before the user clicks.
// The whitelist lives in the settings catalog so a new setting is private
// unless someone explicitly opts it in; a typo here can't leak secrets.
export async function GET() {
  try {
    const values = await getSettings(PUBLIC_SETTING_KEYS);

    // feature_stripe only goes out as "true" when the flag is on AND both
    // env vars are set. Otherwise the checkout page would show a tab whose
    // Continue button 503s. The raw flag is still visible to admins on
    // /admin/settings (they see an env status pill beside it).
    const stripeReady =
      values.feature_stripe === "true" &&
      isStripeConfigured() &&
      isStripeWebhookConfigured();

    return NextResponse.json(
      {
        ...values,
        feature_stripe: stripeReady ? "true" : "false",
      },
      {
        headers: {
          // Clients may cache for a few seconds; avoid hammering on every click
          // while still letting admin toggles propagate quickly.
          "Cache-Control": "public, max-age=10, s-maxage=10",
        },
      }
    );
  } catch (error) {
    console.error("Public settings GET error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}
