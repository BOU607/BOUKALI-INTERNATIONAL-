import { NextRequest, NextResponse } from "next/server";
import { getOrders, addOrder } from "@/lib/store";
import type { Order } from "@/lib/types";

export async function GET() {
  const orders = getOrders();
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const order = (await req.json()) as Order;
  if (!order.items?.length || !order.customer?.name || !order.customer?.email) {
    return NextResponse.json(
      { error: "Missing items or customer info" },
      { status: 400 }
    );
  }
  order.id = `ord-${Date.now()}`;
  order.createdAt = new Date().toISOString();
  order.status = "pending";
  addOrder(order);
  return NextResponse.json(order);
}
