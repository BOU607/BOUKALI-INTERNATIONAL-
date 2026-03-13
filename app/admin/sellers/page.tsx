"use client";

import { useEffect, useState } from "react";
import type { Seller } from "@/lib/types";

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/sellers")
      .then((r) => r.json())
      .then(setSellers)
      .catch(() => setSellers([]))
      .finally(() => setLoading(false));
  }, []);

  const approve = async (id: string) => {
    const res = await fetch(`/api/admin/sellers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    if (res.ok) setSellers((prev) => prev.map((s) => (s.id === id ? { ...s, status: "approved" as const } : s)));
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

  return (
    <div>
      <h2 className="font-display text-lg font-medium text-stone-200 mb-6">
        Sellers
      </h2>
      <p className="text-ink-500 text-sm mb-6">
        Approve sellers to allow them to list products.
      </p>
      <div className="space-y-4">
        {sellers.length === 0 ? (
          <p className="text-ink-500">No sellers yet.</p>
        ) : (
          sellers.map((s) => (
            <div key={s.id} className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-stone-200">{s.name}</p>
                <p className="text-sm text-ink-500">{s.email}</p>
                <p className="text-sm text-ink-500">{s.businessName}</p>
                {s.phone && <p className="text-xs text-ink-500">{s.phone}</p>}
                <span
                  className={`inline-flex mt-2 rounded-full px-3 py-1 text-xs font-medium ${
                    s.status === "approved" ? "bg-green-500/20 text-green-400" : "bg-ink-600 text-ink-400"
                  }`}
                >
                  {s.status}
                </span>
              </div>
              {s.status === "pending" && (
                <button
                  type="button"
                  onClick={() => approve(s.id)}
                  className="btn-primary text-sm py-2"
                >
                  Approve
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
