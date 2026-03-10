"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/LanguageProvider";
import { formatAUD } from "@/lib/currency";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { t } = useI18n();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-stone-100">{t("cart.title")}</h1>
        <p className="text-ink-500 mt-2">{t("cart.empty")}</p>
        <Link href="/products" className="btn-primary mt-6 inline-block">
          {t("home.browseProducts")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold text-stone-100 mb-8">
        {t("cart.title")} ({totalItems} {totalItems === 1 ? t("cart.item") : t("cart.items")})
      </h1>
      <div className="max-w-3xl space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
          >
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-ink-800 flex-shrink-0">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.name ?? ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-ink-700" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-200 truncate">{item.name ?? "Product"}</p>
              <p className="text-brand-400 text-sm">{formatAUD(item.price ?? 0)} {t("cart.each")}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.productId, Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                className="input w-16 text-center py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                className="btn-ghost text-red-400 hover:text-red-300 text-sm"
              >
                {t("cart.remove")}
              </button>
            </div>
            <p className="font-medium text-stone-200 w-20 text-right">
              {formatAUD((item.price ?? 0) * item.quantity)}
            </p>
          </div>
        ))}
      </div>
      <div className="max-w-3xl mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/products" className="btn-ghost">
            {t("cart.continueShopping")}
          </Link>
          <button
            type="button"
            onClick={() => clearCart()}
            className="btn-ghost text-red-400 hover:text-red-300 text-sm"
          >
            {t("cart.clearCart")}
          </button>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-lg font-semibold text-stone-200">
            {t("cart.total")}: <span className="text-brand-400">{formatAUD(totalPrice)}</span>
          </p>
          <Link href="/checkout" className="btn-primary">
            {t("cart.checkout")}
          </Link>
        </div>
      </div>
    </div>
  );
}
