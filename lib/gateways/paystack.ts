import type { GatewayClient, GatewayCreateChargeInput, GatewayCreateChargeResult } from "./types";

/**
 * Phase 2 skeleton.
 * Wire real Paystack initialize transaction endpoint here.
 */
export const paystackGateway: GatewayClient = {
  async createCharge(input: GatewayCreateChargeInput): Promise<GatewayCreateChargeResult> {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error("Paystack gateway is not configured");
    }
    // Placeholder reference. Replace with real API call result.
    return {
      gateway: "paystack",
      referenceId: `paystack_${input.orderId}`,
      status: "pending",
      raw: { mocked: true },
    };
  },
};
