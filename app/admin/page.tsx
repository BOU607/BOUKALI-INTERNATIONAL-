"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Visit = { id: string; city?: string; countryRegion?: string; country?: string; createdAt: string };
type Order = { id: string; total: number; status: string; createdAt: string };

function decodeLoc(s: string | undefined): string {
  if (!s) return "";
  try {
    return decodeURIComponent(s).replace(/%20/g, " ");
  } catch {
    return s.replace(/%20/g, " ");
  }
}
function formatLoc(v: Visit): string {
  const parts = [v.city, v.countryRegion, v.country].filter(Boolean).map(decodeLoc);
  return parts.length ? parts.join(", ") : "—";
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ products: 0, orders: 0, sales: 0, sellers: 0 });
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/visits").then((r) => r.json()),
      fetch("/api/admin/sellers").then((r) => r.json()),
    ]).then(([products, orders, visitsData, sellers]) => {
      const ordersList = Array.isArray(orders) ? orders : [];
      const sales = ordersList.reduce((s: number, o: { total?: number }) => s + (o.total ?? 0), 0);
      const sellersList = Array.isArray(sellers) ? sellers : [];
      setStats({
        products: products.length,
        orders: ordersList.length,
        sales,
        sellers: sellersList.length,
      });
      setRecentOrders(ordersList.slice(0, 5));
      const visits = Array.isArray(visitsData) ? visitsData : (visitsData.visits ?? []);
      setRecentVisits(visits.slice(0, 5));
    });
  }, []);

  return (
    <div>
      <h2 className="font-display text-lg font-medium text-stone-200 mb-6">
        Overview
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Link href="/admin/products" className="card p-6 hover:border-ink-700 transition-colors">
          <p className="text-ink-500 text-sm">Products</p>
          <p className="text-2xl font-semibold text-stone-100 mt-1">{stats.products}</p>
          <p className="text-ink-500 text-sm mt-1">Manage catalog</p>
        </Link>
        <Link href="/admin/orders" className="card p-6 hover:border-ink-700 transition-colors">
          <p className="text-ink-500 text-sm">Orders</p>
          <p className="text-2xl font-semibold text-stone-100 mt-1">{stats.orders}</p>
          <p className="text-ink-500 text-sm mt-1">View all orders</p>
        </Link>
        <Link href="/admin/sellers" className="card p-6 hover:border-ink-700 transition-colors">
          <p className="text-ink-500 text-sm">Sellers</p>
          <p className="text-2xl font-semibold text-stone-100 mt-1">{stats.sellers}</p>
          <p className="text-ink-500 text-sm mt-1">Approve sellers</p>
        </Link>
        <div className="card p-6">
          <p className="text-ink-500 text-sm">Total sales</p>
          <p className="text-2xl font-semibold text-brand-400 mt-1">
            ${stats.sales.toFixed(2)}
          </p>
          <p className="text-ink-500 text-sm mt-1">All time</p>
        </div>
      </div>

      <h3 className="font-display text-base font-medium text-stone-200 mb-4">Recent activity</h3>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-ink-500 text-sm">Latest visitors</p>
            <Link href="/admin/visitors" className="text-brand-400 text-sm hover:underline">View all</Link>
          </div>
          {recentVisits.length === 0 ? (
            <p className="text-ink-500 text-sm">No visits yet. Visitors are logged when someone loads the site.</p>
          ) : (
            <ul className="space-y-2">
              {recentVisits.map((v) => (
                <li key={v.id} className="flex justify-between text-sm">
                  <span className="text-stone-300">{formatLoc(v)}</span>
                  <span className="text-ink-500">{new Date(v.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-ink-500 text-sm">Latest orders</p>
            <Link href="/admin/orders" className="text-brand-400 text-sm hover:underline">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-ink-500 text-sm">No orders yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex justify-between text-sm">
                  <span className="text-stone-300 font-mono">{o.id}</span>
                  <span className="text-ink-500">${o.total.toFixed(2)} · {o.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
