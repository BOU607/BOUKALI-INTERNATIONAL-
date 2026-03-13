import type { Order } from "./types";
import { addOrder as addOrderFile, getOrders as getOrdersFile, updateOrderStatus as updateOrderStatusFile } from "./store";

const KV_KEY = "miaha:orders";

function getKvCreds(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url, token };
  return null;
}

export async function getOrders(): Promise<Order[]> {
  const creds = getKvCreds();
  if (creds) {
    try {
      const { createClient } = await import("@vercel/kv");
      const kv = createClient({ url: creds.url, token: creds.token });
      const raw = await kv.get(KV_KEY);
      if (Array.isArray(raw)) return raw as Order[];
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw) as Order[];
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    } catch (e) {
      console.warn("KV getOrders failed:", e);
      return [];
    }
  }
  return getOrdersFile();
}

export async function addOrder(order: Order): Promise<Order> {
  const creds = getKvCreds();
  if (creds) {
    try {
      const { createClient } = await import("@vercel/kv");
      const kv = createClient({ url: creds.url, token: creds.token });
      const orders = await getOrders();
      orders.unshift(order);
      await kv.set(KV_KEY, orders);
      return order;
    } catch (e) {
      console.error("KV addOrder failed:", e);
      throw e;
    }
  }
  try {
    return addOrderFile(order);
  } catch (e) {
    console.error("File addOrder failed (Vercel has read-only FS):", e);
    // Still return order so customer gets bank details; order won't appear in Admin.
    // Set up Vercel KV for persistent orders in production.
    return order;
  }
}

export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<Order | undefined> {
  const creds = getKvCreds();
  if (creds) {
    try {
      const { createClient } = await import("@vercel/kv");
      const kv = createClient({ url: creds.url, token: creds.token });
      const orders = await getOrders();
      const order = orders.find((o) => o.id === orderId);
      if (!order) return undefined;
      order.status = status;
      await kv.set(KV_KEY, orders);
      return order;
    } catch (e) {
      console.warn("KV updateOrderStatus failed:", e);
      return undefined;
    }
  }
  return updateOrderStatusFile(orderId, status);
}
