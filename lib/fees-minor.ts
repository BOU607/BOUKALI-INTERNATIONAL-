import { BUYER_FEE_PERCENT, SELLER_FEE_PERCENT } from "./fees";

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

