import Stripe from "stripe";
import type { GatewayClient, GatewayCreateChargeInput, GatewayCreateChargeResult } from "./types";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const stripeGateway: GatewayClient = {
  async createCharge(input: GatewayCreateChargeInput): Promise<GatewayCreateChargeResult> {
    if (!stripe) {
      throw new Error("Stripe gateway is not configured");
    }
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: input.currency.toLowerCase(),
              product_data: { name: `Order ${input.orderId}` },
              unit_amount: input.amountMinor,
            },
            quantity: 1,
          },
        ],
        customer_email: input.customerEmail,
        success_url: input.successUrl || "",
        cancel_url: input.cancelUrl || "",
        metadata: { orderId: input.orderId },
      },
      { idempotencyKey: input.idempotencyKey }
    );

    return {
      gateway: "stripe",
      referenceId: session.id,
      checkoutUrl: session.url || undefined,
      status: "pending",
      raw: { id: session.id },
    };
  },
};
