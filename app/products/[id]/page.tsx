"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { useCart } from "@/components/CartProvider";
import { formatAUD } from "@/lib/currency";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto animate-pulse">
          <div className="aspect-square bg-ink-800 rounded-2xl" />
          <div className="h-8 bg-ink-800 rounded mt-6 w-2/3" />
          <div className="h-4 bg-ink-800 rounded mt-4 w-full" />
          <div className="h-4 bg-ink-800 rounded mt-2 w-3/4" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-ink-500">Product not found.</p>
        <Link href="/products" className="btn-primary mt-4 inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product.id, qty, {
      name: product.name,
      price: product.price,
      image: product.image,
    });
    router.push("/cart");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="btn-ghost text-sm mb-6 inline-flex">
        ← Back to products
      </Link>
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-2xl overflow-hidden bg-ink-900 border border-ink-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <span className="text-xs text-brand-400 font-medium uppercase tracking-wider">
            {product.category}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-stone-100 mt-1">
            {product.name}
          </h1>
          <p className="text-3xl font-semibold text-brand-400 mt-4">
            {formatAUD(product.price)}
          </p>
          <p className="text-ink-500 mt-6 leading-relaxed">{product.description}</p>
          <p className="text-sm text-ink-500 mt-4">
            In stock: {product.stock}
          </p>
          <div className="flex items-center gap-4 mt-8">
            <label className="flex items-center gap-2">
              <span className="text-sm text-ink-500">Qty</span>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="input w-20 text-center py-2"
              />
            </label>
            <button
              type="button"
              onClick={handleAddToCart}
              className="btn-primary flex-1 max-w-xs"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
