import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getOrders, addOrder } from "@/lib/store";
import type { Order } from "@/lib/types";
import {
  validateOrderPayload,
  sanitizeOrderItems,
  sanitizeString,
} from "@/lib/security";
import { getLocationFromRequest } from "@/lib/geo";

/** GET orders: admin only — prevents data leak to unauthenticated users */
export async function GET(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }
  let token = null;
  try {
    token = await getToken({ req, secret });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = getOrders();
  return NextResponse.json(orders);
}

/** POST order: validate and sanitize to prevent injection / abuse */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const err = validateOrderPayload(body);
  if (err) {
    return NextResponse.json({ error: err.error }, { status: 400 });
  }

  const payload = body as {
    items: unknown[];
    total: number;
    customer: { name: unknown; email: unknown; address: unknown };
  };
  const items = sanitizeOrderItems(payload.items);
  if (!items) {
    return NextResponse.json({ error: "Invalid items" }, { status: 400 });
  }

  const total = Number(payload.total);
  if (!Number.isFinite(total) || total < 0) {
    return NextResponse.json({ error: "Invalid total" }, { status: 400 });
  }

  const visitorLocation = getLocationFromRequest(req);
  const order: Order = {
    id: `ord-${Date.now()}`,
    items,
    total,
    customer: {
      name: sanitizeString(payload.customer.name, 200),
      email: String(payload.customer.email).trim().toLowerCase(),
      address: sanitizeString(payload.customer.address, 500),
    },
    status: "pending",
    createdAt: new Date().toISOString(),
    visitorLocation: Object.keys(visitorLocation).length > 0 ? visitorLocation : undefined,
  };
  addOrder(order);
  return NextResponse.json(order);
}
