"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatAUD } from "@/lib/currency";

type SellerProfile = {
  id: string;
  bankName?: string;
  accountHolder?: string;
  iban?: string;
  swift?: string;
  connectedAccountId?: string;
};

export default function SellerDashboardPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    bankName: "",
    accountHolder: "",
    iban: "",
    swift: "",
    connectedAccountId: "",
  });

  useEffect(() => {
    fetch("/api/seller/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/seller/profile")
      .then(async (r) => {
        const data = await r.json();
        if (r.ok) {
          setProfile(data);
          setPayoutForm({
            bankName: data.bankName ?? "",
            accountHolder: data.accountHolder ?? "",
            iban: data.iban ?? "",
            swift: data.swift ?? "",
            connectedAccountId: data.connectedAccountId ?? "",
          });
        }
        return data;
      })
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, []);

  const savePayoutDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutMessage(null);
    setPayoutSaving(true);
    try {
      const res = await fetch("/api/seller/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payoutForm),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setPayoutMessage({ type: "success", text: "Payout details saved." });
      } else {
        setPayoutMessage({ type: "error", text: data.error ?? "Failed to save." });
      }
    } catch {
      setPayoutMessage({ type: "error", text: "Failed to save." });
    } finally {
      setPayoutSaving(false);
    }
  };

  const connectStripe = async () => {
    setStripeLoading(true);
    setPayoutMessage(null);
    try {
      const res = await fetch("/api/seller/stripe/onboard", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        setPayoutMessage({ type: "error", text: data?.error ?? "Failed to start Stripe onboarding." });
      } else {
        window.location.href = data.url;
      }
    } catch {
      setPayoutMessage({ type: "error", text: "Failed to start Stripe onboarding." });
    } finally {
      setStripeLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-100">
            Seller dashboard
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Welcome, {session?.user?.name ?? "Seller"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/seller/products/new" className="btn-primary text-sm py-2">
            Add product
          </Link>
          <Link href="/seller/orders" className="btn-secondary text-sm py-2">
            My orders
          </Link>
          <Link href="/seller/payout" className="btn-secondary text-sm py-2">
            Payout details
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="btn-ghost text-sm py-2"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-medium text-stone-200 mb-4">Your products</h2>
        {loading ? (
          <p className="text-ink-500">Loading…</p>
        ) : products.length === 0 ? (
          <p className="text-ink-500">
            No products yet.{" "}
            <Link href="/seller/products/new" className="text-brand-400 hover:underline">
              Add your first product
            </Link>
          </p>
        ) : (
          <ul className="space-y-4">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-ink-900/50 border border-ink-800"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-ink-800 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-200">{p.name}</p>
                    <p className="text-brand-400 font-semibold">{formatAUD(p.price)}</p>
                    <p className="text-xs text-ink-500">Stock: {p.stock}</p>
                  </div>
                </div>
                <Link
                  href={`/seller/products/${p.id}`}
                  className="btn-secondary text-sm py-2 w-fit"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div id="payout-details" className="card p-6 mt-6 scroll-mt-4">
        <h2 className="font-medium text-stone-200 mb-1">Payout details</h2>
        <p className="text-sm text-ink-500 mb-4">
          Enter your bank details so we can send your earnings. Only the platform admin will see these.
        </p>
        <div className="mb-6 p-4 rounded-lg border border-ink-800 bg-ink-900/40 max-w-md">
          <p className="text-sm text-stone-300 mb-2">Stripe Connect for automatic payouts</p>
          <p className="text-xs text-ink-500 mb-3">
            Connect your Stripe account once. This enables automatic transfer release when delivery is confirmed.
          </p>
          <button
            type="button"
            onClick={connectStripe}
            disabled={stripeLoading}
            className="btn-secondary text-sm py-2"
          >
            {stripeLoading ? "Opening Stripe..." : "Connect Stripe account"}
          </button>
        </div>
        {profileLoading ? (
          <p className="text-ink-500">Loading…</p>
        ) : (
          <form onSubmit={savePayoutDetails} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Account holder name</label>
              <input
                type="text"
                className="input w-full"
                value={payoutForm.accountHolder}
                onChange={(e) => setPayoutForm((f) => ({ ...f, accountHolder: e.target.value }))}
                placeholder="Full name as on bank account"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Bank name</label>
              <input
                type="text"
                className="input w-full"
                value={payoutForm.bankName}
                onChange={(e) => setPayoutForm((f) => ({ ...f, bankName: e.target.value }))}
                placeholder="e.g. QNB, HSBC, Citi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">IBAN</label>
              <input
                type="text"
                className="input w-full font-mono"
                value={payoutForm.iban}
                onChange={(e) => setPayoutForm((f) => ({ ...f, iban: e.target.value.toUpperCase().replace(/\s/g, "") }))}
                placeholder="e.g. QA58DOHB00001234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Stripe connected account ID</label>
              <input
                type="text"
                className="input w-full font-mono"
                value={payoutForm.connectedAccountId}
                onChange={(e) => setPayoutForm((f) => ({ ...f, connectedAccountId: e.target.value.trim() }))}
                placeholder="acct_1234..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">SWIFT / BIC (optional)</label>
              <input
                type="text"
                className="input w-full font-mono"
                value={payoutForm.swift}
                onChange={(e) => setPayoutForm((f) => ({ ...f, swift: e.target.value.toUpperCase().replace(/\s/g, "") }))}
                placeholder="e.g. DOHBQAQA"
              />
            </div>
            {payoutMessage && (
              <p className={payoutMessage.type === "success" ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
                {payoutMessage.text}
              </p>
            )}
            <button type="submit" className="btn-primary text-sm py-2" disabled={payoutSaving}>
              {payoutSaving ? "Saving…" : "Save payout details"}
            </button>
          </form>
        )}
      </div>

      <Link href="/" className="inline-block mt-6 text-sm text-ink-500 hover:text-stone-300">
        ← Back to store
      </Link>
    </div>
  );
}
