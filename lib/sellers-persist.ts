import type { Seller } from "./types";
import { getSellersFile, addSellerFile, updateSellerFile } from "./store";
import { getRedisClient } from "./redis-client";

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

async function getKv() {
  return getRedisClient();
}

export async function getSellers(): Promise<Seller[]> {
  const allowDevSeller = process.env.ALLOW_DEV_SELLER === "true";
  const kv = await getKv();
  if (!kv) {
    if (process.env.NODE_ENV === "development") {
      const fileSellers = getSellersFile();
      if (fileSellers.length === 0 && allowDevSeller) return [await getDevSeller()];
      return fileSellers;
    }
    if (allowDevSeller) return [await getDevSeller()];
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
  if (kv) {
    const sellers = await getSellers();
    if (sellers.some((s) => s.email.toLowerCase() === seller.email.trim().toLowerCase())) {
      throw new Error("A seller with this email already exists.");
    }
    sellers.unshift(seller);
    await kv.set(KV_KEY, sellers);
    return seller;
  }
  if (process.env.NODE_ENV === "development") {
    return addSellerFile(seller);
  }
  throw new Error(
    "Database not configured. Set up Vercel KV: Project → Storage → Create Database → KV."
  );
}

export async function updateSeller(id: string, updates: Partial<Seller>): Promise<Seller | undefined> {
  const kv = await getKv();
  if (kv) {
    const sellers = await getSellers();
    const i = sellers.findIndex((s) => s.id === id);
    if (i < 0) return undefined;
    sellers[i] = { ...sellers[i], ...updates };
    await kv.set(KV_KEY, sellers);
    return sellers[i];
  }
  if (process.env.NODE_ENV === "development") {
    return updateSellerFile(id, updates);
  }
  return undefined;
}
