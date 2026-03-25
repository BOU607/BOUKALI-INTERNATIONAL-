export type PaymentGateway = "stripe" | "paystack" | "flutterwave";

/**
 * Phase 1 router:
 * keep Stripe as default while preparing for multi-gateway.
 * You can move this to DB policies later.
 */
export function chooseGatewayByCountry(country?: string): PaymentGateway {
  const c = (country ?? "").trim().toUpperCase();
  if (["NG", "GH", "KE"].includes(c)) return "paystack";
  if (["ZA", "UG", "TZ"].includes(c)) return "flutterwave";
  return "stripe";
}

