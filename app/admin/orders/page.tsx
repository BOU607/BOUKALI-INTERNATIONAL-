"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const updateStatus = async (orderId: string, status: Order["status"]) => {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  const totalSales = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="font-display text-lg font-medium text-stone-200">
          Orders & sales
        </h2>
        <p className="text-brand-400 font-semibold">
          Total sales: ${totalSales.toFixed(2)}
        </p>
      </div>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="font-mono text-sm text-ink-500">{order.id}</p>
                <p className="font-medium text-stone-200 mt-1">
                  {order.customer.name} — {order.customer.email}
                </p>
                <p className="text-sm text-ink-500 mt-1">{order.customer.address}</p>
                {order.visitorLocation && (
                  <p className="text-xs text-brand-400 mt-1">
                    Location: {[order.visitorLocation.city, order.visitorLocation.countryRegion, order.visitorLocation.country].filter(Boolean).join(", ") || "—"}
                    {order.visitorLocation.latitude && order.visitorLocation.longitude && (
                      <span className="text-ink-500 ml-1">({order.visitorLocation.latitude}, {order.visitorLocation.longitude})</span>
                    )}
                  </p>
                )}
                <p className="text-xs text-ink-500 mt-2">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <ul className="mt-3 space-y-1 text-sm text-ink-500">
                  {order.items.map((item) => (
                    <li key={item.productId}>
                      {item.name} × {item.quantity} — $
                      {(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-medium text-brand-400">
                  Total: ${order.total.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    order.status === "refunded"
                      ? "bg-red-500/20 text-red-400"
                      : order.status === "delivered"
                        ? "bg-green-500/20 text-green-400"
                        : order.status === "shipped"
                          ? "bg-blue-500/20 text-blue-400"
                          : order.status === "paid"
                            ? "bg-brand-500/20 text-brand-400"
                            : "bg-ink-600 text-ink-400"
                  }`}
                >
                  {order.status}
                </span>
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatus(order.id, e.target.value as Order["status"])
                  }
                  className="input py-1.5 text-sm w-32"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
      {orders.length === 0 && (
        <p className="text-ink-500 text-center py-12">No orders yet.</p>
      )}
    </div>
  );
}
