import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
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

/** POST confirm delivery: admin only. Creates Stripe transfer(s) to seller connected account(s). */
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
  const orderId = String(id ?? "").trim();
  if (!orderId) return NextResponse.json({ error: "Invalid order id" }, { status: 400 });

  const order = await getOrderById(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status === "disputed") {
    return NextResponse.json({ error: "Order has an active payment dispute" }, { status: 400 });
  }
  if (order.status !== "paid" && order.status !== "shipped" && order.status !== "delivered") {
    return NextResponse.json({ error: "Order must be paid before payout release" }, { status: 400 });
  }

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
  let manualRequired = 0;
  const currency = transferCurrency || DEFAULT_CURRENCY;

  for (const [sellerId, amountCents] of Array.from(netBySeller.entries())) {
    if (existing.some((t) => t.sellerId === sellerId)) continue; // idempotent per seller

    const seller = await getSellerById(sellerId);
    if (amountCents <= 0) continue;

    // If seller has no Stripe connected account, record manual payout required.
    if (!seller?.connectedAccountId) {
      manualRequired++;
      created.push({
        sellerId,
        transferId: `manual:${order.id}:${sellerId}`,
        amount: amountCents / 100,
        currency,
        releasedAt: new Date().toISOString(),
      });
      continue;
    }

    if (!stripe) {
      return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
    }

    let transfer: Stripe.Transfer;
    try {
      transfer = await stripe.transfers.create({
        amount: amountCents,
        currency,
        destination: seller.connectedAccountId,
        transfer_group: transferGroup,
        metadata: { orderId: order.id, sellerId },
      });
    } catch (e) {
      const msg =
        e instanceof Stripe.errors.StripeError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Stripe transfer failed";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    created.push({
      sellerId,
      transferId: transfer.id,
      amount: amountCents / 100,
      currency,
      releasedAt: new Date().toISOString(),
    });
    if (seller.email) {
      emailQueue.push({
        sellerEmail: seller.email,
        sellerName: seller.name,
        orderId: order.id,
        amount: amountCents / 100,
        currency,
        transferId: transfer.id,
      });
    }
  }

  const nextTransfers = [
    ...existing,
    ...created.map((t) => ({
      ...t,
      mode: t.transferId.startsWith("manual:") ? ("manual" as const) : ("stripe" as const),
      note: t.transferId.startsWith("manual:")
        ? "Manual payout required (seller not connected to Stripe)."
        : undefined,
    })),
  ];
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
    createdTransfers: created.length - manualRequired,
    manualPayouts: manualRequired,
    payoutTransfers: updated?.payoutTransfers ?? nextTransfers,
  });
}

