"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import type { OrderItem } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
  });

  if (items.length === 0 && !done) {
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  if (done && orderId) {
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
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
                  ${((i.price ?? 0) * i.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-ink-700 flex justify-between font-semibold text-stone-200">
            <span>Total</span>
            <span className="text-brand-400">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
