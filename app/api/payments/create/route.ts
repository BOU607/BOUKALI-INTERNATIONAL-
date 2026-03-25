import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sanitizeOrderItems, sanitizeString, validateOrderPayload } from "@/lib/security";
import { computeFeesMinor, fromMinor, toMinor } from "@/lib/fees-minor";
import { chooseGatewayByCountry } from "@/lib/gateway-router";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get("host") || "";
  const protocol = req.headers.get("x-forwarded-proto") || "https";
  if (host && !host.includes("localhost")) {
    return `${protocol}://${host}`;
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && (appUrl.startsWith("https://") || appUrl.startsWith("http://"))) {
    return appUrl.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

/**
 * Phase 1 payment create controller:
 * - Chooses gateway by country (Stripe active in this phase)
 * - Creates Stripe checkout
 * - Persists order + transaction with idempotency key
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const idempotencyKey = req.headers.get("x-idempotency-key")?.trim()
    || (typeof body === "object" && body && "idempotencyKey" in body
      ? String((body as { idempotencyKey?: unknown }).idempotencyKey ?? "").trim()
      : "");
  if (!idempotencyKey) {
    return NextResponse.json(
      { error: "Missing idempotency key (x-idempotency-key header or idempotencyKey body field)." },
      { status: 400 }
    );
  }

  const payloadErr = validateOrderPayload(body);
  if (payloadErr) return NextResponse.json({ error: payloadErr.error }, { status: 400 });

  const payload = body as {
    items: unknown[];
    total: number;
    customer: { name: unknown; email: unknown; address: unknown };
    buyerCountry?: string;
  };
  const items = sanitizeOrderItems(payload.items);
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Invalid items" }, { status: 400 });
  }

  const gateway = chooseGatewayByCountry(payload.buyerCountry);
  if (gateway !== "stripe") {
    return NextResponse.json(
      { error: `Gateway ${gateway} not enabled yet in phase 1.` },
      { status: 501 }
    );
  }
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  const existing = await prisma.transaction.findUnique({ where: { idempotencyKey } });
  if (existing) {
    return NextResponse.json({
      idempotentReplay: true,
      orderId: existing.orderId,
      transactionId: existing.id,
      gateway: existing.gateway,
    });
  }

  const subtotalMinor = items.reduce(
    (sum, i) => sum + toMinor(i.price) * i.quantity,
    0
  );
  const fees = computeFeesMinor(subtotalMinor);
  const declaredTotalMinor = toMinor(Number(payload.total));
  if (Math.abs(declaredTotalMinor - fees.totalMinor) > 2) {
    return NextResponse.json(
      { error: "Total does not match subtotal + buyer fee" },
      { status: 400 }
    );
  }

  const sellerId = items.find((i) => i.sellerId)?.sellerId;
  if (!sellerId) {
    return NextResponse.json({ error: "Missing seller on order items" }, { status: 400 });
  }

  const orderId = `ord-${Date.now()}`;
  const transferGroup = `order_${orderId}`;
  const baseUrl = getBaseUrl(req);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      ...items.map((i) => ({
        price_data: {
          currency: "aud",
          product_data: { name: i.name, images: i.image ? [i.image] : undefined },
          unit_amount: toMinor(i.price),
        },
        quantity: i.quantity,
      })),
      ...(fees.buyerFeeMinor > 0
        ? [{
            price_data: {
              currency: "aud",
              product_data: { name: `Service fee (${fees.buyerFeePercent}%)` },
              unit_amount: fees.buyerFeeMinor,
            },
            quantity: 1,
          }]
        : []),
    ],
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout`,
    metadata: { orderId },
    customer_email: String(payload.customer.email).trim().toLowerCase(),
    payment_intent_data: { transfer_group: transferGroup },
  });

  await prisma.marketplaceOrder.create({
    data: {
      id: orderId,
      sellerId,
      buyerId: null,
      currency: "AUD",
      subtotalMinor: fees.subtotalMinor,
      buyerFeeMinor: fees.buyerFeeMinor,
      sellerFeeMinor: fees.sellerFeeMinor,
      totalMinor: fees.totalMinor,
      status: "pending",
      gateway: "stripe",
      transferGroup,
    },
  });

  await prisma.transaction.create({
    data: {
      orderId,
      gateway: "stripe",
      gatewayTxnId: session.id,
      amountMinor: fees.totalMinor,
      currency: "AUD",
      platformCommissionMinor: fees.buyerFeeMinor + fees.sellerFeeMinor,
      status: "pending",
      idempotencyKey,
      rawPayload: {
        customer: {
          name: sanitizeString(payload.customer.name, 200),
          email: String(payload.customer.email).trim().toLowerCase(),
          address: sanitizeString(payload.customer.address, 500),
        },
        items: items.map((i) => ({
          productId: i.productId,
          sellerId: i.sellerId,
          name: i.name,
          quantity: i.quantity,
          unitPriceMinor: toMinor(i.price),
          lineTotalMinor: toMinor(i.price) * i.quantity,
        })),
        subtotal: fromMinor(fees.subtotalMinor),
        buyerFee: fromMinor(fees.buyerFeeMinor),
        sellerFee: fromMinor(fees.sellerFeeMinor),
      },
    },
  });

  return NextResponse.json({
    gateway: "stripe",
    orderId,
    checkoutUrl: session.url,
    totals: {
      subtotalMinor: fees.subtotalMinor,
      buyerFeeMinor: fees.buyerFeeMinor,
      sellerFeeMinor: fees.sellerFeeMinor,
      totalMinor: fees.totalMinor,
    },
  });
}

