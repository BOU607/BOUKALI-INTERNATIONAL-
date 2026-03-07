"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";
import { formatAUD } from "@/lib/currency";

type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "refunded";

type TrackedOrder = {
  id: string;
  status: OrderStatus;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  createdAt: string;
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  refunded: "Refunded",
};

export default function TrackOrderPage() {
  const { t } = useI18n();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);
    fetch(
      `/api/order-track?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`
    )
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error || "Not found"); });
        return r.json();
      })
      .then(setOrder)
      .catch((err) => setError(err.message || "Order not found."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <h1 className="font-display text-2xl font-semibold text-stone-100 mb-2">
        {t("trackOrder.title")}
      </h1>
      <p className="text-ink-500 text-sm mb-8">
        {t("trackOrder.enterDetails")}
      </p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4 mb-8">
        <div>
          <label htmlFor="orderId" className="block text-sm font-medium text-stone-300 mb-1">
            {t("trackOrder.orderId")}
          </label>
          <input
            id="orderId"
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. ord-123..."
            className="input w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-1">
            {t("trackOrder.email")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input w-full"
            required
          />
        </div>
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? t("trackOrder.checking") : t("trackOrder.track")}
        </button>
      </form>

      {order && (
        <div className="card p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-ink-500 text-sm">{t("trackOrder.orderId")}: {order.id}</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === "refunded"
                  ? "bg-red-500/20 text-red-400"
                  : order.status === "delivered"
                    ? "bg-green-500/20 text-green-400"
                    : order.status === "shipped"
                      ? "bg-blue-500/20 text-blue-400"
                      : order.status === "paid"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-ink-700 text-ink-300"
              }`}
            >
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="text-ink-500 text-sm">
            {t("trackOrder.placed")}: {new Date(order.createdAt).toLocaleString()}
          </p>
          <ul className="border-t border-ink-800 pt-4 space-y-2">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-stone-200">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-ink-500">{formatAUD(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="flex justify-between font-medium text-stone-100 pt-2 border-t border-ink-800">
            {t("cart.total")}
            <span>{formatAUD(order.total)}</span>
          </p>
        </div>
      )}

      <p className="mt-8 text-center">
        <Link href="/" className="btn-ghost text-sm">
          ← {t("nav.home")}
        </Link>
      </p>
    </div>
  );
}
