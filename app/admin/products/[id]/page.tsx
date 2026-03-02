"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/lib/types";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/admin/products");
    } catch {
      alert("Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse h-40 card" />;
  if (!product) {
    return (
      <div>
        <p className="text-ink-500">Product not found.</p>
        <Link href="/admin/products" className="btn-primary mt-4 inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/products" className="btn-ghost text-sm mb-6 inline-flex">
        ← Back to products
      </Link>
      <h2 className="font-display text-lg font-medium text-stone-200 mb-6">
        Edit product
      </h2>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
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
            value={product.description}
            onChange={(e) =>
              setProduct((p) => (p ? { ...p, description: e.target.value } : p))
            }
            className="input mt-1 min-h-[100px]"
            rows={3}
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink-500">Image URL</span>
          <input
            type="url"
            value={product.image}
            onChange={(e) =>
              setProduct((p) => (p ? { ...p, image: e.target.value } : p))
            }
            className="input mt-1"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-ink-500">Category</span>
            <input
              type="text"
              value={product.category}
              onChange={(e) =>
                setProduct((p) => (p ? { ...p, category: e.target.value } : p))
              }
              className="input mt-1"
            />
          </label>
          <label className="block">
            <span className="text-sm text-ink-500">Price</span>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={product.price}
              onChange={(e) =>
                setProduct((p) =>
                  p ? { ...p, price: parseFloat(e.target.value) || 0 } : p
                )
              }
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
            onChange={(e) =>
              setProduct((p) =>
                p ? { ...p, stock: parseInt(e.target.value, 10) || 0 } : p
              )
            }
            className="input mt-1 w-32"
          />
        </label>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save changes"}
          </button>
          <Link href="/admin/products" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
