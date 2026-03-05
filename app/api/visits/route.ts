import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getVisits } from "@/lib/visits-persist";

/** GET recent visits (admin only) — list of connections with detected location */
export async function GET(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }
  let token = null;
  try {
    token = await getToken({ req, secret });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const visits = await getVisits();
  return NextResponse.json(visits);
}
