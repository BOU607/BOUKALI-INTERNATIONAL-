import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSellerById } from "@/lib/sellers-persist";

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

type SellerStripeStatus =
  | "not_connected"
  | "needs_onboarding"
  | "restricted"
  | "ready";

export async function GET(req: NextRequest) {
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
  if (!seller) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  const accountId = seller.connectedAccountId;
  if (!accountId) {
    const baseUrl = getBaseUrl(req);
    return NextResponse.json({
      status: "not_connected" as SellerStripeStatus,
      onboardingUrl: `${baseUrl}/seller/payout?stripe=connect`,
    });
  }

  try {
    const account = await stripe.accounts.retrieve(accountId);
    const detailsSubmitted = account.details_submitted ?? false;
    const caps = account.capabilities || {};
    const cardPayments = (caps as any).card_payments;
    const transfers = (caps as any).transfers;
    const cardPaymentsActive = cardPayments === "active";
    const transfersActive = transfers === "active";

    let status: SellerStripeStatus;
    if (!detailsSubmitted || !cardPaymentsActive || !transfersActive) {
      status = "needs_onboarding";
    } else if (account.requirements?.disabled_reason) {
      status = "restricted";
    } else {
      status = "ready";
    }

    let onboardingUrl: string | null = null;
    if (status !== "ready") {
      const baseUrl = getBaseUrl(req);
      const link = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${baseUrl}/seller/payout?stripe=retry`,
        return_url: `${baseUrl}/seller/payout?stripe=connected`,
        type: "account_onboarding",
      });
      onboardingUrl = link.url;
    }

    return NextResponse.json({
      status,
      detailsSubmitted,
      cardPaymentsActive,
      transfersActive,
      disabledReason: account.requirements?.disabled_reason ?? null,
      onboardingUrl,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Stripe.errors?.StripeError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Failed to check Stripe account status";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

