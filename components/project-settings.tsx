"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProjectSettings({
  projectId,
  initial,
}: {
  projectId: string;
  initial: { name: string; description: string };
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });

    setBusy(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Failed to save project");
      return;
    }

    router.refresh();
  }

  async function destroy() {
    if (!confirm("Delete this project? This cannot be undone.")) return;

    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.push("/projects");
      router.refresh();
      return;
    }

    const data = await response.json().catch(() => ({}));
    setError(data.error ?? "Failed to delete project");
  }

  return (
    <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <form onSubmit={save} className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-sm text-slate-500">
            Update project details or delete the project.
          </p>
        </div>
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Name</span>
          <input
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Description</span>
          <textarea
            className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="h-10 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save"}
        </button>
      </form>

      <div className="border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={destroy}
          className="h-10 rounded-md border border-red-300 px-4 text-sm font-medium text-red-700 transition hover:bg-red-50"
        >
          Delete project
        </button>
      </div>
    </div>
  );
}
