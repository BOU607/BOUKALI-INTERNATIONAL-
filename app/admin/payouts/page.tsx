"use client";

import { useEffect, useState } from "react";
import type { PayoutReleaseRun } from "@/lib/types";

export default function AdminPayoutRunsPage() {
  const [runs, setRuns] = useState<PayoutReleaseRun[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/payout-release-runs")
      .then((r) => r.json())
      .then((data) => setRuns(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="font-display text-lg font-medium text-stone-200">Payout Auto-Release</h2>
          <p className="text-sm text-ink-500 mt-1">
            History of scheduled payout release runs.
          </p>
        </div>
        <button className="btn-ghost text-sm py-1.5" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-ink-500">Loading runs…</div>
        ) : runs.length === 0 ? (
          <div className="p-6 text-sm text-ink-500">No auto-release runs yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink-800">
                  <th className="p-4 text-sm font-medium text-ink-500">Run time</th>
                  <th className="p-4 text-sm font-medium text-ink-500">Checked</th>
                  <th className="p-4 text-sm font-medium text-ink-500">Released</th>
                  <th className="p-4 text-sm font-medium text-ink-500">Failed</th>
                  <th className="p-4 text-sm font-medium text-ink-500">Details</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-b border-ink-800/50">
                    <td className="p-4 text-stone-200 text-sm">
                      {new Date(run.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-ink-400 text-sm">{run.checked}</td>
                    <td className="p-4 text-green-400 text-sm">{run.releasedCount}</td>
                    <td className="p-4 text-amber-400 text-sm">{run.failedCount}</td>
                    <td className="p-4 text-xs text-ink-500 max-w-xl">
                      {run.failedCount > 0 && run.failed?.length
                        ? run.failed.slice(0, 3).map((f) => `${f.payoutId}: ${f.error}`).join(" | ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
