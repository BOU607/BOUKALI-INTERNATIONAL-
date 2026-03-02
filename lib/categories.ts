/** All markets/categories BOUKALI INTERNATIONAL targets */
export const CATEGORIES = [
  "Agriculture",
  "Seeds",
  "Men's Clothing",
  "Women's Clothing",
  "Kids",
  "Oil & Gas Equipment",
  "Spare Parts",
  "Paint",
  "Electronics",
] as const;

export type Category = (typeof CATEGORIES)[number];
