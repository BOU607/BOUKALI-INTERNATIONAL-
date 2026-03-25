import type { Product } from "./types";
import { getProductsForCatalog } from "./store";
import { getRedisClient } from "./redis-client";

const KV_KEY = "miaha:products";

function normalizeProducts(list: Product[]): Product[] {
  return list
    .filter((p) => p && p.id && p.name)
    .map((p) => ({
      ...p,
      sellerId: p.sellerId && p.sellerId.trim() !== "" ? p.sellerId : "platform",
    }));
}

/** Raw list in KV only (no demo fallback). Used for writes. */
async function getKvProductListOnly(): Promise<Product[]> {
  const kv = await getRedisClient();
  if (!kv) return [];
  try {
    const raw = await kv.get(KV_KEY);
    if (Array.isArray(raw)) return raw as Product[];
    if (typeof raw === "string") {
      const parsed = JSON.parse(raw) as Product[];
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    /* ignore */
  }
  return [];
}

export async function getProducts(): Promise<Product[]> {
  const kv = await getRedisClient();
  if (kv) {
    try {
      const raw = await kv.get(KV_KEY);
      let fromKv: Product[] = [];
      if (Array.isArray(raw)) fromKv = raw as Product[];
      else if (typeof raw === "string") {
        const parsed = JSON.parse(raw) as Product[];
        fromKv = Array.isArray(parsed) ? parsed : [];
      }
      const normalized = normalizeProducts(fromKv);
      if (normalized.length > 0) return normalized;
      return getProductsForCatalog();
    } catch (e) {
      console.warn("KV getProducts failed:", e);
      return getProductsForCatalog();
    }
  }
  return getProductsForCatalog();
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
    const products = await getKvProductListOnly();
    products.unshift(product);
    await kv.set(KV_KEY, products);
    return product;
  }
  throw new Error("Database not configured. Set up Vercel KV for seller products.");
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
  const kv = await getRedisClient();
  if (!kv) return undefined;
  const products = await getKvProductListOnly();
  const i = products.findIndex((p) => p.id === id);
  if (i < 0) return undefined;
  products[i] = { ...products[i], ...updates };
  await kv.set(KV_KEY, products);
  return products[i];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const kv = await getRedisClient();
  if (!kv) return false;
  const products = (await getKvProductListOnly()).filter((x) => x.id !== id);
  await kv.set(KV_KEY, products);
  return true;
}
