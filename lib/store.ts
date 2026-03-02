import type { Product, Order } from "./types";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const PRODUCTS_FILE = join(DATA_DIR, "products.json");
const ORDERS_FILE = join(DATA_DIR, "orders.json");

const defaultProducts: Product[] = [
  {
    id: "1",
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
    name: "Portable Power Bank",
    description: "20,000 mAh. Fast charging for phones and tablets.",
    price: 45.0,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400",
    category: "Electronics",
    stock: 75,
    createdAt: new Date().toISOString(),
  },
];

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readProducts(): Product[] {
  ensureDataDir();
  if (!existsSync(PRODUCTS_FILE)) {
    writeFileSync(PRODUCTS_FILE, JSON.stringify(defaultProducts, null, 2));
    return defaultProducts;
  }
  return JSON.parse(readFileSync(PRODUCTS_FILE, "utf-8"));
}

function writeProducts(products: Product[]) {
  ensureDataDir();
  writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

function readOrders(): Order[] {
  ensureDataDir();
  if (!existsSync(ORDERS_FILE)) return [];
  return JSON.parse(readFileSync(ORDERS_FILE, "utf-8"));
}

function writeOrders(orders: Order[]) {
  ensureDataDir();
  writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

export function getProducts(): Product[] {
  return readProducts();
}

export function getProductById(id: string): Product | undefined {
  return readProducts().find((p) => p.id === id);
}

export function saveProduct(product: Product) {
  const products = readProducts();
  const i = products.findIndex((p) => p.id === product.id);
  if (i >= 0) products[i] = product;
  else products.push(product);
  writeProducts(products);
  return product;
}

export function deleteProduct(id: string) {
  const products = readProducts().filter((p) => p.id !== id);
  writeProducts(products);
}

export function getOrders(): Order[] {
  return readOrders();
}

export function addOrder(order: Order) {
  const orders = readOrders();
  orders.unshift(order);
  writeOrders(orders);
  return order;
}

export function updateOrderStatus(orderId: string, status: Order["status"]) {
  const orders = readOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    writeOrders(orders);
  }
  return order;
}
