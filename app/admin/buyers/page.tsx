"use client";

import { useEffect, useState } from "react";

type Buyer = {
  email: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
};

export default function AdminBuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/buyers")
      .then((r) => r.json())
      .then(setBuyers)
      .finally(() => setLoading(false));
  }, []);

  const q = search.trim().toLowerCase();
  const filtered =
    q === ""
      ? buyers
      : buyers.filter(
          (b) =>
            b.email.toLowerCase().includes(q) ||
            (b.name && b.name.toLowerCase().includes(q))
        );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card p-4 h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-lg font-medium text-stone-200 mb-4">
        Buyers
      </h2>
      <p className="text-sm text-ink-500 mb-6">
        Unique customers from orders. Search by name or email to find buyers.
      </p>
      <div className="mb-6">
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full max-w-md"
          aria-label="Search buyers"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-800 text-left text-ink-500">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium text-right">Orders</th>
              <th className="p-3 font-medium text-right">Total spent</th>
              <th className="p-3 font-medium">Last order</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr
                key={b.email}
                className="border-b border-ink-800/50 hover:bg-ink-900/30"
              >
                <td className="p-3 text-stone-200">{b.name}</td>
                <td className="p-3 text-ink-400 font-mono">{b.email}</td>
                <td className="p-3 text-right text-stone-300">{b.orderCount}</td>
                <td className="p-3 text-right text-brand-400 font-medium">
                  ${b.totalSpent.toFixed(2)}
                </td>
                <td className="p-3 text-ink-500">
                  {new Date(b.lastOrderAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <p className="text-ink-500 text-center py-12">
          {buyers.length === 0
            ? "No buyers yet. Buyers appear here after customers place orders."
            : "No buyers match your search."}
        </p>
      )}
    </div>
  );
}
