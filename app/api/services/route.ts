import { NextRequest, NextResponse } from "next/server";
import { getServices } from "@/lib/store";

export async function GET(req: NextRequest) {
  const services = getServices();
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim();
  const trade = req.nextUrl.searchParams.get("trade")?.trim();

  let result = services;

  if (trade) {
    result = result.filter((s) => s.trade.toLowerCase() === trade.toLowerCase());
  }

  if (q) {
    result = result.filter(
      (s) =>
        s.trade.toLowerCase().includes(q) ||
        s.businessName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(result);
}
