"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Service } from "@/lib/types";
import { TRADE_CATEGORIES } from "@/lib/trades";

function ServicesPageContent() {
  const searchParams = useSearchParams();
  const tradeFromUrl = searchParams.get("trade") ?? "";
  const [trade, setTrade] = useState(tradeFromUrl);
  const [search, setSearch] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTrade(tradeFromUrl);
  }, [tradeFromUrl]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (trade) params.set("trade", trade);
    if (search.trim()) params.set("q", search.trim());
    const url = `/api/services${params.toString() ? `?${params}` : ""}`;
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then(setServices)
      .finally(() => setLoading(false));
  }, [trade, search]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold text-stone-100 mb-2">
        Find a pro
      </h1>
      <p className="text-ink-500 mb-6">
        Search for plumbers, electricians, painters, and more.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="search"
          placeholder="Search by name, description, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1"
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href="/services"
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            !trade
              ? "bg-brand-500 text-white"
              : "bg-ink-800 text-ink-400 hover:text-stone-200 hover:bg-ink-700"
          }`}
        >
          All
        </a>
        {TRADE_CATEGORIES.map((t) => (
          <a
            key={t}
            href={`/services?trade=${encodeURIComponent(t)}`}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              trade === t
                ? "bg-brand-500 text-white"
                : "bg-ink-800 text-ink-400 hover:text-stone-200 hover:bg-ink-700"
            }`}
          >
            {t}
          </a>
        ))}
      </div>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((s) => (
            <article
              key={s.id}
              className="card p-6 hover:border-ink-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <span className="inline-block rounded-full bg-brand-500/20 px-3 py-0.5 text-xs font-medium text-brand-400">
                    {s.trade}
                  </span>
                  <h2 className="font-medium text-stone-200 text-lg mt-2">
                    {s.businessName}
                  </h2>
                  <p className="text-ink-500 text-sm mt-1">{s.description}</p>
                  <p className="text-ink-500 text-sm mt-2">
                    📍 {s.location}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm">
                    <a
                      href={`tel:${s.phone}`}
                      className="text-brand-400 hover:text-brand-300"
                    >
                      {s.phone}
                    </a>
                    <a
                      href={`mailto:${s.email}`}
                      className="text-brand-400 hover:text-brand-300"
                    >
                      {s.email}
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && services.length === 0 && (
        <p className="text-ink-500 text-center py-12">
          No results. Try another search or trade.
        </p>
      )}
    </div>
  );
}

function ServicesLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6 h-32 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesLoading />}>
      <ServicesPageContent />
    </Suspense>
  );
}
