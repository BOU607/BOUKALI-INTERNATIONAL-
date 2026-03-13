"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { useI18n } from "@/components/LanguageProvider";
import { CATEGORIES } from "@/lib/categories";
import { ShareButton } from "@/components/ShareButton";
import { ProductCard } from "@/components/ProductCard";

const CATEGORY_KEYS: Record<string, string> = {
  "Accommodation (Apartments, Studios, Hotels)": "categories.accommodation",
  "Homemade Sweets & Cakes": "categories.homemadeSweets",
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

const SORT_OPTIONS = [
  { value: "newest", labelKey: "products.sortNewest" },
  { value: "price-asc", labelKey: "products.sortPriceAsc" },
  { value: "price-desc", labelKey: "products.sortPriceDesc" },
] as const;

function sortProducts(products: Product[], sort: string): Product[] {
  const list = [...products];
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category") ?? "";
  const qFromUrl = searchParams.get("q") ?? "";
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [searchQuery, setSearchQuery] = useState(qFromUrl);
  const [sort, setSort] = useState("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
    setSearchQuery(qFromUrl);
  }, [categoryFromUrl, qFromUrl]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    const url = `/api/products${params.toString() ? `?${params}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery]);

  const sortedProducts = sortProducts(products, sort);

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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="font-display text-2xl font-semibold text-stone-100">
          {searchQuery
            ? (t("products.searchResults").replace("{{query}}", searchQuery))
            : selectedCategory
              ? (CATEGORY_KEYS[selectedCategory] ? t(CATEGORY_KEYS[selectedCategory]) : selectedCategory)
              : t("products.allProducts")}
        </h1>
        <ShareButton
          title={selectedCategory ? `${selectedCategory} - Miaha international market` : "Products - Miaha international market"}
          url={selectedCategory ? `/products?category=${encodeURIComponent(selectedCategory)}` : "/products"}
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <form method="get" action="/products" className="flex gap-2 flex-1 min-w-[200px] max-w-md">
          <input type="hidden" name="category" value={selectedCategory || undefined} />
          <input
            type="search"
            name="q"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("products.searchPlaceholder")}
            className="input flex-1 py-2 text-sm"
          />
          <button type="submit" className="btn-secondary py-2 px-4 text-sm">
            {t("products.search")}
          </button>
        </form>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input py-2 text-sm w-auto"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href={searchQuery ? `/products?q=${encodeURIComponent(searchQuery)}` : "/products"}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            !selectedCategory
              ? "bg-brand-500 text-white"
              : "bg-ink-800 text-ink-400 hover:text-stone-200 hover:bg-ink-700"
          }`}
        >
          {t("products.all")}
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={searchQuery
              ? `/products?category=${encodeURIComponent(cat)}&q=${encodeURIComponent(searchQuery)}`
              : `/products?category=${encodeURIComponent(cat)}`}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-brand-500 text-white"
                : "bg-ink-800 text-ink-400 hover:text-stone-200 hover:bg-ink-700"
            }`}
          >
            {CATEGORY_KEYS[cat] ? t(CATEGORY_KEYS[cat]) : cat}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            categoryLabel={CATEGORY_KEYS[p.category] ? t(CATEGORY_KEYS[p.category]) : p.category}
          />
        ))}
      </div>
      {!loading && sortedProducts.length === 0 && (
        <p className="text-ink-500 text-center py-12">{t("products.noProducts")}</p>
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
