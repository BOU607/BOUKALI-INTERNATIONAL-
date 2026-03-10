"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/LanguageProvider";
import { formatAUD } from "@/lib/currency";

type ProductCardProps = {
  product: Product;
  categoryLabel: string;
};

export function ProductCard({ product, categoryLabel }: ProductCardProps) {
  const { addItem } = useCart();
  const { t } = useI18n();

  return (
    <article className="card overflow-hidden group hover:border-ink-600 hover:shadow-lg hover:shadow-black/20 transition-all duration-200">
      <Link href={`/products/${product.id}`} className="block aspect-square overflow-hidden bg-ink-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="p-4">
        <span className="text-xs text-brand-400 font-medium uppercase tracking-wider">
          {categoryLabel}
        </span>
        <Link href={`/products/${product.id}`}>
          <h2 className="font-medium text-stone-200 mt-1 hover:text-brand-400 transition-colors line-clamp-2">
            {product.name}
          </h2>
        </Link>
        <p className="text-brand-400 font-semibold mt-2">{formatAUD(product.price)}</p>
        <button
          type="button"
          onClick={() =>
            addItem(product.id, 1, { name: product.name, price: product.price, image: product.image })
          }
          className="btn-primary w-full mt-3 text-sm py-2"
        >
          {t("products.addToCart")}
        </button>
      </div>
    </article>
  );
}
