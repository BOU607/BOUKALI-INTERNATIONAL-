"use client";

import { useEffect, useState } from "react";

type Buyer = {
  email: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
};

export default function AdminBuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Buyer | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = () => {
    fetch("/api/buyers")
      .then((r) => r.json())
      .then(setBuyers)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (b: Buyer) => {
    setEditing(b);
    setEditName(b.name);
    setEditEmail(b.email);
    setMessage(null);
  };

  const closeEdit = () => {
    setEditing(null);
    setMessage(null);
  };

  const hasEditChange =
    editing &&
    (editName.trim() !== editing.name || editEmail.trim().toLowerCase() !== editing.email.toLowerCase());
  const hasEditValue = editName.trim() !== "" || editEmail.trim() !== "";

  const saveEdit = async () => {
    if (!editing || !hasEditChange || !hasEditValue) return;
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/buyers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail: editing.email,
          name: editName.trim() || undefined,
          newEmail:
            editEmail.trim().toLowerCase() !== editing.email.toLowerCase()
              ? editEmail.trim().toLowerCase()
              : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.updated != null) {
        setMessage({ type: "success", text: `Updated ${data.updated} order(s).` });
        load();
        closeEdit();
      } else {
        setMessage({ type: "error", text: data.error ?? "Update failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Update failed." });
    } finally {
      setSaving(false);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered =
    q === ""
      ? buyers
      : buyers.filter(
          (b) =>
            b.email.toLowerCase().includes(q) ||
            (b.name && b.name.toLowerCase().includes(q))
        );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card p-4 h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-lg font-medium text-stone-200 mb-4">
        Buyers
      </h2>
      <p className="text-sm text-ink-500 mb-6">
        Unique customers from orders. Search by name or email. Click Edit to update name or email for all their orders.
      </p>
      <div className="mb-6">
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full max-w-md"
          aria-label="Search buyers"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-800 text-left text-ink-500">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium text-right">Orders</th>
              <th className="p-3 font-medium text-right">Total spent</th>
              <th className="p-3 font-medium">Last order</th>
              <th className="p-3 font-medium w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr
                key={b.email}
                className="border-b border-ink-800/50 hover:bg-ink-900/30"
              >
                <td className="p-3 text-stone-200">{b.name}</td>
                <td className="p-3 text-ink-400 font-mono">{b.email}</td>
                <td className="p-3 text-right text-stone-300">{b.orderCount}</td>
                <td className="p-3 text-right text-brand-400 font-medium">
                  ${b.totalSpent.toFixed(2)}
                </td>
                <td className="p-3 text-ink-500">
                  {new Date(b.lastOrderAt).toLocaleString()}
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => openEdit(b)}
                    className="text-brand-400 hover:text-brand-300 text-sm font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <p className="text-ink-500 text-center py-12">
          {buyers.length === 0
            ? "No buyers yet. Buyers appear here after customers place orders."
            : "No buyers match your search."}
        </p>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={closeEdit}>
          <div
            className="card p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-medium text-stone-200 mb-4">Edit buyer</h3>
            <p className="text-sm text-ink-500 mb-4">
              Changes apply to all {editing.orderCount} order(s) for this customer.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-400 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input w-full"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-400 mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="input w-full font-mono"
                  placeholder="customer@example.com"
                />
              </div>
            </div>
            {message && (
              <p className={`mt-3 text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
                {message.text}
              </p>
            )}
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={saveEdit}
                disabled={saving || !hasEditChange || !hasEditValue}
                className="btn-primary text-sm py-2"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={closeEdit} className="btn-ghost text-sm py-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
