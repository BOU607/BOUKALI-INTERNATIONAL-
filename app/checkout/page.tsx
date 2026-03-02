"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import type { OrderItem } from "@/lib/types";
import { formatAUD } from "@/lib/currency";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [payWithCard, setPayWithCard] = useState(true);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [bankTransferDone, setBankTransferDone] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
  });

  if (items.length === 0 && !done && !bankTransferDone) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-stone-100">Checkout</h1>
        <p className="text-ink-500 mt-2">Your cart is empty.</p>
        <Link href="/products" className="btn-primary mt-6 inline-block">
          Browse products
        </Link>
      </div>
    );
  }

  const orderItems: OrderItem[] = items.map((i) => ({
    productId: i.productId,
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
          total: totalPrice,
          customer: form,
        }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setPayWithCard(false);
        setSubmitting(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceOrderOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          total: totalPrice,
          customer: form,
        }),
      });
      if (!res.ok) throw new Error("Order failed");
      const data = await res.json();
      setOrderId(data.id);
      clearCart();
      setDone(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBankTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          total: totalPrice,
          customer: form,
        }),
      });
      if (!res.ok) throw new Error("Order failed");
      const data = await res.json();
      setOrderId(data.id);
      setOrderTotal(data.total);
      clearCart();
      setBankTransferDone(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const bsb = process.env.NEXT_PUBLIC_BSB ?? "012245";
  const accountNumber = process.env.NEXT_PUBLIC_ACCOUNT ?? "177793659";

  if (bankTransferDone && orderId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md mx-auto">
        <div className="card p-8 text-left">
          <h1 className="font-display text-2xl font-semibold text-stone-100">
            Order placed — pay by bank transfer
          </h1>
          <p className="text-ink-500 mt-2">Transfer the amount below and use your order ID as the reference.</p>
          <p className="mt-4 text-sm text-brand-400 font-mono">{orderId}</p>
          <div className="mt-6 p-4 rounded-xl bg-ink-800/50 border border-ink-700">
            <p className="text-sm text-ink-500 mb-1">BSB</p>
            <p className="font-mono text-stone-200">{bsb}</p>
            <p className="text-sm text-ink-500 mt-3 mb-1">Account number</p>
            <p className="font-mono text-stone-200">{accountNumber}</p>
            <p className="text-sm text-ink-500 mt-3 mb-1">Amount (AUD)</p>
            <p className="font-mono text-stone-200">{formatAUD(orderTotal)}</p>
            <p className="text-xs text-ink-500 mt-3">Use order ID <span className="font-mono text-brand-400">{orderId}</span> as your payment reference.</p>
          </div>
          <Link href="/products" className="btn-primary mt-8 inline-block w-full text-center">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (done && orderId && !bankTransferDone) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md mx-auto">
        <div className="card p-8">
          <h1 className="font-display text-2xl font-semibold text-stone-100">
            Order confirmed
          </h1>
          <p className="text-ink-500 mt-2">Thank you for your purchase.</p>
          <p className="mt-4 text-sm text-brand-400 font-mono">{orderId}</p>
          <Link href="/products" className="btn-primary mt-8 inline-block">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold text-stone-100 mb-8">
        Checkout
      </h1>
      <div className="max-w-2xl grid md:grid-cols-2 gap-10">
        <form
          onSubmit={payWithCard ? handlePayWithCard : handlePlaceOrderOnly}
          className="space-y-4"
        >
          <label className="block">
            <span className="text-sm text-ink-500">Full name</span>
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
            <span className="text-sm text-ink-500">Email</span>
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
            <span className="text-sm text-ink-500">Shipping address</span>
            <textarea
              required
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="input mt-1 min-h-[100px]"
              placeholder="Street, city, postal code"
              rows={3}
            />
          </label>
          {payWithCard ? (
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3"
            >
              {submitting ? "Redirecting to payment…" : "Pay with card"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3"
            >
              {submitting ? "Placing order…" : "Place order"}
            </button>
          )}
          <button
            type="button"
            onClick={handleBankTransfer}
            disabled={submitting}
            className="btn-secondary w-full py-3 mt-2"
          >
            {submitting ? "Placing order…" : "Order & pay by bank transfer"}
          </button>
          {!payWithCard && (
            <p className="text-xs text-ink-500">
              Card payments not configured. Order will be created as pending.
            </p>
          )}
          <p className="text-xs text-ink-500">
            All prices and payments are in Australian dollars (AUD). Australian cards accepted.
          </p>
        </form>
        <div className="card p-6">
          <h2 className="font-medium text-stone-200 mb-4">Order summary</h2>
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
          <div className="mt-4 pt-4 border-t border-ink-700 flex justify-between font-semibold text-stone-200">
            <span>Total</span>
            <span className="text-brand-400">{formatAUD(totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
