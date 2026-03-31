"use client";

import { useEffect, useState } from "react";
import type { PayoutReleaseRun } from "@/lib/types";

type SellerSafe = {
  id: string;
  name: string;
  email: string;
  businessName: string;
  bankName?: string;
  accountHolder?: string;
  iban?: string;
  swift?: string;
  connectedAccountId?: string;
};

export default function AdminPayoutRunsPage() {
  const [runs, setRuns] = useState<PayoutReleaseRun[]>([]);
  const [manualPayouts, setManualPayouts] = useState<any[]>([]);
  const [sellers, setSellers] = useState<SellerSafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markMessage, setMarkMessage] = useState<string>("");

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/payout-release-runs").then((r) => r.json()),
      fetch("/api/admin/manual-payouts").then((r) => r.json()),
      fetch("/api/admin/sellers").then((r) => r.json()),
    ])
      .then(([runsData, manualData, sellersData]) => {
        setRuns(Array.isArray(runsData) ? runsData : []);
        setManualPayouts(Array.isArray(manualData) ? manualData : []);
        setSellers(Array.isArray(sellersData) ? sellersData : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markManualPaid = async (payoutId: string) => {
    setMarkMessage("");
    setMarkingId(payoutId);
    const reference = window.prompt("Optional reference (bank transfer id, etc). Leave empty if none.") ?? "";
    try {
      const res = await fetch(`/api/admin/manual-payouts/${payoutId}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMarkMessage(data?.error ?? "Failed to mark paid.");
      } else {
        setMarkMessage("Marked as paid.");
        load();
      }
    } catch {
      setMarkMessage("Failed to mark paid.");
    } finally {
      setMarkingId(null);
    }
  };

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

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div>
            <h3 className="font-display text-base font-medium text-stone-200">Payout queue</h3>
            <p className="text-sm text-ink-500 mt-1">
              Manual payouts, dispute holds (<code className="text-ink-400">blocked</code>), and cancelled payouts after a lost dispute.
            </p>
          </div>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-ink-500">Loading manual payouts…</div>
          ) : manualPayouts.length === 0 ? (
            <div className="p-6 text-sm text-ink-500">Nothing in this queue right now.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-ink-800">
                    <th className="p-4 text-sm font-medium text-ink-500">Created</th>
                    <th className="p-4 text-sm font-medium text-ink-500">Order</th>
                    <th className="p-4 text-sm font-medium text-ink-500">Seller</th>
                    <th className="p-4 text-sm font-medium text-ink-500">Payout details</th>
                    <th className="p-4 text-sm font-medium text-ink-500">Amount</th>
                    <th className="p-4 text-sm font-medium text-ink-500">Currency</th>
                    <th className="p-4 text-sm font-medium text-ink-500">Status</th>
                    <th className="p-4 text-sm font-medium text-ink-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {manualPayouts.map((p) => (
                    <tr key={p.id} className="border-b border-ink-800/50">
                      <td className="p-4 text-ink-400 text-sm">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="p-4 text-stone-200 text-sm font-mono">
                        {p.orderId}
                      </td>
                      <td className="p-4 text-ink-400 text-sm">
                        {(() => {
                          const s = sellers.find((x) => x.id === p.sellerId);
                          const label = s ? (s.businessName || s.name) : p.sellerId;
                          return (
                            <div className="space-y-0.5">
                              <p className="font-mono text-ink-400">{p.sellerId}</p>
                              <p className="text-stone-200">{label}</p>
                              {s?.email && <p className="text-xs text-ink-500">{s.email}</p>}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="p-4 text-xs text-ink-500 font-mono max-w-md">
                        {(() => {
                          const s = sellers.find((x) => x.id === p.sellerId);
                          if (!s) return <span>—</span>;
                          const hasAny = Boolean(s.accountHolder || s.bankName || s.iban || s.swift || s.connectedAccountId);
                          if (!hasAny) return <span>—</span>;
                          return (
                            <div className="space-y-0.5">
                              {s.accountHolder && <p>Account: {s.accountHolder}</p>}
                              {s.bankName && <p>Bank: {s.bankName}</p>}
                              {s.iban && <p>IBAN: {s.iban}</p>}
                              {s.swift && <p>SWIFT: {s.swift}</p>}
                              {s.connectedAccountId && <p>Stripe: {s.connectedAccountId}</p>}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="p-4 text-amber-400 text-sm">
                        {typeof p.amountMinor === "number" ? (p.amountMinor / 100).toFixed(2) : "—"}
                      </td>
                      <td className="p-4 text-ink-400 text-sm">{p.currency}</td>
                      <td className="p-4 text-sm">
                        <span
                          className={
                            p.status === "blocked"
                              ? "text-amber-400"
                              : p.status === "cancelled"
                                ? "text-red-400/90"
                                : "text-ink-300"
                          }
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {p.status === "pending_manual" ? (
                          <button
                            type="button"
                            className="btn-secondary text-xs py-1.5"
                            disabled={markingId === p.id}
                            onClick={() => markManualPaid(p.id)}
                          >
                            {markingId === p.id ? "Marking…" : "Mark paid"}
                          </button>
                        ) : (
                          <span className="text-xs text-ink-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {markMessage && (
          <p className="text-xs text-brand-400 mt-3">{markMessage}</p>
        )}
      </div>
    </div>
  );
}
