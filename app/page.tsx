import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

const CATEGORY_LABELS: Record<string, string> = {
  "Men's Clothing": "Men",
  "Women's Clothing": "Women",
  "Oil & Gas Equipment": "Oil & Gas",
  "Spare Parts": "Spare Parts",
};

export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-stone-100 tracking-tight">
          Buy & sell with confidence
        </h1>
        <p className="mt-4 text-lg text-ink-500">
          Discover products you love. Simple checkout. Fast delivery.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/products" className="btn-primary text-base px-6 py-3">
            Browse products
          </Link>
          <Link href="/services" className="btn-secondary text-base px-6 py-3">
            Find a pro
          </Link>
          <Link href="/jobs" className="btn-secondary text-base px-6 py-3">
            Find jobs
          </Link>
          <Link href="/admin" className="btn-secondary text-base px-6 py-3">
            Sell on BOUKALI INTERNATIONAL
          </Link>
        </div>
      </div>
      <section className="mt-24 w-full max-w-5xl">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-6 text-center">
          Shop by category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link
            href="/products"
            className="card p-4 text-center hover:border-brand-500/50 transition-colors"
          >
            <span className="text-stone-200 font-medium">All</span>
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className="card p-4 text-center hover:border-brand-500/50 transition-colors"
            >
              <span className="text-stone-200 font-medium">
                {CATEGORY_LABELS[cat] ?? cat}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-24 w-full max-w-4xl">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-6 text-center">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="card p-6 text-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 font-semibold">
              1
            </span>
            <h3 className="mt-3 font-medium text-stone-200">Browse</h3>
            <p className="mt-1 text-sm text-ink-500">Explore our catalog of products.</p>
          </div>
          <div className="card p-6 text-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 font-semibold">
              2
            </span>
            <h3 className="mt-3 font-medium text-stone-200">Add to cart</h3>
            <p className="mt-1 text-sm text-ink-500">Choose what you need and add to cart.</p>
          </div>
          <div className="card p-6 text-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 font-semibold">
              3
            </span>
            <h3 className="mt-3 font-medium text-stone-200">Checkout</h3>
            <p className="mt-1 text-sm text-ink-500">Enter details and complete your order.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
