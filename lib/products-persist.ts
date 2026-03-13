import type { Product } from "./types";

const KV_KEY = "miaha:products";

function getKvCreds(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url, token };
  return null;
}

export async function getProducts(): Promise<Product[]> {
  const creds = getKvCreds();
  if (creds) {
    try {
      const { createClient } = await import("@vercel/kv");
      const kv = createClient({ url: creds.url, token: creds.token });
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
  const creds = getKvCreds();
  if (creds) {
    const { createClient } = await import("@vercel/kv");
    const kv = createClient({ url: creds.url, token: creds.token });
    const products = await getProducts();
    products.unshift(product);
    await kv.set(KV_KEY, products);
    return product;
  }
  throw new Error("Database not configured. Set up Vercel KV for seller products.");
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
  const creds = getKvCreds();
  if (!creds) return undefined;
  const { createClient } = await import("@vercel/kv");
  const kv = createClient({ url: creds.url, token: creds.token });
  const products = await getProducts();
  const i = products.findIndex((p) => p.id === id);
  if (i < 0) return undefined;
  products[i] = { ...products[i], ...updates };
  await kv.set(KV_KEY, products);
  return products[i];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const creds = getKvCreds();
  if (!creds) return false;
  const { createClient } = await import("@vercel/kv");
  const kv = createClient({ url: creds.url, token: creds.token });
  const products = await getProducts().then((p) => p.filter((x) => x.id !== id));
  await kv.set(KV_KEY, products);
  return true;
}
