export type GatewayCreateChargeInput = {
  orderId: string;
  amountMinor: number;
  currency: string;
  customerEmail: string;
  idempotencyKey: string;
  successUrl?: string;
  cancelUrl?: string;
};

export type GatewayCreateChargeResult = {
  gateway: "stripe" | "paystack" | "flutterwave";
  referenceId: string;
  checkoutUrl?: string;
  status: "pending" | "paid" | "failed";
  raw?: unknown;
};

export type GatewayClient = {
  createCharge(input: GatewayCreateChargeInput): Promise<GatewayCreateChargeResult>;
};
