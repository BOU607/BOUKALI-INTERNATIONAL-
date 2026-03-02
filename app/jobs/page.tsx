"use client";

import { useEffect, useState } from "react";
import type { Job } from "@/lib/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = search.trim()
      ? `/api/jobs?q=${encodeURIComponent(search.trim())}`
      : "/api/jobs";
    fetch(url)
      .then((r) => r.json())
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold text-stone-100 mb-2">
        Job search
      </h1>
      <p className="text-ink-500 mb-6">
        Find opportunities at BOUKALI INTERNATIONAL.
      </p>
      <div className="max-w-xl mb-8">
        <input
          type="search"
          placeholder="Search by title, company, location..."
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
          No jobs found. Try a different search or check back later.
        </p>
      )}
    </div>
  );
}
