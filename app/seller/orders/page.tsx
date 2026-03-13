"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { Order } from "@/lib/types";
import { formatAUD } from "@/lib/currency";

export default function SellerOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const sellerId = session?.user?.id;

  const myOrders = orders.filter((o) =>
    o.items.some((i) => i.sellerId === sellerId)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/seller/dashboard" className="btn-ghost text-sm mb-6 inline-flex">
        ← Back to dashboard
      </Link>
      <h2 className="font-display text-lg font-medium text-stone-200 mb-6">
        Orders containing your products
      </h2>
      {loading ? (
        <p className="text-ink-500">Loading…</p>
      ) : myOrders.length === 0 ? (
        <p className="text-ink-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => {
            const myItems = order.items.filter((i) => i.sellerId === sellerId);
            const myTotal = myItems.reduce((s, i) => s + i.price * i.quantity, 0);
            return (
              <div key={order.id} className="card p-6">
                <p className="font-mono text-sm text-ink-500">{order.id}</p>
                <p className="font-medium text-stone-200 mt-1">
                  {order.customer.name} — {order.customer.email}
                </p>
                <p className="text-sm text-ink-500 mt-1">{order.customer.address}</p>
                <ul className="mt-3 space-y-1 text-sm text-ink-500">
                  {myItems.map((item) => (
                    <li key={item.productId}>
                      {item.name} × {item.quantity} — {formatAUD(item.price * item.quantity)}
                    </li>
                  ))}
                </ul>
                <p className="font-medium text-brand-400 mt-2">
                  Your total: {formatAUD(myTotal)}
                </p>
                <p className="text-xs text-ink-500 mt-1">
                  Status: {order.status} · {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
