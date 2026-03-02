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
