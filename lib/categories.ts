/** All markets/categories Miaha international market targets */
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
  "Used Car",
  "Used Jewellery",
] as const;

export type Category = (typeof CATEGORIES)[number];
