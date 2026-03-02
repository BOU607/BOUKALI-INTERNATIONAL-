"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ products: 0, orders: 0, sales: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
    ]).then(([products, orders]) => {
      const sales = orders.reduce((s: number, o: { total?: number }) => s + (o.total ?? 0), 0);
      setStats({
        products: products.length,
        orders: orders.length,
        sales,
      });
    });
  }, []);

  return (
    <div>
      <h2 className="font-display text-lg font-medium text-stone-200 mb-6">
        Overview
      </h2>
      <div className="grid sm:grid-cols-3 gap-6">
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
        <div className="card p-6">
          <p className="text-ink-500 text-sm">Total sales</p>
          <p className="text-2xl font-semibold text-brand-400 mt-1">
            ${stats.sales.toFixed(2)}
          </p>
          <p className="text-ink-500 text-sm mt-1">All time</p>
        </div>
      </div>
    </div>
  );
}
