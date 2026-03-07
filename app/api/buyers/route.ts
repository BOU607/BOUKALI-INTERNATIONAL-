import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getOrders } from "@/lib/store";

/** GET buyers: admin only. Unique buyers from orders, aggregated by email. */
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

  const orders = getOrders();
  const byEmail = new Map<string, { name: string; orderCount: number; totalSpent: number; lastOrderAt: string }>();

  for (const o of orders) {
    const email = (o.customer?.email ?? "").trim().toLowerCase();
    if (!email) continue;
    const existing = byEmail.get(email);
    const totalSpent = (existing?.totalSpent ?? 0) + (o.total ?? 0);
    const orderCount = (existing?.orderCount ?? 0) + 1;
    const lastOrderAt = existing
      ? (new Date(o.createdAt) > new Date(existing.lastOrderAt) ? o.createdAt : existing.lastOrderAt)
      : o.createdAt;
    byEmail.set(email, {
      name: o.customer?.name ?? existing?.name ?? "—",
      orderCount,
      totalSpent,
      lastOrderAt,
    });
  }

  const buyers = Array.from(byEmail.entries()).map(([email, data]) => ({
    email,
    name: data.name,
    orderCount: data.orderCount,
    totalSpent: data.totalSpent,
    lastOrderAt: data.lastOrderAt,
  }));

  buyers.sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime());
  return NextResponse.json(buyers);
}
