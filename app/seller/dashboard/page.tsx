"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatAUD } from "@/lib/currency";

export default function SellerDashboardPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const sellerId = session?.user?.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-100">
            Seller dashboard
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Welcome, {session?.user?.name ?? "Seller"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/seller/products/new" className="btn-primary text-sm py-2">
            Add product
          </Link>
          <Link href="/seller/orders" className="btn-secondary text-sm py-2">
            My orders
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="btn-ghost text-sm py-2"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-medium text-stone-200 mb-4">Your products</h2>
        {loading ? (
          <p className="text-ink-500">Loading…</p>
        ) : products.length === 0 ? (
          <p className="text-ink-500">
            No products yet.{" "}
            <Link href="/seller/products/new" className="text-brand-400 hover:underline">
              Add your first product
            </Link>
          </p>
        ) : (
          <ul className="space-y-4">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-ink-900/50 border border-ink-800"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-ink-800 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-200">{p.name}</p>
                    <p className="text-brand-400 font-semibold">{formatAUD(p.price)}</p>
                    <p className="text-xs text-ink-500">Stock: {p.stock}</p>
                  </div>
                </div>
                <Link
                  href={`/seller/products/${p.id}`}
                  className="btn-secondary text-sm py-2 w-fit"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link href="/" className="inline-block mt-6 text-sm text-ink-500 hover:text-stone-300">
        ← Back to store
      </Link>
    </div>
  );
}
