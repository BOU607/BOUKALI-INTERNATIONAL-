import type { Product } from "./types";
import { getRedisClient } from "./redis-client";

const KV_KEY = "miaha:products";

export async function getProducts(): Promise<Product[]> {
  const kv = await getRedisClient();
  if (kv) {
    try {
      const raw = await kv.get(KV_KEY);
      if (Array.isArray(raw)) {
        const products = raw as Product[];
        return products.filter((p) => p && p.sellerId);
      }
      if (typeof raw === "string") {
        const parsed = JSON.parse(raw) as Product[];
        return Array.isArray(parsed) ? parsed.filter((p) => p?.sellerId) : [];
      }
    } catch (e) {
      console.warn("KV getProducts failed:", e);
    }
  }
  return [];
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.sellerId === sellerId);
}

export async function addProduct(product: Product): Promise<Product> {
  const kv = await getRedisClient();
  if (kv) {
    const products = await getProducts();
    products.unshift(product);
    await kv.set(KV_KEY, products);
    return product;
  }
  throw new Error("Database not configured. Set up Vercel KV for seller products.");
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
  const kv = await getRedisClient();
  if (!kv) return undefined;
  const products = await getProducts();
  const i = products.findIndex((p) => p.id === id);
  if (i < 0) return undefined;
  products[i] = { ...products[i], ...updates };
  await kv.set(KV_KEY, products);
  return products[i];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const kv = await getRedisClient();
  if (!kv) return false;
  const products = await getProducts().then((p) => p.filter((x) => x.id !== id));
  await kv.set(KV_KEY, products);
  return true;
}
