import type { Order } from "./types";
import {
  addOrder as addOrderFile,
  getOrders as getOrdersFile,
  updateOrderStatus as updateOrderStatusFile,
  updateOrdersCustomer as updateOrdersCustomerFile,
} from "./store";
import { getRedisClient } from "./redis-client";

const KV_KEY = "miaha:orders";

export async function getOrders(): Promise<Order[]> {
  const kv = await getRedisClient();
  if (kv) {
    try {
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
  const kv = await getRedisClient();
  if (kv) {
    try {
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
    return order;
  }
}

export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<Order | undefined> {
  const kv = await getRedisClient();
  if (kv) {
    try {
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

/** Update customer name/email for all orders with the given customer email. Returns number of orders updated. */
export async function updateCustomerForEmail(
  currentEmail: string,
  updates: { name?: string; newEmail?: string }
): Promise<number> {
  const kv = await getRedisClient();
  if (kv) {
    try {
      const orders = await getOrders();
      const key = currentEmail.trim().toLowerCase();
      let count = 0;
      for (const o of orders) {
        const e = (o.customer?.email ?? "").trim().toLowerCase();
        if (e !== key) continue;
        if (updates.name !== undefined) o.customer.name = updates.name.trim();
        if (updates.newEmail !== undefined) o.customer.email = updates.newEmail.trim().toLowerCase();
        count++;
      }
      if (count > 0) await kv.set(KV_KEY, orders);
      return count;
    } catch (e) {
      console.warn("KV updateCustomerForEmail failed:", e);
      return 0;
    }
  }
  return updateOrdersCustomerFile(currentEmail, updates);
}
