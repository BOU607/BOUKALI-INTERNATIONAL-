"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/lib/types";

const defaultProduct: Partial<Product> = {
  name: "",
  description: "",
  price: 0,
  image: "",
  category: "",
  stock: 0,
};

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState(defaultProduct);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          image: form.image,
          category: form.category,
          stock: Number(form.stock) || 0,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const product = await res.json();
      router.push(`/admin/products/${product.id}`);
    } catch {
      alert("Failed to create product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link href="/admin/products" className="btn-ghost text-sm mb-6 inline-flex">
        ← Back to products
      </Link>
      <h2 className="font-display text-lg font-medium text-stone-200 mb-6">
        Add product
      </h2>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <label className="block">
          <span className="text-sm text-ink-500">Name</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink-500">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="input mt-1 min-h-[100px]"
            rows={3}
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink-500">Image URL</span>
          <input
            type="url"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            className="input mt-1"
            placeholder="https://..."
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-ink-500">Category</span>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="input mt-1"
              placeholder="e.g. Electronics"
            />
          </label>
          <label className="block">
            <span className="text-sm text-ink-500">Price</span>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.price || ""}
              onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
              className="input mt-1"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm text-ink-500">Stock</span>
          <input
            type="number"
            min="0"
            value={form.stock ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, stock: parseInt(e.target.value, 10) || 0 }))}
            className="input mt-1 w-32"
          />
        </label>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Create product"}
          </button>
          <Link href="/admin/products" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
