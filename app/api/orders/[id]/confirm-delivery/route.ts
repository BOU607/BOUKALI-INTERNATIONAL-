import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Stripe from "stripe";
import { getOrderById, patchOrder } from "@/lib/orders-persist";
import { getSellerById } from "@/lib/sellers-persist";
import { SELLER_FEE_PERCENT } from "@/lib/fees";
import { notifySellerPayoutReleased } from "@/lib/notify-seller";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const CURRENCY = "aud";

type TransferRecord = {
  sellerId: string;
  transferId: string;
  amount: number;
  currency: string;
  releasedAt: string;
};

type EmailPayload = {
  sellerEmail: string;
  sellerName?: string;
  orderId: string;
  amount: number;
  currency: string;
  transferId: string;
};

/** POST confirm delivery: admin only. Creates Stripe transfer(s) to seller connected account(s). */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!stripe) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }
  const token = await getToken({ req, secret }).catch(() => null);
  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = String(id ?? "").trim();
  if (!orderId) return NextResponse.json({ error: "Invalid order id" }, { status: 400 });

  const order = await getOrderById(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "paid" && order.status !== "shipped" && order.status !== "delivered") {
    return NextResponse.json({ error: "Order must be paid before payout release" }, { status: 400 });
  }

  const bySeller = new Map<string, number>();
  for (const item of order.items) {
    if (!item.sellerId) continue;
    bySeller.set(item.sellerId, (bySeller.get(item.sellerId) ?? 0) + item.price * item.quantity);
  }
  if (bySeller.size === 0) {
    return NextResponse.json({ error: "No seller items found on this order" }, { status: 400 });
  }

  const existing = order.payoutTransfers ?? [];
  const transferGroup = order.transferGroup || `order_${order.id}`;
  const created: TransferRecord[] = [];
  const emailQueue: EmailPayload[] = [];

  for (const [sellerId, subtotal] of Array.from(bySeller.entries())) {
    if (existing.some((t) => t.sellerId === sellerId)) continue; // idempotent per seller

    const seller = await getSellerById(sellerId);
    if (!seller?.connectedAccountId) {
      return NextResponse.json(
        { error: `Missing Stripe connected account for seller ${sellerId}` },
        { status: 400 }
      );
    }
    const amountCents = Math.round(subtotal * (1 - SELLER_FEE_PERCENT / 100) * 100);
    if (amountCents <= 0) continue;

    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: CURRENCY,
      destination: seller.connectedAccountId,
      transfer_group: transferGroup,
      metadata: { orderId: order.id, sellerId },
    });

    created.push({
      sellerId,
      transferId: transfer.id,
      amount: amountCents / 100,
      currency: CURRENCY,
      releasedAt: new Date().toISOString(),
    });
    if (seller.email) {
      emailQueue.push({
        sellerEmail: seller.email,
        sellerName: seller.name,
        orderId: order.id,
        amount: amountCents / 100,
        currency: CURRENCY,
        transferId: transfer.id,
      });
    }
  }

  const nextTransfers = [...existing, ...created];
  const updated = await patchOrder(order.id, {
    status: "delivered",
    transferGroup,
    payoutTransfers: nextTransfers,
  });
  for (const payload of emailQueue) {
    notifySellerPayoutReleased(payload).catch((e) =>
      console.error("Payout release notify failed:", e)
    );
  }
  return NextResponse.json({
    orderId: order.id,
    createdTransfers: created.length,
    payoutTransfers: updated?.payoutTransfers ?? nextTransfers,
  });
}

