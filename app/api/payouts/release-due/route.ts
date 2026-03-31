import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getSellerById } from "@/lib/sellers-persist";
import { addPayoutReleaseRun } from "@/lib/payout-release-runs";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const defaultReleaseDays = Number(process.env.PAYOUT_AUTO_RELEASE_DAYS || "14");

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const fromHeader = req.headers.get("x-cron-secret");
  if (fromHeader === secret) return true;
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

/**
 * Auto-release pending payouts:
 * - if order is delivered, OR
 * - if order age is >= configured window (default 14 days)
 */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!stripe) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }

  const cutoff = new Date(Date.now() - defaultReleaseDays * 24 * 60 * 60 * 1000);
  const due = await prisma.payout.findMany({
    where: {
      status: "pending",
      order: {
        AND: [
          { status: { notIn: ["disputed", "refunded"] } },
          {
            OR: [{ status: "delivered" }, { createdAt: { lte: cutoff } }],
          },
        ],
      },
    },
    include: { order: true },
    take: 100,
  });

  const released: string[] = [];
  const manual: string[] = [];
  const failed: Array<{ payoutId: string; error: string }> = [];

  for (const payout of due) {
    try {
      if (payout.order.status === "disputed") {
        continue;
      }
      if (payout.gateway !== "stripe") {
        failed.push({ payoutId: payout.id, error: `Gateway ${payout.gateway} not supported for auto release` });
        continue;
      }

      const seller = await getSellerById(payout.sellerId);
      if (!seller?.connectedAccountId) {
        // Safe fallback: mark as manual payout required instead of failing the whole run.
        await prisma.payout.update({
          where: { id: payout.id },
          data: { status: "pending_manual" },
        }).catch(() => null);
        manual.push(payout.id);
        continue;
      }

      if (payout.payoutRef) {
        // Already released/ref tracked; mark as released for consistency.
        await prisma.payout.update({
          where: { id: payout.id },
          data: { status: "released", releasedAt: new Date() },
        });
        released.push(payout.id);
        continue;
      }

      const transfer = await stripe.transfers.create({
        amount: payout.amountMinor,
        currency: payout.currency.toLowerCase(),
        destination: seller.connectedAccountId,
        transfer_group: payout.order.transferGroup || `order_${payout.orderId}`,
        metadata: { payoutId: payout.id, orderId: payout.orderId, sellerId: payout.sellerId },
      });

      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: "released",
          releasedAt: new Date(),
          payoutRef: transfer.id,
        },
      });

      await prisma.marketplaceOrder.update({
        where: { id: payout.orderId },
        data: { status: "delivered" },
      });

      released.push(payout.id);
    } catch (e) {
      failed.push({ payoutId: payout.id, error: (e as Error).message || "unknown error" });
      await prisma.payout.update({
        where: { id: payout.id },
        data: { status: "failed" },
      }).catch(() => null);
    }
  }

  const result = {
    checked: due.length,
    releasedCount: released.length,
    manualCount: manual.length,
    failedCount: failed.length,
    failed,
  };

  await addPayoutReleaseRun({
    id: `run-${Date.now()}`,
    createdAt: new Date().toISOString(),
    checked: result.checked,
    releasedCount: result.releasedCount,
    failedCount: result.failedCount + result.manualCount,
    failed: result.failed,
  });

  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  return POST(req);
}
