import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/store";
import type { Order } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = (await req.json()) as { status: Order["status"] };
  if (!["pending", "paid", "shipped", "delivered"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const order = updateOrderStatus(id, status);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}
