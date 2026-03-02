"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { useI18n } from "./LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Nav() {
  const { totalItems } = useCart();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/90 backdrop-blur">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display font-semibold text-xl text-stone-100">
          BOUKALI INTERNATIONAL
        </Link>
        <nav className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link href="/products" className="btn-ghost text-sm">
            {t("nav.products")}
          </Link>
          <Link href="/services" className="btn-ghost text-sm">
            {t("nav.services")}
          </Link>
          <Link href="/jobs" className="btn-ghost text-sm">
            {t("nav.jobs")}
          </Link>
          <Link href="/cart" className="btn-ghost text-sm relative">
            {t("nav.cart")}
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-medium text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
          <Link href="/admin" className="btn-ghost text-sm text-ink-500">
            {t("nav.admin")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
