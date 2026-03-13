import type { Seller } from "./types";

const KV_KEY = "miaha:sellers";

function getKvCreds(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url, token };
  return null;
}

async function getKv() {
  const creds = getKvCreds();
  if (!creds) return null;
  const { createClient } = await import("@vercel/kv");
  return createClient({ url: creds.url, token: creds.token });
}

export async function getSellers(): Promise<Seller[]> {
  const kv = await getKv();
  if (!kv) return [];
  try {
    const raw = await kv.get(KV_KEY);
    if (Array.isArray(raw)) return raw as Seller[];
    if (typeof raw === "string") {
      const parsed = JSON.parse(raw) as Seller[];
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch {
    return [];
  }
}

export async function getSellerById(id: string): Promise<Seller | undefined> {
  const sellers = await getSellers();
  return sellers.find((s) => s.id === id);
}

export async function getSellerByEmail(email: string): Promise<Seller | undefined> {
  const sellers = await getSellers();
  return sellers.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());
}

export async function addSeller(seller: Seller): Promise<Seller> {
  const kv = await getKv();
  if (!kv) throw new Error("Database not configured. Set up Vercel KV.");
  const sellers = await getSellers();
  if (sellers.some((s) => s.email.toLowerCase() === seller.email.trim().toLowerCase())) {
    throw new Error("A seller with this email already exists.");
  }
  sellers.unshift(seller);
  await kv.set(KV_KEY, sellers);
  return seller;
}

export async function updateSeller(id: string, updates: Partial<Seller>): Promise<Seller | undefined> {
  const kv = await getKv();
  if (!kv) return undefined;
  const sellers = await getSellers();
  const i = sellers.findIndex((s) => s.id === id);
  if (i < 0) return undefined;
  sellers[i] = { ...sellers[i], ...updates };
  await kv.set(KV_KEY, sellers);
  return sellers[i];
}
