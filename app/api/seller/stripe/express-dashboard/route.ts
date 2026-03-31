import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSellerById } from "@/lib/sellers-persist";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/** Single-use login link to the Express Dashboard (manage payouts, see requirements). */
export async function POST() {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY." },
      { status: 503 }
    );
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const seller = await getSellerById(session.user.id);
  if (!seller?.connectedAccountId?.trim()) {
    return NextResponse.json(
      { error: "No connected account yet. Use Connect Stripe account first." },
      { status: 400 }
    );
  }
  try {
    const login = await stripe.accounts.createLoginLink(seller.connectedAccountId);
    return NextResponse.json({ url: login.url });
  } catch (e) {
    const message =
      e instanceof Stripe.errors.StripeError
        ? e.message
        : e instanceof Error
          ? e.message
          : "Could not open Stripe dashboard.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
