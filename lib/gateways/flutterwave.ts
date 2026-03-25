import type { GatewayClient, GatewayCreateChargeInput, GatewayCreateChargeResult } from "./types";

/**
 * Phase 2 skeleton.
 * Wire real Flutterwave payment link/create endpoint here.
 */
export const flutterwaveGateway: GatewayClient = {
  async createCharge(input: GatewayCreateChargeInput): Promise<GatewayCreateChargeResult> {
    if (!process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error("Flutterwave gateway is not configured");
    }
    return {
      gateway: "flutterwave",
      referenceId: `flutterwave_${input.orderId}`,
      status: "pending",
      raw: { mocked: true },
    };
  },
};
