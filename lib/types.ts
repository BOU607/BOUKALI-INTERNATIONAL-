export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
  name?: string;
  price?: number;
  image?: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

/** Approximate location from IP (e.g. Vercel geo headers) */
export type OrderLocation = {
  country?: string;
  countryRegion?: string;
  city?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
};

export type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  customer: { name: string; email: string; address: string };
  status: "pending" | "paid" | "shipped" | "delivered" | "refunded";
  createdAt: string;
  /** Detected location when order was placed (from request IP) */
  visitorLocation?: OrderLocation;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  description: string;
  createdAt: string;
};

export type Service = {
  id: string;
  trade: string;
  businessName: string;
  description: string;
  phone: string;
  email: string;
  location: string;
  createdAt: string;
};

/** One visitor connection log (from IP geo) */
export type Visit = {
  id: string;
  createdAt: string;
  country?: string;
  countryRegion?: string;
  city?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
};
