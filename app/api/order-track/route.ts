import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/store";

/**
 * GET /api/order-track?orderId=xxx&email=xxx
 * Returns order status and details only if the email matches the order's customer email.
 */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId")?.trim();
  const email = req.nextUrl.searchParams.get("email")?.trim();

  if (!orderId || !email) {
    return NextResponse.json(
      { error: "Order ID and email are required." },
      { status: 400 }
    );
  }

  const order = getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.customer.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    status: order.status,
    items: order.items,
    total: order.total,
    createdAt: order.createdAt,
  });
}
