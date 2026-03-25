export type SupportedCurrency = "USD" | "EUR" | "NGN" | "AUD";

const CURRENCY_DECIMALS: Record<SupportedCurrency, number> = {
  USD: 2,
  EUR: 2,
  NGN: 2,
  AUD: 2,
};

export function toMinorUnits(amountMajor: number, currency: SupportedCurrency): number {
  const decimals = CURRENCY_DECIMALS[currency] ?? 2;
  const factor = Math.pow(10, decimals);
  return Math.round(amountMajor * factor);
}

export function fromMinorUnits(amountMinor: number, currency: SupportedCurrency): number {
  const decimals = CURRENCY_DECIMALS[currency] ?? 2;
  const factor = Math.pow(10, decimals);
  return amountMinor / factor;
}

export function formatMoney(amountMinor: number, currency: SupportedCurrency, locale = "en"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: CURRENCY_DECIMALS[currency] ?? 2,
  }).format(fromMinorUnits(amountMinor, currency));
}
/** Display price in Australian dollars */
export function formatAUD(amount: number): string {
  return `A$${amount.toFixed(2)}`;
}
