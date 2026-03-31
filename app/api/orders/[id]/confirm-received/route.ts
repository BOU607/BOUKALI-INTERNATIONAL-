import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrderById, patchOrder } from "@/lib/orders-persist";
import { getSellerById } from "@/lib/sellers-persist";
import { computeSellerTransferAmountsMinor, toMinor } from "@/lib/fees-minor";
import { prisma } from "@/lib/prisma";
import { notifySellerPayoutReleased } from "@/lib/notify-seller";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const DEFAULT_CURRENCY = "aud";

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

/**
 * POST confirm-received: buyer confirms they received the order.
 * Security model: validate that provided email matches the order customer email.
 *
 * This releases Stripe transfers to seller connected accounts automatically.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!stripe) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }

  const { id } = await params;
  const orderId = String(id ?? "").trim();
  if (!orderId) return NextResponse.json({ error: "Invalid order id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const order = await getOrderById(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if ((order.customer?.email ?? "").trim().toLowerCase() !== email) {
    // Avoid leaking order existence.
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "refunded") {
    return NextResponse.json({ error: "Order already refunded" }, { status: 400 });
  }
  if (order.status === "disputed") {
    return NextResponse.json({ error: "Order has an active payment dispute" }, { status: 400 });
  }
  if (order.status !== "paid" && order.status !== "shipped" && order.status !== "delivered") {
    return NextResponse.json({ error: "Order not ready for delivery confirmation" }, { status: 400 });
  }

  // Build seller subtotals from order items.
  const mo = await prisma.marketplaceOrder.findUnique({ where: { id: order.id } }).catch(() => null);
  const ledger = mo
    ? { sellerFeeMinor: mo.sellerFeeMinor, currency: mo.currency }
    : null;
  const { perSeller: netBySeller, currency: transferCurrency } =
    computeSellerTransferAmountsMinor({
      items: order.items,
      ledger,
      ...(!mo && order.sellerFee != null && Number.isFinite(order.sellerFee)
        ? { fallbackSellerFeeMinor: toMinor(order.sellerFee) }
        : {}),
    });
  if (netBySeller.size === 0) {
    return NextResponse.json({ error: "No seller items found on this order" }, { status: 400 });
  }

  const existing = order.payoutTransfers ?? [];
  const transferGroup = order.transferGroup || `order_${order.id}`;
  const created: TransferRecord[] = [];
  const emailQueue: EmailPayload[] = [];

  for (const [sellerId, amountCents] of Array.from(netBySeller.entries())) {
    if (existing.some((t) => t.sellerId === sellerId)) continue; // idempotent per seller

    const seller = await getSellerById(sellerId);
    if (!seller?.connectedAccountId) {
      return NextResponse.json(
        { error: `Missing Stripe connected account for seller ${sellerId}` },
        { status: 400 }
      );
    }

    if (amountCents <= 0) continue;

    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: transferCurrency || DEFAULT_CURRENCY,
      destination: seller.connectedAccountId,
      transfer_group: transferGroup,
      metadata: { orderId: order.id, sellerId },
    });

    created.push({
      sellerId,
      transferId: transfer.id,
      amount: amountCents / 100,
      currency: transferCurrency || DEFAULT_CURRENCY,
      releasedAt: new Date().toISOString(),
    });

    if (seller.email) {
      emailQueue.push({
        sellerEmail: seller.email,
        sellerName: seller.name,
        orderId: order.id,
        amount: amountCents / 100,
        currency: transferCurrency || DEFAULT_CURRENCY,
        transferId: transfer.id,
      });
    }
  }

  const nextTransfers = [...existing, ...created];
  await patchOrder(order.id, {
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
    payoutTransfers: nextTransfers,
  });
}

