import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getPayoutReleaseRuns } from "@/lib/payout-release-runs";

export async function GET(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }
  const token = await getToken({ req, secret }).catch(() => null);
  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const runs = await getPayoutReleaseRuns();
  return NextResponse.json(runs);
}
