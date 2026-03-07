"use client";

import { useEffect, useState } from "react";
import type { Visit } from "@/lib/types";

function formatLoc(v: Visit): string {
  const parts = [v.city, v.countryRegion, v.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

export default function AdminVisitorsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [kvConfigured, setKvConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/visits")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVisits(data);
          setKvConfigured(null);
        } else {
          setVisits(data.visits ?? []);
          setKvConfigured(data.kvConfigured ?? null);
        }
      })
      .catch(() => setVisits([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card p-4 h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-lg font-medium text-stone-200 mb-4">
        Visitor locations
      </h2>
      <p className="text-sm text-ink-500 mb-6">
        Approximate location detected when someone loads the site (from IP). Last {visits.length} connections.
        {kvConfigured === true && " Storage: Redis (KV configured)."}
        {kvConfigured === false && " Storage: not configured — set KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_* ) on Vercel so visits persist."}
        {kvConfigured === null && " On Vercel, add a KV store and set KV_REST_API_URL + KV_REST_API_TOKEN so visits persist."}
      </p>
      <div className="space-y-2">
        {visits.map((v) => (
          <div key={v.id} className="card p-4 flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-stone-200">{formatLoc(v)}</span>
            <span className="text-xs text-ink-500">
              {new Date(v.createdAt).toLocaleString()}
            </span>
            {v.latitude && v.longitude && (
              <span className="text-xs text-ink-500 font-mono">
                {v.latitude}, {v.longitude}
              </span>
            )}
          </div>
        ))}
      </div>
      {visits.length === 0 && (
        <p className="text-ink-500 text-center py-12">No visits recorded yet. Visitors are logged when they load the site.</p>
      )}
    </div>
  );
}
