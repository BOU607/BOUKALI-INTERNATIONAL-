"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Verify failed");
        return r.json();
      })
      .then((data) => {
        setOrderId(data.orderId);
        clearCart();
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [sessionId, clearCart]);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-ink-500">Confirming your payment…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md mx-auto">
        <div className="card p-8">
          <h1 className="font-display text-xl font-semibold text-stone-100">Something went wrong</h1>
          <p className="text-ink-500 mt-2">We couldn’t confirm your payment. If you were charged, contact us with your order details.</p>
          <Link href="/" className="btn-primary mt-6 inline-block">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-md mx-auto">
      <div className="card p-8">
        <h1 className="font-display text-2xl font-semibold text-stone-100">Payment successful</h1>
        <p className="text-ink-500 mt-2">Thank you for your purchase.</p>
        {orderId && (
          <>
            <p className="mt-4 text-sm text-brand-400 font-mono">{orderId}</p>
            <p className="mt-2 text-xs text-ink-500">Save this order ID. You can track your order anytime from the menu → Track order.</p>
          </>
        )}
        <Link href="/products" className="btn-primary mt-8 inline-block">Continue shopping</Link>
      </div>
    </div>
  );
}
