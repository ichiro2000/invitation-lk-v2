"use client";

import { MapPin } from "lucide-react";
import { withOpacity } from "@/lib/with-opacity";
import type { ContentOverrides } from "@/types/template-config";

type Second = NonNullable<NonNullable<ContentOverrides["venue"]>["second"]>;

export default function SecondaryVenue({
  second,
  primaryColor,
  secondaryColor,
  accentColor,
  label = "Second Location",
  mapHeight = "h-56",
}: {
  second: Second | undefined;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  label?: string;
  mapHeight?: string;
}) {
  if (!second || !second.name) return null;
  const { name, address, mapUrl } = second;
  const hasMap = mapUrl || name || address;
  const query = mapUrl && mapUrl.includes("google")
    ? mapUrl
    : [name, address].filter(Boolean).join(", ");
  const openHref = mapUrl
    ? (mapUrl.startsWith("http") ? mapUrl : `https://maps.google.com/maps?q=${encodeURIComponent(mapUrl)}`)
    : null;

  return (
    <div className="mt-12 pt-8" style={{ borderTop: `1px dashed ${withOpacity(primaryColor, 0.3)}` }}>
      <p className="tracking-[0.4em] uppercase text-xs mb-3" style={{ color: primaryColor }}>{label}</p>
      <div className="flex items-center justify-center gap-2 mb-2">
        <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
        <h3 className="text-xl font-semibold" style={{ color: secondaryColor }}>{name}</h3>
      </div>
      {address && <p className="mb-6" style={{ color: accentColor }}>{address}</p>}
      {hasMap && (
        <iframe
          src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
          className={`w-full ${mapHeight} rounded-2xl border-0`}
          loading="lazy"
          allowFullScreen
          title={`${name} map`}
        />
      )}
      {openHref && (
        <a
          href={openHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm"
          style={{ color: primaryColor, border: `1px solid ${withOpacity(primaryColor, 0.3)}` }}
        >
          <MapPin className="w-4 h-4" /> Open in Google Maps
        </a>
      )}
    </div>
  );
}
