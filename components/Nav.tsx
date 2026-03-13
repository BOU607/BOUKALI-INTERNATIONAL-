"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { useI18n } from "./LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Nav() {
  const { totalItems } = useCart();
  const { t } = useI18n();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem("q") as HTMLInputElement)?.value?.trim();
    if (q) router.push(`/products?q=${encodeURIComponent(q)}`);
    else router.push("/products");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/95 backdrop-blur">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-display font-semibold text-xl text-stone-100 shrink-0">
          Miaha international market
        </Link>
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xl mx-4">
          <input
            type="search"
            name="q"
            placeholder={t("nav.searchPlaceholder")}
            className="input flex-1 rounded-r-none border-r-0 py-2 text-sm"
            aria-label={t("nav.searchPlaceholder")}
          />
          <button type="submit" className="btn-primary rounded-l-none py-2 px-4 text-sm">
            {t("products.search")}
          </button>
        </form>
        <nav className="flex items-center gap-3 sm:gap-5 shrink-0">
          <Link href="/" className="btn-ghost text-sm font-medium hidden sm:inline">
            {t("nav.home")}
          </Link>
          <LanguageSwitcher />
          <Link href="/products" className="btn-ghost text-sm">
            {t("nav.products")}
          </Link>
          <Link href="/services" className="btn-ghost text-sm hidden md:inline">
            {t("nav.services")}
          </Link>
          <Link href="/jobs" className="btn-ghost text-sm hidden md:inline">
            {t("nav.jobs")}
          </Link>
          <Link href="/track-order" className="btn-ghost text-sm hidden lg:inline">
            {t("nav.trackOrder")}
          </Link>
          <Link href="/cart" className="btn-ghost text-sm relative">
            {t("nav.cart")}
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-medium text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
          <Link href="/seller/login" className="btn-ghost text-sm">
            Seller
          </Link>
          <Link href="/admin" className="btn-ghost text-sm text-ink-500">
            {t("nav.admin")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
