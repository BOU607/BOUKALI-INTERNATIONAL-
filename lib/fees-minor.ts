import { BUYER_FEE_PERCENT, SELLER_FEE_PERCENT } from "./fees";

/**
 * Gross per seller in minor units (same basis as Stripe line_items / Prisma subtotalMinor).
 */
export function grossMinorBySellerFromItems(
  items: Array<{ price: number; quantity: number; sellerId?: string }>
): Map<string, number> {
  const m = new Map<string, number>();
  for (const i of items) {
    if (!i.sellerId) continue;
    const line = toMinor(i.price) * i.quantity;
    m.set(i.sellerId, (m.get(i.sellerId) ?? 0) + line);
  }
  return m;
}

/**
 * Split order-level seller fee across sellers by gross share; last seller (sorted id) gets remainder
 * so allocated fees sum exactly to orderSellerFeeMinor.
 */
export function allocateSellerFeePerSeller(
  orderSellerFeeMinor: number,
  grossBySeller: Map<string, number>
): Map<string, number> {
  const ids = Array.from(grossBySeller.keys())
    .filter((id) => (grossBySeller.get(id) ?? 0) > 0)
    .sort((a, b) => a.localeCompare(b));
  if (ids.length === 0) return new Map();
  let sumGross = 0;
  for (const id of ids) sumGross += grossBySeller.get(id) ?? 0;
  if (sumGross <= 0) return new Map();
  const out = new Map<string, number>();
  let allocated = 0;
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const gross = grossBySeller.get(id) ?? 0;
    if (i === ids.length - 1) {
      out.set(id, Math.max(0, orderSellerFeeMinor - allocated));
    } else {
      const share = Math.round((orderSellerFeeMinor * gross) / sumGross);
      out.set(id, share);
      allocated += share;
    }
  }
  return out;
}

/**
 * Stripe transfer amount per seller in minor units, aligned with webhook/Prisma:
 * fee is taken from ledger when present (subtotal − sellerFee), else percent of line-sum.
 */
export function computeSellerTransferAmountsMinor(input: {
  items: Array<{ price: number; quantity: number; sellerId?: string }>;
  ledger?: { sellerFeeMinor: number; currency: string } | null;
  /** No Prisma row: use fee from persisted order (major units → minor), if present */
  fallbackSellerFeeMinor?: number | null;
}): { perSeller: Map<string, number>; currency: string } {
  const gross = grossMinorBySellerFromItems(input.items);
  const sumGross = Array.from(gross.values()).reduce((a, b) => a + b, 0);
  const sellerFeeTotal =
    input.ledger?.sellerFeeMinor ??
    input.fallbackSellerFeeMinor ??
    percentMinor(sumGross, SELLER_FEE_PERCENT);
  const feeAlloc = allocateSellerFeePerSeller(sellerFeeTotal, gross);
  const perSeller = new Map<string, number>();
  for (const [id, g] of Array.from(gross.entries())) {
    if (g <= 0) continue;
    const fee = feeAlloc.get(id) ?? 0;
    perSeller.set(id, Math.max(0, g - fee));
  }
  const currency = (input.ledger?.currency ?? "aud").toLowerCase();
  return { perSeller, currency };
}

export function toMinor(amountMajor: number): number {
  return Math.round(amountMajor * 100);
}

export function fromMinor(amountMinor: number): number {
  return amountMinor / 100;
}

export function percentMinor(baseMinor: number, pct: number): number {
  return Math.round((baseMinor * pct) / 100);
}

export function computeFeesMinor(subtotalMinor: number): {
  subtotalMinor: number;
  buyerFeeMinor: number;
  sellerFeeMinor: number;
  totalMinor: number;
  buyerFeePercent: number;
  sellerFeePercent: number;
} {
  const buyerFeeMinor = percentMinor(subtotalMinor, BUYER_FEE_PERCENT);
  const sellerFeeMinor = percentMinor(subtotalMinor, SELLER_FEE_PERCENT);
  return {
    subtotalMinor,
    buyerFeeMinor,
    sellerFeeMinor,
    totalMinor: subtotalMinor + buyerFeeMinor,
    buyerFeePercent: BUYER_FEE_PERCENT,
    sellerFeePercent: SELLER_FEE_PERCENT,
  };
}

