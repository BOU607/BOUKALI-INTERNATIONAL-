/** Seller on the marketplace - registers and lists products */
export type Seller = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  businessName: string;
  phone: string;
  /** pending = awaiting admin approval, approved = can list products */
  status: "pending" | "approved";
  createdAt: string;
  /** Payout: where to send seller's money */
  bankName?: string;
  accountHolder?: string;
  iban?: string;
  swift?: string;
  /** Stripe Connect account id (e.g. acct_...) for automated transfers */
  connectedAccountId?: string;
};

export type Product = {
  id: string;
  sellerId?: string;
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
  sellerId?: string;
  quantity: number;
  name?: string;
  price?: number;
  image?: string;
};

export type OrderItem = {
  productId: string;
  sellerId?: string;
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
  /** Subtotal (items only). Present when platform fees applied. */
  subtotal?: number;
  /** Buyer service fee (e.g. 1%). Present when platform fees applied. */
  buyerFee?: number;
  /** Seller fee (e.g. 1.5%) – deducted at payout. Present when platform fees applied. */
  sellerFee?: number;
  /** Stripe payment intent id from Checkout Session (if card payment). */
  paymentIntentId?: string;
  /** Stripe transfer group used for seller payouts for this order. */
  transferGroup?: string;
  /** Seller payout transfers created after delivery confirmation. */
  payoutTransfers?: Array<{
    sellerId: string;
    transferId: string;
    amount: number;
    currency: string;
    releasedAt: string;
  }>;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  /** Work category for tabs (e.g. Sales, IT & Tech). Defaults to "Other" if missing. */
  category?: string;
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
