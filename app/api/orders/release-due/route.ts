import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrders, patchOrder } from "@/lib/orders-persist";
import { getSellerById } from "@/lib/sellers-persist";
import { computeSellerTransferAmountsMinor, toMinor } from "@/lib/fees-minor";
import { prisma } from "@/lib/prisma";
import { notifySellerPayoutReleased } from "@/lib/notify-seller";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const DEFAULT_CURRENCY = "aud";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const fromHeader = req.headers.get("x-cron-secret");
  if (fromHeader === secret) return true;
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

type TransferRecord = {
  sellerId: string;
  transferId: string;
  amount: number;
  currency: string;
  releasedAt: string;
};

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!stripe) return NextResponse.json({ error: "Payments not configured" }, { status: 503 });

  const releaseDays = Number(process.env.PAYOUT_AUTO_RELEASE_DAYS || "14");
  const cutoff = new Date(Date.now() - releaseDays * 24 * 60 * 60 * 1000);

  const orders = await getOrders();
  const dueOrders = orders.filter((o) => {
    if (!o.createdAt) return false;
    const created = new Date(o.createdAt);
    if (Number.isNaN(created.getTime())) return false;
    if (o.status === "delivered" || o.status === "refunded" || o.status === "disputed") return false;
    if (o.status !== "paid" && o.status !== "shipped") return false;
    return created <= cutoff;
  });

  // Release in small batches to avoid timeouts.
  const batch = dueOrders.slice(0, 20);

  let releasedOrders = 0;
  let failedOrders: Array<{ orderId: string; error: string }> = [];

  for (const order of batch) {
    try {
      const existing = order.payoutTransfers ?? [];
      const transferGroup = order.transferGroup || `order_${order.id}`;

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
      if (netBySeller.size === 0) continue;

      const currency = transferCurrency || DEFAULT_CURRENCY;
      const created: TransferRecord[] = [];
      let manualRequired = 0;
      const emailQueue: Array<{
        sellerEmail: string;
        sellerName?: string;
        orderId: string;
        amount: number;
        currency: string;
        transferId: string;
      }> = [];

      for (const [sellerId, amountCents] of Array.from(netBySeller.entries())) {
        if (existing.some((t) => t.sellerId === sellerId)) continue; // idempotent per seller

        const seller = await getSellerById(sellerId);
        if (amountCents <= 0) continue;

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

        const transfer = await stripe.transfers.create({
          amount: amountCents,
          currency,
          destination: seller.connectedAccountId,
          transfer_group: transferGroup,
          metadata: { orderId: order.id, sellerId },
        });

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
      await patchOrder(order.id, {
        status: "delivered",
        transferGroup,
        payoutTransfers: nextTransfers,
      });

      for (const payload of emailQueue) {
        notifySellerPayoutReleased(payload).catch((e) =>
          console.error("Payout auto-release notify failed:", e)
        );
      }

      releasedOrders++;
    } catch (e) {
      failedOrders.push({ orderId: order.id, error: (e as Error).message || "unknown error" });
    }
  }

  return NextResponse.json({
    dueCount: dueOrders.length,
    processedCount: batch.length,
    releasedOrders,
    failedOrders,
  });
}

export async function GET(req: NextRequest) {
  return POST(req);
}

