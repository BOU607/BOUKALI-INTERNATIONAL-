import { NextRequest, NextResponse } from "next/server";
import { getLocationFromRequest } from "@/lib/geo";

/**
 * GET /api/location — returns the caller's approximate location from request headers (Vercel IP geo).
 * No consent required; accuracy is city/region level. For precise GPS, use browser Geolocation API with user permission.
 */
export async function GET(req: NextRequest) {
  const location = getLocationFromRequest(req);
  return NextResponse.json(location);
}
