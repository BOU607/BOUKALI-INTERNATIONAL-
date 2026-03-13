"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";

export default function SellerEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          category: product.category,
          stock: product.stock,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update.");
        setSaving(false);
        return;
      }
      router.push("/seller/dashboard");
    } catch {
      setError("Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-8 text-ink-500">Loading…</p>;
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-ink-500">Product not found.</p>
        <Link href="/seller/dashboard" className="btn-primary mt-4 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/seller/dashboard" className="btn-ghost text-sm mb-6 inline-flex">
        ← Back to dashboard
      </Link>
      <h2 className="font-display text-lg font-medium text-stone-200 mb-6">
        Edit product
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-ink-500">Name</span>
          <input
            type="text"
            required
            value={product.name}
            onChange={(e) => setProduct((p) => p ? { ...p, name: e.target.value } : p)}
            className="input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink-500">Description</span>
          <textarea
            required
            value={product.description}
            onChange={(e) => setProduct((p) => p ? { ...p, description: e.target.value } : p)}
            className="input mt-1 min-h-[100px]"
            rows={3}
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink-500">Image URL</span>
          <input
            type="url"
            value={product.image}
            onChange={(e) => setProduct((p) => p ? { ...p, image: e.target.value } : p)}
            className="input mt-1"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-ink-500">Category</span>
            <select
              value={product.category}
              onChange={(e) => setProduct((p) => p ? { ...p, category: e.target.value } : p)}
              className="input mt-1"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-ink-500">Price (AUD)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={product.price}
              onChange={(e) => setProduct((p) => p ? { ...p, price: parseFloat(e.target.value) || 0 } : p)}
              className="input mt-1"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm text-ink-500">Stock</span>
          <input
            type="number"
            min="0"
            value={product.stock}
            onChange={(e) => setProduct((p) => p ? { ...p, stock: parseInt(e.target.value, 10) || 0 } : p)}
            className="input mt-1 w-32"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save"}
          </button>
          <Link href="/seller/dashboard" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
