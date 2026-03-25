"use client";

import { useEffect, useState } from "react";
import type { Order, OrderItem } from "@/lib/types";
import { BUYER_FEE_PERCENT, paySellerAmount, SELLER_FEE_PERCENT } from "@/lib/fees";

type SellerSafe = {
  id: string;
  name: string;
  email: string;
  businessName: string;
  bankName?: string;
  accountHolder?: string;
  iban?: string;
  swift?: string;
  connectedAccountId?: string;
};

function orderPayoutsBySeller(order: Order): { sellerId: string; subtotal: number; fee: number; pay: number }[] {
  const bySeller = new Map<string, OrderItem[]>();
  for (const item of order.items) {
    const sid = item.sellerId ?? "unknown";
    if (!bySeller.has(sid)) bySeller.set(sid, []);
    bySeller.get(sid)!.push(item);
  }
  return Array.from(bySeller.entries()).map(([sellerId, items]) => {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const fee = Math.round(subtotal * (SELLER_FEE_PERCENT / 100) * 100) / 100;
    const pay = paySellerAmount(subtotal, fee);
    return { sellerId, subtotal, fee, pay };
  });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<SellerSafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasingOrderId, setReleasingOrderId] = useState<string | null>(null);
  const [releaseMessage, setReleaseMessage] = useState<string>("");

  const load = () => {
    Promise.all([
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/admin/sellers").then((r) => r.json()),
    ])
      .then(([ordersData, sellersData]) => {
        setOrders(ordersData);
        setSellers(sellersData);
      })
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

  const confirmDeliveryAndRelease = async (orderId: string) => {
    setReleaseMessage("");
    setReleasingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm-delivery`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setReleaseMessage(data?.error ?? "Failed to release payout.");
      } else {
        setReleaseMessage(`Delivery confirmed. Created ${data.createdTransfers} transfer(s).`);
        load();
      }
    } catch {
      setReleaseMessage("Failed to release payout.");
    } finally {
      setReleasingOrderId(null);
    }
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
                {order.subtotal != null && order.buyerFee != null && order.sellerFee != null ? (
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-ink-500">
                      {`Subtotal: $${order.subtotal.toFixed(2)} · Buyer fee (${BUYER_FEE_PERCENT}%): $${order.buyerFee.toFixed(2)} · Seller fee (${SELLER_FEE_PERCENT}%): $${order.sellerFee.toFixed(2)}`}
                    </p>
                    <p className="font-medium text-brand-400">
                      Total: ${order.total.toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 font-medium text-brand-400">
                    Total: ${order.total.toFixed(2)}
                  </p>
                )}
                {orderPayoutsBySeller(order).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-ink-700 space-y-2">
                    <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">Payouts</p>
                    {orderPayoutsBySeller(order).map(({ sellerId, subtotal, fee, pay }) => {
                      const seller = sellers.find((s) => s.id === sellerId);
                      const name = seller ? (seller.businessName || seller.name) : sellerId === "unknown" ? "Unknown seller" : sellerId;
                      const hasBank = seller && (seller.iban || seller.bankName || seller.accountHolder);
                      return (
                        <div key={sellerId} className="text-sm rounded-lg bg-ink-900/60 p-3 border border-ink-800">
                          <p className="font-medium text-stone-200">
                            Pay {name}: ${pay.toFixed(2)}
                            {seller?.email && <span className="text-ink-500 font-normal ml-1">({seller.email})</span>}
                          </p>
                          {hasBank && seller ? (
                            <div className="mt-1.5 text-xs text-ink-500 font-mono space-y-0.5">
                              {seller.accountHolder && <p>Account: {seller.accountHolder}</p>}
                              {seller.bankName && <p>Bank: {seller.bankName}</p>}
                              {seller.iban && <p>IBAN: {seller.iban}</p>}
                              {seller.swift && <p>SWIFT: {seller.swift}</p>}
                              {seller.connectedAccountId && <p>Stripe: {seller.connectedAccountId}</p>}
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-amber-500/90">No payout details on file</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-stretch sm:items-end gap-2 flex-shrink-0 w-full sm:w-auto">
                <div className="flex flex-wrap items-center gap-2 justify-end">
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
            {(order.status === "paid" || order.status === "shipped" || order.status === "delivered") && (
              <div className="mt-4 pt-4 border-t border-brand-500/30 rounded-b-lg bg-ink-900/40 px-1 pb-1">
                <p className="text-xs font-medium text-stone-300 mb-2">Stripe Connect payout</p>
                <p className="text-xs text-ink-500 mb-3">
                  When the buyer has received the order, confirm here to send the seller&apos;s share from Stripe to their connected account. This is separate from manual bank (IBAN) payouts above.
                </p>
                <button
                  type="button"
                  className="btn-primary text-sm py-3 px-4 w-full max-w-md"
                  disabled={releasingOrderId === order.id}
                  onClick={() => confirmDeliveryAndRelease(order.id)}
                >
                  {releasingOrderId === order.id ? "Releasing…" : "Confirm delivery — release Stripe payout"}
                </button>
              </div>
            )}
            {releaseMessage && (
              <p className="text-xs mt-2 text-brand-400">{releaseMessage}</p>
            )}
          </div>
        ))}
      </div>
      {orders.length === 0 && (
        <p className="text-ink-500 text-center py-12">No orders yet.</p>
      )}
    </div>
  );
}
