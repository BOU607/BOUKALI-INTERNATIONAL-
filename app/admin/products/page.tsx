"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-lg font-medium text-stone-200">
          Products
        </h2>
        <p className="text-ink-500 text-sm mt-1">
          Products are added by sellers. Approve sellers in the Sellers section.
        </p>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-ink-800">
                <th className="p-4 text-sm font-medium text-ink-500">Image</th>
                <th className="p-4 text-sm font-medium text-ink-500">Name</th>
                <th className="p-4 text-sm font-medium text-ink-500">Category</th>
                <th className="p-4 text-sm font-medium text-ink-500">Price</th>
                <th className="p-4 text-sm font-medium text-ink-500">Stock</th>
                <th className="p-4 text-sm font-medium text-ink-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-ink-800/50 hover:bg-ink-800/20">
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-ink-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4 font-medium text-stone-200">{p.name}</td>
                  <td className="p-4 text-ink-500">{p.category}</td>
                  <td className="p-4 text-brand-400">${p.price.toFixed(2)}</td>
                  <td className="p-4 text-ink-500">{p.stock}</td>
                  <td className="p-4 flex gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="btn-ghost text-sm py-1"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.name)}
                      className="btn-ghost text-sm py-1 text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <p className="p-8 text-center text-ink-500">No products yet. Sellers add products after registration and approval.</p>
        )}
      </div>
    </div>
  );
}
