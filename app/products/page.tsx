"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { useCart } from "@/components/CartProvider";
import { CATEGORIES } from "@/lib/categories";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category") ?? "";
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    const url = selectedCategory
      ? `/api/products?category=${encodeURIComponent(selectedCategory)}`
      : "/api/products";
    fetch(url)
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="aspect-square bg-ink-800 rounded-xl" />
              <div className="h-4 bg-ink-800 rounded mt-4 w-3/4" />
              <div className="h-4 bg-ink-800 rounded mt-2 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold text-stone-100 mb-4">
        {selectedCategory ? `${selectedCategory}` : "All products"}
      </h1>
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/products"
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            !selectedCategory
              ? "bg-brand-500 text-white"
              : "bg-ink-800 text-ink-400 hover:text-stone-200 hover:bg-ink-700"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/products?category=${encodeURIComponent(cat)}`}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-brand-500 text-white"
                : "bg-ink-800 text-ink-400 hover:text-stone-200 hover:bg-ink-700"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <article key={p.id} className="card overflow-hidden group hover:border-ink-700 transition-colors">
            <Link href={`/products/${p.id}`} className="block aspect-square overflow-hidden bg-ink-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <div className="p-4">
              <span className="text-xs text-brand-400 font-medium uppercase tracking-wider">
                {p.category}
              </span>
              <Link href={`/products/${p.id}`}>
                <h2 className="font-medium text-stone-200 mt-1 hover:text-brand-400 transition-colors">
                  {p.name}
                </h2>
              </Link>
              <p className="text-brand-400 font-semibold mt-2">${p.price.toFixed(2)}</p>
              <button
                type="button"
                onClick={() =>
                  addItem(p.id, 1, { name: p.name, price: p.price, image: p.image })
                }
                className="btn-primary w-full mt-3 text-sm py-2"
              >
                Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>
      {!loading && products.length === 0 && (
        <p className="text-ink-500 text-center py-12">No products in this category yet. Try another or check back soon.</p>
      )}
    </div>
  );
}

function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="aspect-square bg-ink-800 rounded-xl" />
            <div className="h-4 bg-ink-800 rounded mt-4 w-3/4" />
            <div className="h-4 bg-ink-800 rounded mt-2 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsPageContent />
    </Suspense>
  );
}
