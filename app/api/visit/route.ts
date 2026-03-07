import { NextRequest, NextResponse } from "next/server";
import { getLocationFromRequest } from "@/lib/geo";
import { addVisit } from "@/lib/visits-persist";

/**
 * GET /api/visit — detects caller's location from request (Vercel IP geo), logs the visit, returns location.
 * Persists via Vercel KV when KV_REST_API_URL + KV_REST_API_TOKEN are set; otherwise file (local only).
 */
export async function GET(req: NextRequest) {
  const location = getLocationFromRequest(req);
  try {
    await addVisit(location);
    return NextResponse.json({ ...location, recorded: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save visit";
    return NextResponse.json({ ...location, recorded: false, error: message }, { status: 200 });
  }
}
