"use client";

import { useEffect, useState } from "react";
import type { Job } from "@/lib/types";
import { JOB_CATEGORIES, JOB_CATEGORY_KEYS } from "@/lib/job-categories";
import { useI18n } from "@/components/LanguageProvider";

export default function JobsPage() {
  const { t } = useI18n();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (category ?? false) params.set("category", category!);
    const url = params.toString() ? `/api/jobs?${params}` : "/api/jobs";
    fetch(url)
      .then((r) => r.json())
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold text-stone-100 mb-2">
        {t("jobs.title")}
      </h1>
      <p className="text-ink-500 mb-6">
        {t("jobs.subtitle")}
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            category === null
              ? "bg-brand-500 text-stone-900"
              : "bg-ink-800 text-ink-300 hover:bg-ink-700"
          }`}
        >
          {t("jobs.allCategories")}
        </button>
        {JOB_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === cat
                ? "bg-brand-500 text-stone-900"
                : "bg-ink-800 text-ink-300 hover:bg-ink-700"
            }`}
          >
            {JOB_CATEGORY_KEYS[cat] ? t(JOB_CATEGORY_KEYS[cat]) : cat}
          </button>
        ))}
      </div>
      <div className="max-w-xl mb-8">
        <input
          type="search"
          placeholder={t("jobs.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
      </div>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="card p-6 hover:border-ink-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="font-medium text-stone-200 text-lg">
                    {job.title}
                  </h2>
                  <p className="text-brand-400 text-sm mt-0.5">
                    {job.company} · {job.location}
                  </p>
                  <span className="inline-block mt-2 rounded-full bg-ink-700 px-3 py-0.5 text-xs text-ink-300">
                    {job.type}
                  </span>
                  <p className="text-ink-500 text-sm mt-3 line-clamp-2">
                    {job.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && jobs.length === 0 && (
        <p className="text-ink-500 text-center py-12">
          {t("jobs.noJobs")}
        </p>
      )}
    </div>
  );
}
