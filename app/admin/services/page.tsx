"use client";

import { useEffect, useState } from "react";
import type { Service } from "@/lib/types";
import { TRADE_CATEGORIES } from "@/lib/trades";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    trade: "Plumber" as Service["trade"],
    businessName: "",
    description: "",
    phone: "",
    email: "",
    location: "",
  });

  const load = () => {
    fetch("/api/services")
      .then((r) => r.json())
      .then(setServices)
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/services/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({
      trade: "Plumber",
      businessName: "",
      description: "",
      phone: "",
      email: "",
      location: "",
    });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="font-display text-lg font-medium text-stone-200">
          Services (Plumber, Electrical, Painter, etc.)
        </h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm"
        >
          {showForm ? "Cancel" : "Add listing"}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 max-w-xl space-y-4">
          <h3 className="font-medium text-stone-200">New service listing</h3>
          <label className="block">
            <span className="text-sm text-ink-500">Trade</span>
            <select
              value={form.trade}
              onChange={(e) => setForm((f) => ({ ...f, trade: e.target.value as Service["trade"] }))}
              className="input mt-1"
            >
              {TRADE_CATEGORIES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-ink-500">Business name</span>
            <input
              type="text"
              required
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              className="input mt-1"
            />
          </label>
          <label className="block">
            <span className="text-sm text-ink-500">Description</span>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input mt-1 min-h-[80px]"
              rows={3}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-ink-500">Phone</span>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="input mt-1"
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
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm text-ink-500">Location</span>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="input mt-1"
              placeholder="e.g. City wide, Downtown"
            />
          </label>
          <button type="submit" className="btn-primary">
            Add listing
          </button>
        </form>
      )}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-ink-800">
                <th className="p-4 text-sm font-medium text-ink-500">Trade</th>
                <th className="p-4 text-sm font-medium text-ink-500">Business</th>
                <th className="p-4 text-sm font-medium text-ink-500">Location</th>
                <th className="p-4 text-sm font-medium text-ink-500">Contact</th>
                <th className="p-4 text-sm font-medium text-ink-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-ink-800/50 hover:bg-ink-800/20">
                  <td className="p-4">
                    <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-xs text-brand-400">
                      {s.trade}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-stone-200">{s.businessName}</td>
                  <td className="p-4 text-ink-500">{s.location}</td>
                  <td className="p-4 text-ink-500 text-sm">{s.phone}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id, s.businessName)}
                      className="btn-ghost text-sm text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {services.length === 0 && (
          <p className="p-8 text-center text-ink-500">No service listings. Add one.</p>
        )}
      </div>
    </div>
  );
}
