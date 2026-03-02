/**
 * Security helpers: validation and sanitization to protect against
 * injection, XSS, and oversized payloads.
 */

const MAX_STRING = 500;
const MAX_EMAIL = 254;
const MAX_ORDER_ITEMS = 50;
const MAX_ORDER_TOTAL = 1_000_000;
const MAX_PRODUCT_NAME = 200;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Strip potential XSS: remove script tags and limit length */
export function sanitizeString(value: unknown, maxLength = MAX_STRING): string {
  if (value == null) return "";
  const s = String(value).trim();
  const noScript = s
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
  return noScript.slice(0, maxLength);
}

export function isValidEmail(email: unknown): boolean {
  const s = typeof email === "string" ? email.trim() : "";
  return s.length > 0 && s.length <= MAX_EMAIL && EMAIL_REGEX.test(s);
}

export function isValidNumber(value: unknown, min: number, max: number): boolean {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
}

export type OrderPayload = {
  items?: Array unknown;
  total?: unknown;
  customer?: { name?: unknown; email?: unknown; address?: unknown };
};

/** Validate and sanitize order payload; returns error message or null if valid */
export function validateOrderPayload(body: unknown): { error: string } | null {
  if (body == null || typeof body !== "object") {
    return { error: "Invalid request body" };
  }
  const payload = body as OrderPayload;
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (items.length === 0) return { error: "Missing items" };
  if (items.length > MAX_ORDER_ITEMS) return { error: "Too many items" };

  const total = Number(payload.total);
  if (!Number.isFinite(total) || total < 0 || total > MAX_ORDER_TOTAL) {
    return { error: "Invalid total" };
  }

  const customer = payload.customer;
  if (!customer || typeof customer !== "object") {
    return { error: "Missing customer info" };
  }

  const name = sanitizeString(customer.name, 200);
  if (!name) return { error: "Missing customer name" };

  const email = typeof customer.email === "string" ? customer.email.trim() : "";
  if (!isValidEmail(email)) return { error: "Invalid or missing email" };

  const address = sanitizeString(customer.address, 500);
  if (!address) return { error: "Missing address" };

  return null;
}

/** Build a sanitized order item for storage */
export function sanitizeOrderItem(item: unknown): {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
} | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  const productId = sanitizeString(o.productId, 100);
  const name = sanitizeString(o.name ?? "Product", MAX_PRODUCT_NAME) || "Product";
  const price = Number(o.price);
  const quantity = Math.min(Math.max(Number(o.quantity) | 0, 1), 999);
  const image = sanitizeString(o.image, 2000);
  if (!productId || !Number.isFinite(price) || price < 0) return null;
  return { productId, name, price, quantity, image };
}

/** Validate and sanitize full order items array */
export function sanitizeOrderItems(items: unknown[]): Array<{
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}> | null {
  const out: Array<{ productId: string; name: string; price: number; quantity: number; image: string }> = [];
  for (const item of items) {
    const s = sanitizeOrderItem(item);
    if (!s) return null;
    out.push(s);
  }
  return out.length ? out : null;
}
