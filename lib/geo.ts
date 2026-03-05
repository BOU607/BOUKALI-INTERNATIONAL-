import type { NextRequest } from "next/server";

/**
 * Location from Vercel's automatic request headers (IP-based).
 * Approximate: city/region/country level. For precise GPS, use browser Geolocation API with user consent.
 */
export type VisitorLocation = {
  country?: string;
  countryRegion?: string;
  city?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
};

const HEADERS = {
  country: "x-vercel-ip-country",
  countryRegion: "x-vercel-ip-country-region",
  city: "x-vercel-ip-city",
  postalCode: "x-vercel-ip-postal-code",
  latitude: "x-vercel-ip-latitude",
  longitude: "x-vercel-ip-longitude",
  timezone: "x-vercel-ip-timezone",
} as const;

export function getLocationFromRequest(req: NextRequest): VisitorLocation {
  const get = (key: keyof typeof HEADERS) => req.headers.get(HEADERS[key]) ?? undefined;
  const loc: VisitorLocation = {};
  if (get("country")) loc.country = get("country");
  if (get("countryRegion")) loc.countryRegion = get("countryRegion");
  if (get("city")) loc.city = get("city");
  if (get("postalCode")) loc.postalCode = get("postalCode");
  if (get("latitude")) loc.latitude = get("latitude");
  if (get("longitude")) loc.longitude = get("longitude");
  if (get("timezone")) loc.timezone = get("timezone");
  return loc;
}

/** One-line summary for display, e.g. "Sydney, NSW, AU" */
export function formatLocationSummary(loc: VisitorLocation): string {
  const parts = [loc.city, loc.countryRegion, loc.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Unknown";
}
