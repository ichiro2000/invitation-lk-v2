/**
 * Convert various Google Maps URL formats to an embeddable URL.
 *
 * Supported formats:
 * - https://maps.google.com/...
 * - https://www.google.com/maps/...
 * - https://goo.gl/maps/...
 * - https://maps.app.goo.gl/...
 * - https://www.google.com/maps/embed?...
 * - Plain address text (falls back to search query)
 */
export function getMapEmbedUrl(input: string): string {
  if (!input || !input.trim()) return "";

  const trimmed = input.trim();

  // Already an embed URL
  if (trimmed.includes("google.com/maps/embed")) {
    return trimmed;
  }

  // Extract place/coordinates from Google Maps URLs
  // Format: https://www.google.com/maps/place/.../@lat,lng,...
  const placeMatch = trimmed.match(/google\.com\/maps\/place\/([^/@]+)/);
  if (placeMatch) {
    const place = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s!2s${encodeURIComponent(place)}!5e0!3m2!1sen!2slk!4v1`;
  }

  // Short links (goo.gl/maps, maps.app.goo.gl) — use as-is in a search query
  if (trimmed.includes("goo.gl/maps") || trimmed.includes("maps.app.goo.gl")) {
    // Can't expand short URLs client-side, use the query approach
    return `https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(trimmed)}`;
  }

  // Any other Google Maps URL — extract query param or use the full URL
  if (trimmed.includes("google.com/maps")) {
    const qMatch = trimmed.match(/[?&]q=([^&]+)/);
    if (qMatch) {
      return `https://maps.google.com/maps?q=${qMatch[1]}&output=embed`;
    }
    // Try to extract coordinates
    const coordMatch = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (coordMatch) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed`;
    }
  }

  // Fallback: treat input as a search query (address or place name)
  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
}

/**
 * Check if a string looks like a Google Maps URL
 */
export function isGoogleMapsUrl(input: string): boolean {
  if (!input) return false;
  return /google\.com\/maps|goo\.gl\/maps|maps\.app\.goo\.gl/i.test(input);
}
