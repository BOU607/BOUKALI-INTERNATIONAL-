import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { addOrder } from "@/lib/store";
import type { Order, OrderItem } from "@/lib/types";
import {
  validateOrderPayload,
  sanitizeOrderItems,
  sanitizeString,
} from "@/lib/security";

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

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Payments not configured. Set STRIPE_SECRET_KEY." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const err = validateOrderPayload(body);
  if (err) {
    return NextResponse.json({ error: err.error }, { status: 400 });
  }

  const payload = body as {
    items: unknown[];
    total: number;
    customer: { name: unknown; email: unknown; address: unknown };
  };
  const items = sanitizeOrderItems(payload.items);
  if (!items) {
    return NextResponse.json({ error: "Invalid items" }, { status: 400 });
  }

  const total = Number(payload.total);
  if (!Number.isFinite(total) || total < 0) {
    return NextResponse.json({ error: "Invalid total" }, { status: 400 });
  }

  const orderId = `ord-${Date.now()}`;
  const customer = {
    name: sanitizeString(payload.customer.name, 200),
    email: String(payload.customer.email).trim().toLowerCase(),
    address: sanitizeString(payload.customer.address, 500),
  };

  const order: Order = {
    id: orderId,
    items: items as OrderItem[],
    total,
    customer,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  addOrder(order);

  const baseUrl = getBaseUrl(req);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: items.map((i) => ({
      price_data: {
        currency: "aud",
        product_data: {
          name: i.name,
          images: i.image ? [i.image] : undefined,
        },
        unit_amount: Math.round(i.price * 100),
      },
      quantity: i.quantity,
    })),
    mode: "payment",
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout`,
    metadata: { orderId },
    customer_email: customer.email,
  });

  return NextResponse.json({ url: session.url, orderId });
}
