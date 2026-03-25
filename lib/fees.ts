/**
 * Platform fees (configurable via env):
 * - BUYER_FEE_PERCENT (default 1)
 * - SELLER_FEE_PERCENT (default 1.5)
 */
function parsePercent(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export const BUYER_FEE_PERCENT = parsePercent(process.env.BUYER_FEE_PERCENT, 1);
export const SELLER_FEE_PERCENT = parsePercent(process.env.SELLER_FEE_PERCENT, 1.5);

export function roundAUD(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeFees(subtotal: number): {
  subtotal: number;
  buyerFee: number;
  sellerFee: number;
  total: number;
} {
  const st = roundAUD(subtotal);
  const buyerFee = roundAUD(st * (BUYER_FEE_PERCENT / 100));
  const sellerFee = roundAUD(st * (SELLER_FEE_PERCENT / 100));
  const total = roundAUD(st + buyerFee);
  return { subtotal: st, buyerFee, sellerFee, total };
}

export function paySellerAmount(subtotal: number, sellerFee: number): number {
  return roundAUD(subtotal - sellerFee);
}
