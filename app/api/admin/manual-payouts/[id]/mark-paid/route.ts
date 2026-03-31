import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }
  const token = await getToken({ req, secret }).catch(() => null);
  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const payoutId = String(id ?? "").trim();
  if (!payoutId) {
    return NextResponse.json({ error: "Invalid payout id" }, { status: 400 });
  }

  let body: { reference?: string; note?: string } = {};
  try {
    body = (await req.json()) as { reference?: string; note?: string };
  } catch {
    // body optional
  }
  const reference = String(body.reference ?? "").trim();
  const note = String(body.note ?? "").trim();

  const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
  if (!payout) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (payout.status !== "pending_manual") {
    return NextResponse.json({ error: "Payout is not pending manual" }, { status: 400 });
  }

  const updated = await prisma.payout.update({
    where: { id: payoutId },
    data: {
      status: "released",
      releasedAt: new Date(),
      payoutRef: reference || `manual:${Date.now()}`,
      // rawPayload not available on Payout model; keep note in payoutRef if needed.
    },
  });

  // Keep order consistent (delivered) if it exists.
  await prisma.marketplaceOrder
    .update({ where: { id: updated.orderId }, data: { status: "delivered" } })
    .catch(() => null);

  return NextResponse.json({ ok: true, payout: updated, note: note || undefined });
}

