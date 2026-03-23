import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSellerById, updateSeller } from "@/lib/sellers-persist";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host && !host.includes("localhost")) return `${proto}://${host}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return appUrl.replace(/\/$/, "");
}

/** Create or resume Stripe Connect onboarding link for seller. */
export async function POST(req: NextRequest) {
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
  if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

  const country = (process.env.STRIPE_CONNECT_COUNTRY || "FR").toUpperCase();
  let accountId = seller.connectedAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country,
      email: seller.email,
      business_type: "individual",
      metadata: { sellerId: seller.id },
    });
    accountId = account.id;
    await updateSeller(seller.id, { connectedAccountId: accountId });
  }

  const baseUrl = getBaseUrl(req);
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/seller/payout?stripe=retry`,
    return_url: `${baseUrl}/seller/payout?stripe=connected`,
    type: "account_onboarding",
  });
  return NextResponse.json({ url: accountLink.url, connectedAccountId: accountId });
}

