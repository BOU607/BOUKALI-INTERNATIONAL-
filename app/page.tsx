"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { useI18n } from "@/components/LanguageProvider";

const CATEGORY_KEYS: Record<string, string> = {
  "Men's Clothing": "categories.men",
  "Women's Clothing": "categories.women",
  "Oil & Gas Equipment": "categories.oilGas",
  "Spare Parts": "categories.spareParts",
  "Used Car": "categories.usedCar",
  "Used Jewellery": "categories.usedJewellery",
};

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-stone-100 tracking-tight">
          {t("home.title")}
        </h1>
        <p className="mt-4 text-lg text-ink-500">
          {t("home.subtitle")}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/products" className="btn-primary text-base px-6 py-3">
            {t("home.browseProducts")}
          </Link>
          <Link href="/services" className="btn-secondary text-base px-6 py-3">
            {t("home.findPro")}
          </Link>
          <Link href="/jobs" className="btn-secondary text-base px-6 py-3">
            {t("home.findJobs")}
          </Link>
          <Link href="/admin" className="btn-secondary text-base px-6 py-3">
            {t("home.sellOn")}
          </Link>
        </div>
      </div>
      <section className="mt-24 w-full max-w-5xl">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-6 text-center">
          {t("home.shopByCategory")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link
            href="/products"
            className="card p-4 text-center hover:border-brand-500/50 transition-colors"
          >
            <span className="text-stone-200 font-medium">{t("home.all")}</span>
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className="card p-4 text-center hover:border-brand-500/50 transition-colors"
            >
              <span className="text-stone-200 font-medium">
                {CATEGORY_KEYS[cat] ? t(CATEGORY_KEYS[cat]) : cat}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-24 w-full max-w-4xl">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-6 text-center">
          {t("home.howItWorks")}
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="card p-6 text-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 font-semibold">
              1
            </span>
            <h3 className="mt-3 font-medium text-stone-200">{t("home.browse")}</h3>
            <p className="mt-1 text-sm text-ink-500">{t("home.browseDesc")}</p>
          </div>
          <div className="card p-6 text-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 font-semibold">
              2
            </span>
            <h3 className="mt-3 font-medium text-stone-200">{t("home.addToCart")}</h3>
            <p className="mt-1 text-sm text-ink-500">{t("home.addToCartDesc")}</p>
          </div>
          <div className="card p-6 text-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 font-semibold">
              3
            </span>
            <h3 className="mt-3 font-medium text-stone-200">{t("home.checkout")}</h3>
            <p className="mt-1 text-sm text-ink-500">{t("home.checkoutDesc")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
