"use client";

import { useState } from "react";
import Link from "next/link";

export default function SellerRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    phone: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/sellers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Registration failed." });
        setLoading(false);
        return;
      }
      setMessage({
        type: "success",
        text: data.message || "Registration successful. Your account is pending approval.",
      });
      setForm({ name: "", email: "", password: "", businessName: "", phone: "" });
    } catch {
      setMessage({ type: "error", text: "Registration failed. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="card p-8 w-full max-w-md">
        <h1 className="font-display text-xl font-semibold text-stone-100">
          Become a seller
        </h1>
        <p className="text-ink-500 text-sm mt-1">
          Register to list your products on Miaha international market.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-ink-500">Your name</span>
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
              placeholder="seller@example.com"
            />
          </label>
          <label className="block">
            <span className="text-sm text-ink-500">Password (min 6 characters)</span>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="input mt-1"
            />
          </label>
          <label className="block">
            <span className="text-sm text-ink-500">Business name</span>
            <input
              type="text"
              required
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              className="input mt-1"
              placeholder="My Shop"
            />
          </label>
          <label className="block">
            <span className="text-sm text-ink-500">Phone (optional)</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="input mt-1"
              placeholder="+1234567890"
            />
          </label>
          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {message.text}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Registering…" : "Register"}
          </button>
        </form>
        <p className="text-ink-500 text-xs mt-4">
          After registration, the platform will review your application. You will be able to add products once approved.
        </p>
        <div className="mt-6 flex gap-4">
          <Link href="/seller/login" className="text-sm text-brand-400 hover:underline">
            Already have an account? Sign in
          </Link>
          <Link href="/" className="text-sm text-ink-500 hover:text-stone-300">
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
