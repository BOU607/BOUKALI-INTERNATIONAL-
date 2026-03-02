import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateOrderStatus } from "@/lib/store";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function GET(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }

  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }

  const orderId = session.metadata?.orderId;
  if (!orderId) {
    return NextResponse.json({ error: "Order not found" }, { status: 400 });
  }

  updateOrderStatus(orderId, "paid");
  return NextResponse.json({ orderId });
}
