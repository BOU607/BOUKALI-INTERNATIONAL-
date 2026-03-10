"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_BACKGROUND_IMAGES } from "@/lib/categories";
import { useI18n } from "@/components/LanguageProvider";

const PROMO_DISMISS_KEY = "miaha_promo_dismissed";

const CATEGORY_KEYS: Record<string, string> = {
  "Men's Clothing": "categories.men",
  "Women's Clothing": "categories.women",
  "Oil & Gas Equipment": "categories.oilGas",
  "Spare Parts": "categories.spareParts",
  "Used Car": "categories.usedCar",
  "Used Jewellery": "categories.usedJewellery",
  "Animals Feeds": "categories.animalsFeeds",
  Quincaillerie: "categories.quincaillerie",
  Pharmacognosy: "categories.pharmacognosy",
  "Medicinal plants": "categories.medicinalPlants",
  "Kids clothes and shoes": "categories.kidsClothesShoes",
  "New Fashion in the market": "categories.newFashion",
  "Electrical tools and equipment": "categories.electricalTools",
  "Construction materials and tools": "categories.constructionMaterials",
  "Computer and Laptop": "categories.computerLaptop",
  "Household appliances": "categories.householdAppliances",
  "Paints and tools": "categories.paintsAndTools",
  "Cows, sheep and horses": "categories.cowsSheepHorses",
};

export default function HomePage() {
  const { t } = useI18n();
  const [showPromo, setShowPromo] = useState(true);

  useEffect(() => {
    try {
      setShowPromo(!localStorage.getItem(PROMO_DISMISS_KEY));
    } catch {
      setShowPromo(true);
    }
  }, []);

  const dismissPromo = () => {
    try {
      localStorage.setItem(PROMO_DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setShowPromo(false);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      {showPromo && (
        <div className="w-full max-w-5xl mb-6 flex items-center justify-center gap-3 rounded-xl bg-brand-500/15 border border-brand-500/30 px-4 py-3 text-center">
          <span className="text-brand-200 font-medium">{t("home.promoBanner")}</span>
          <button
            type="button"
            onClick={dismissPromo}
            className="shrink-0 rounded p-1 text-ink-400 hover:text-stone-200 hover:bg-ink-800/50"
            aria-label={t("home.promoDismiss")}
          >
            ×
          </button>
        </div>
      )}
      <div className="max-w-2xl text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-stone-100 tracking-tight">
          {t("home.title")}
        </h1>
        <p className="mt-4 text-lg text-ink-500">
          {t("home.subtitle")}
        </p>
        <p className="mt-3 text-sm text-ink-400">
          <Link href="/sell" className="underline hover:text-brand-400">
            {t("home.firstSellersLine")}
          </Link>
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
          <Link href="/sell" className="btn-secondary text-base px-6 py-3">
            {t("home.sellOn")}
          </Link>
          <Link href="/trust" className="btn-ghost text-base px-6 py-3 text-ink-400 hover:text-stone-200">
            {t("nav.trust")}
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
            className="card p-4 text-center hover:border-brand-500/50 transition-colors min-h-[100px] flex items-center justify-center"
          >
            <span className="text-stone-200 font-medium">{t("home.all")}</span>
          </Link>
          {CATEGORIES.map((cat) => {
            const bgImage = CATEGORY_BACKGROUND_IMAGES[cat];
            return (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="relative overflow-hidden rounded-xl min-h-[100px] flex items-center justify-center p-4 border border-ink-800 hover:border-brand-500/50 transition-colors group"
                style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              >
                {bgImage && (
                  <span className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors" aria-hidden />
                )}
                <span className="relative z-10 text-stone-100 font-medium text-center text-sm drop-shadow-md">
                  {CATEGORY_KEYS[cat] ? t(CATEGORY_KEYS[cat]) : cat}
                </span>
              </Link>
            );
          })}
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
