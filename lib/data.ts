import type { Product, Order } from "./types";

const productsKey = "shop_products";
const ordersKey = "shop_orders";

const defaultProducts: Product[] = [
  {
    id: "1",
    sellerId: "legacy",
    name: "Classic Wireless Headphones",
    description: "Premium sound with 30-hour battery. Comfortable over-ear design.",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    category: "Electronics",
    stock: 50,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    sellerId: "legacy",
    name: "Minimalist Watch",
    description: "Sleek analog watch with leather strap. Water resistant.",
    price: 129.0,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    category: "Accessories",
    stock: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    sellerId: "legacy",
    name: "Organic Cotton T-Shirt",
    description: "Soft, sustainable cotton. Available in multiple colors.",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    category: "Clothing",
    stock: 100,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    sellerId: "legacy",
    name: "Portable Power Bank",
    description: "20,000 mAh. Fast charging for phones and tablets.",
    price: 45.0,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400",
    category: "Electronics",
    stock: 75,
    createdAt: new Date().toISOString(),
  },
];

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setInStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getProducts(): Product[] {
  return getFromStorage(productsKey, defaultProducts);
}

export function setProducts(products: Product[]) {
  setInStorage(productsKey, products);
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id);
}

export function getOrders(): Order[] {
  return getFromStorage(ordersKey, []);
}

export function setOrders(orders: Order[]) {
  setInStorage(ordersKey, orders);
}

export function addOrder(order: Order) {
  const orders = getOrders();
  orders.unshift(order);
  setOrders(orders);
}
