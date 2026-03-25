import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { updateOrderStatus } from "@/lib/orders-persist";
import type { Order } from "@/lib/types";

const VALID_STATUSES: Order["status"][] = ["pending", "paid", "shipped", "delivered", "refunded"];

/** PATCH order status: admin only */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
  if (token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = String(id ?? "").trim();
  if (!orderId) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const status = typeof body === "object" && body !== null && "status" in body
    ? (body as { status: unknown }).status
    : undefined;
  if (typeof status !== "string" || !VALID_STATUSES.includes(status as Order["status"])) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await updateOrderStatus(orderId, status as Order["status"]);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}
