"use client";

import { useEffect, useState } from "react";
import type { Job } from "@/lib/types";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "Miaha international market",
    location: "",
    type: "full-time" as Job["type"],
    description: "",
  });

  const load = () => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then(setJobs)
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/jobs/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({
      title: "",
      company: "Miaha international market",
      location: "",
      type: "full-time",
      description: "",
    });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete job "${title}"?`)) return;
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
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
          Jobs
        </h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm"
        >
          {showForm ? "Cancel" : "Add job"}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 max-w-xl space-y-4">
          <h3 className="font-medium text-stone-200">New job</h3>
          <label className="block">
            <span className="text-sm text-ink-500">Title</span>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input mt-1"
            />
          </label>
          <label className="block">
            <span className="text-sm text-ink-500">Company</span>
            <input
              type="text"
              required
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              className="input mt-1"
            />
          </label>
          <label className="block">
            <span className="text-sm text-ink-500">Location</span>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="input mt-1"
              placeholder="e.g. Remote, On-site"
            />
          </label>
          <label className="block">
            <span className="text-sm text-ink-500">Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Job["type"] }))}
              className="input mt-1"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-ink-500">Description</span>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input mt-1 min-h-[100px]"
              rows={3}
            />
          </label>
          <button type="submit" className="btn-primary">
            Create job
          </button>
        </form>
      )}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-ink-800">
                <th className="p-4 text-sm font-medium text-ink-500">Title</th>
                <th className="p-4 text-sm font-medium text-ink-500">Company</th>
                <th className="p-4 text-sm font-medium text-ink-500">Location</th>
                <th className="p-4 text-sm font-medium text-ink-500">Type</th>
                <th className="p-4 text-sm font-medium text-ink-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-b border-ink-800/50 hover:bg-ink-800/20">
                  <td className="p-4 font-medium text-stone-200">{j.title}</td>
                  <td className="p-4 text-ink-500">{j.company}</td>
                  <td className="p-4 text-ink-500">{j.location}</td>
                  <td className="p-4 text-ink-500">{j.type}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleDelete(j.id, j.title)}
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
        {jobs.length === 0 && (
          <p className="p-8 text-center text-ink-500">No jobs. Add your first one.</p>
        )}
      </div>
    </div>
  );
}
