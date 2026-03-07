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
  "Animals Feeds",
  "Quincaillerie",
  "Pharmacognosy",
  "Medicinal plants",
  "Kids clothes and shoes",
  "New Fashion in the market",
  "Electrical tools and equipment",
  "Construction materials and tools",
  "Paints and tools",
  "Cows, sheep and horses",
] as const;

export type Category = (typeof CATEGORIES)[number];
