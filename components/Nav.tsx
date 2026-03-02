"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function Nav() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/90 backdrop-blur">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display font-semibold text-xl text-stone-100">
          Shop
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/products" className="btn-ghost text-sm">
            Products
          </Link>
          <Link href="/cart" className="btn-ghost text-sm relative">
            Cart
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-medium text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
          <Link href="/admin" className="btn-ghost text-sm text-ink-500">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
