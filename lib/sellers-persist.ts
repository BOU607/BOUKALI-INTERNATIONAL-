import type { Seller } from "./types";

const KV_KEY = "miaha:sellers";

/** Test seller (seller@test.com / seller123). Used in dev or when ALLOW_DEV_SELLER=true */
let devSellerPromise: Promise<Seller> | null = null;
async function getDevSeller(): Promise<Seller> {
  if (!devSellerPromise) {
    const { hash } = await import("bcryptjs");
    devSellerPromise = hash("seller123", 10).then((passwordHash) => ({
      id: "dev-seller",
      name: "Dev Seller",
      email: "seller@test.com",
      passwordHash,
      businessName: "Test Shop",
      phone: "",
      status: "approved" as const,
      createdAt: new Date().toISOString(),
    }));
  }
  return devSellerPromise;
}

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
  const allowDevSeller = process.env.ALLOW_DEV_SELLER === "true";
  const kv = await getKv();
  if (!kv) {
    if (process.env.NODE_ENV === "development" || allowDevSeller) {
      return [await getDevSeller()];
    }
    return [];
  }
  try {
    const raw = await kv.get(KV_KEY);
    let sellers: Seller[] = [];
    if (Array.isArray(raw)) sellers = raw as Seller[];
    else if (typeof raw === "string") {
      const parsed = JSON.parse(raw) as Seller[];
      sellers = Array.isArray(parsed) ? parsed : [];
    }
    if (sellers.length === 0 && allowDevSeller) {
      return [await getDevSeller()];
    }
    return sellers;
  } catch {
    return allowDevSeller ? [await getDevSeller()] : [];
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
  if (!kv) {
    if (process.env.NODE_ENV === "development" && id === "dev-seller") {
      const seller = await getDevSeller();
      Object.assign(seller, updates);
      return seller;
    }
    return undefined;
  }
  const sellers = await getSellers();
  const i = sellers.findIndex((s) => s.id === id);
  if (i < 0) return undefined;
  sellers[i] = { ...sellers[i], ...updates };
  await kv.set(KV_KEY, sellers);
  return sellers[i];
}
