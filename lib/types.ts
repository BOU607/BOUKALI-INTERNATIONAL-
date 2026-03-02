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

export type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  customer: { name: string; email: string; address: string };
  status: "pending" | "paid" | "shipped" | "delivered";
  createdAt: string;
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
