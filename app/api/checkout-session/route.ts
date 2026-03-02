import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { addOrder, updateOrderStatus } from "@/lib/store";
import type { Order, OrderItem } from "@/lib/types";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

function getBaseUrl(req: NextRequest): string {
  const origin = req.headers.get("origin") || req.headers.get("host");
  if (origin) {
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    return origin.startsWith("http") ? origin : `${protocol}://${origin}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Payments not configured. Set STRIPE_SECRET_KEY." },
      { status: 503 }
    );
  }

  const body = (await req.json()) as {
    items: OrderItem[];
    total: number;
    customer: { name: string; email: string; address: string };
  };
  const { items, total, customer } = body;

  if (!items?.length || !customer?.name || !customer?.email) {
    return NextResponse.json(
      { error: "Missing items or customer info" },
      { status: 400 }
    );
  }

  const orderId = `ord-${Date.now()}`;
  const order: Order = {
    id: orderId,
    items,
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
