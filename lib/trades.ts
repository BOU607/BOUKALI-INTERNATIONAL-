/** Trade / service categories for plumbers, electricians, painters, etc. */
export const TRADE_CATEGORIES = [
  "Plumber",
  "Electrical",
  "Painter",
  "Carpenter",
  "HVAC",
  "Landscaping",
  "Cleaning",
  "Roofing",
  "Other",
] as const;

export type TradeCategory = (typeof TRADE_CATEGORIES)[number];
