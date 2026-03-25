import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Stripe webhook: source of truth for transaction state transitions.
 */
export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const tx = await prisma.transaction.findFirst({
        where: { gateway: "stripe", gatewayTxnId: session.id },
      });
      if (!tx) break;
      const order = await prisma.marketplaceOrder.findUnique({ where: { id: tx.orderId } });
      if (!order) break;

      await prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: "paid",
          rawPayload: { stripeEventId: event.id, sessionId: session.id },
        },
      });

      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : null;
      await prisma.marketplaceOrder.update({
        where: { id: order.id },
        data: {
          status: "paid",
          paymentIntentId: paymentIntentId ?? undefined,
        },
      });

      const existingPayout = await prisma.payout.findFirst({
        where: { orderId: order.id, sellerId: order.sellerId },
      });
      if (!existingPayout) {
        const amountMinor = Math.max(order.subtotalMinor - order.sellerFeeMinor, 0);
        await prisma.payout.create({
          data: {
            orderId: order.id,
            sellerId: order.sellerId,
            gateway: order.gateway,
            amountMinor,
            currency: order.currency,
            status: "pending",
          },
        });
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await prisma.marketplaceOrder.updateMany({
        where: { paymentIntentId: intent.id },
        data: { status: "pending" },
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
