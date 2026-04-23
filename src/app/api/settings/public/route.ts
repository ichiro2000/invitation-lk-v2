import { NextResponse } from "next/server";
import { PUBLIC_SETTING_KEYS } from "@/lib/settings";
import { getSettings } from "@/lib/settings-read";

// Unauthenticated read of the settings explicitly marked `public: true` in
// src/lib/settings.ts. This powers the signup page and checkout tabs — each
// needs to know whether its feature is enabled before the user clicks.
// The whitelist lives in the settings catalog so a new setting is private
// unless someone explicitly opts it in; a typo here can't leak secrets.
export async function GET() {
  try {
    const values = await getSettings(PUBLIC_SETTING_KEYS);
    return NextResponse.json(values, {
      headers: {
        // Clients may cache for a few seconds; avoid hammering on every click
        // while still letting admin toggles propagate quickly.
        "Cache-Control": "public, max-age=10, s-maxage=10",
      },
    });
  } catch (error) {
    console.error("Public settings GET error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}
