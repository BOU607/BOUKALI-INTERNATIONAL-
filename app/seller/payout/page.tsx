"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SellerProfile = {
  id: string;
  bankName?: string;
  accountHolder?: string;
  iban?: string;
  swift?: string;
};

export default function SellerPayoutPage() {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    bankName: "",
    accountHolder: "",
    iban: "",
    swift: "",
  });

  useEffect(() => {
    fetch("/api/seller/profile")
      .then(async (r) => {
        const data = await r.json();
        if (r.ok) {
          setProfile(data);
          setForm({
            bankName: data.bankName ?? "",
            accountHolder: data.accountHolder ?? "",
            iban: data.iban ?? "",
            swift: data.swift ?? "",
          });
        }
        return data;
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/seller/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setMessage({ type: "success", text: "Payout details saved." });
      } else {
        setMessage({ type: "error", text: data.error ?? "Failed to save." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/seller/dashboard" className="text-sm text-ink-500 hover:text-stone-300">
          ← Back to dashboard
        </Link>
      </div>
      <div className="card p-6">
        <h1 className="font-display text-xl font-semibold text-stone-100">
          Payout details
        </h1>
        <p className="text-sm text-ink-500 mt-1 mb-6">
          Enter your bank details so we can send your earnings. Only the platform admin will see these.
        </p>
        {loading ? (
          <p className="text-ink-500">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Account holder name</label>
              <input
                type="text"
                className="input w-full"
                value={form.accountHolder}
                onChange={(e) => setForm((f) => ({ ...f, accountHolder: e.target.value }))}
                placeholder="Full name as on bank account"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Bank name</label>
              <input
                type="text"
                className="input w-full"
                value={form.bankName}
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                placeholder="e.g. QNB, HSBC, Citi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">IBAN</label>
              <input
                type="text"
                className="input w-full font-mono"
                value={form.iban}
                onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value.toUpperCase().replace(/\s/g, "") }))}
                placeholder="e.g. QA58DOHB00001234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">SWIFT / BIC (optional)</label>
              <input
                type="text"
                className="input w-full font-mono"
                value={form.swift}
                onChange={(e) => setForm((f) => ({ ...f, swift: e.target.value.toUpperCase().replace(/\s/g, "") }))}
                placeholder="e.g. DOHBQAQA"
              />
            </div>
            {message && (
              <p className={message.type === "success" ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
                {message.text}
              </p>
            )}
            <button type="submit" className="btn-primary text-sm py-2" disabled={saving}>
              {saving ? "Saving…" : "Save payout details"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
