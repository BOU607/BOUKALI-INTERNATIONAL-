"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/LanguageProvider";
import type { OrderItem } from "@/lib/types";
import { formatAUD } from "@/lib/currency";
import { computeFees } from "@/lib/fees";

const CONFIRM_KEY = "miaha_order_confirm";

function loadSavedOrder(): { orderId: string; orderTotal: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CONFIRM_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { orderId: string; orderTotal: number };
    if (data?.orderId && typeof data?.orderTotal === "number") return data;
  } catch {}
  return null;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(() => loadSavedOrder()?.orderId ?? null);
  const [bankTransferDone, setBankTransferDone] = useState(() => !!loadSavedOrder());
  const [orderTotal, setOrderTotal] = useState(() => loadSavedOrder()?.orderTotal ?? 0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
  });

  const { subtotal, buyerFee, total } = useMemo(
    () => computeFees(totalPrice),
    [totalPrice]
  );

  if (items.length === 0 && !done && !bankTransferDone && !orderId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-stone-100">{t("checkout.title")}</h1>
        <p className="text-ink-500 mt-2">{t("cart.empty")}</p>
        <Link href="/products" className="btn-primary mt-6 inline-block">
          {t("home.browseProducts")}
        </Link>
      </div>
    );
  }

  const orderItems: OrderItem[] = items.map((i) => ({
    productId: i.productId,
    sellerId: i.sellerId,
    name: i.name ?? "Product",
    price: i.price ?? 0,
    quantity: i.quantity,
    image: i.image ?? "",
  }));

  const handlePayWithCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          total,
          customer: form,
        }),
      });
      const data = await res.json();
      if (res.status === 503) {
        alert(t("checkout.cardNotConfigured"));
        setSubmitting(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Order failed");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          total,
          customer: form,
        }),
      });
      let data: { id?: string; total?: number; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid response from server");
      }
      if (!res.ok) throw new Error(data.error || "Order failed");
      const id = data.id ?? "";
      const tot = typeof data.total === "number" ? data.total : total;
      sessionStorage.setItem(CONFIRM_KEY, JSON.stringify({ orderId: id, orderTotal: tot }));
      setOrderId(id);
      setOrderTotal(tot);
      clearCart();
      setBankTransferDone(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const bsb = process.env.NEXT_PUBLIC_BSB ?? "";
  const accountNumber = process.env.NEXT_PUBLIC_ACCOUNT ?? "";
  const iban = process.env.NEXT_PUBLIC_IBAN ?? "";
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME ?? "";
  const accountHolder = process.env.NEXT_PUBLIC_ACCOUNT_HOLDER ?? "";
  const swift = process.env.NEXT_PUBLIC_SWIFT ?? "";
  const hasAustralianDetails = bsb && accountNumber;
  const hasIbanDetails = iban && bankName && accountHolder;
  const hasBankDetails = hasAustralianDetails || hasIbanDetails;
  if (bankTransferDone && orderId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md mx-auto">
        <div className="card p-8 text-left">
          <h1 className="font-display text-2xl font-semibold text-stone-100">
            {t("checkout.orderPlaced")} — {t("checkout.payByBankTransfer")}
          </h1>
          <p className="text-ink-500 mt-2">{t("checkout.transferInstructions")}</p>
          <p className="mt-4 text-sm text-brand-400 font-mono">{orderId}</p>
          <div className="mt-6 p-4 rounded-xl bg-ink-800/50 border border-ink-700">
            <p className="text-sm text-ink-500 mb-1">{t("checkout.amount")} (AUD)</p>
            <p className="font-mono text-stone-200">{formatAUD(orderTotal)}</p>
            <p className="text-xs text-ink-500 mt-3">{t("checkout.useOrderIdAsReference")}</p>
            {hasIbanDetails ? (
              <div className="mt-4 space-y-3 text-left">
                <div>
                  <p className="text-sm text-ink-500 mb-0.5">{t("checkout.bankName")}</p>
                  <p className="font-mono text-stone-200">{bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-ink-500 mb-0.5">{t("checkout.accountHolder")}</p>
                  <p className="font-mono text-stone-200">{accountHolder}</p>
                </div>
                <div>
                  <p className="text-sm text-ink-500 mb-0.5">{t("checkout.iban")}</p>
                  <p className="font-mono text-stone-200 break-all">{iban}</p>
                </div>
                {swift && (
                  <div>
                    <p className="text-sm text-ink-500 mb-0.5">{t("checkout.swift")}</p>
                    <p className="font-mono text-stone-200">{swift}</p>
                  </div>
                )}
              </div>
            ) : hasAustralianDetails ? (
              <>
                <p className="text-sm text-ink-500 mt-4 mb-1">{t("checkout.bsb")}</p>
                <p className="font-mono text-stone-200">{bsb}</p>
                <p className="text-sm text-ink-500 mt-3 mb-1">{t("checkout.account")}</p>
                <p className="font-mono text-stone-200">{accountNumber}</p>
              </>
            ) : (
              <p className="text-sm text-ink-500 mt-4">{t("checkout.contactForBankDetails")}</p>
            )}
          </div>
          <Link
            href="/products"
            className="btn-primary mt-8 inline-block w-full text-center"
            onClick={() => sessionStorage.removeItem(CONFIRM_KEY)}
          >
            {t("checkout.continueShopping")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold text-stone-100 mb-8">
        {t("checkout.title")}
      </h1>
      <div className="max-w-2xl grid md:grid-cols-2 gap-10">
        <form
          onSubmit={handlePayWithCard}
          className="space-y-4"
        >
          <label className="block">
            <span className="text-sm text-ink-500">{t("checkout.name")}</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input mt-1"
              placeholder="John Doe"
            />
          </label>
          <label className="block">
            <span className="text-sm text-ink-500">{t("checkout.email")}</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input mt-1"
              placeholder="john@example.com"
            />
          </label>
          <label className="block">
            <span className="text-sm text-ink-500">{t("checkout.address")}</span>
            <textarea
              required
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="input mt-1 min-h-[100px]"
              placeholder="Street, city, postal code"
              rows={3}
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3"
          >
            {submitting ? t("checkout.redirecting") : t("checkout.payWithCard")}
          </button>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="btn-secondary w-full py-3 mt-2"
          >
            {submitting ? t("checkout.placingOrder") : t("checkout.orderAndBankTransfer")}
          </button>
          <p className="text-xs text-ink-500">
            {t("checkout.payWithCardOrBank")}
          </p>
        </form>
        <div className="card p-6">
          <h2 className="font-medium text-stone-200 mb-4">{t("checkout.orderSummary")}</h2>
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between text-sm">
                <span className="text-ink-500">
                  {i.name} × {i.quantity}
                </span>
                <span className="text-stone-200">
                  {formatAUD((i.price ?? 0) * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-ink-700 space-y-2 text-sm">
            <div className="flex justify-between text-ink-500">
              <span>{t("checkout.subtotal")}</span>
              <span>{formatAUD(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-500">
              <span>{t("checkout.serviceFee")}</span>
              <span>{formatAUD(buyerFee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-stone-200 pt-2">
              <span>{t("checkout.total")}</span>
              <span className="text-brand-400">{formatAUD(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
