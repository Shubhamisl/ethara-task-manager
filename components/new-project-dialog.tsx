"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProjectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });

    setBusy(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Failed to create project");
      return;
    }

    const project = await response.json();
    setOpen(false);
    router.push(`/projects/${project.id}`);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        New project
      </button>
      {open ? (
        <div className="fixed inset-0 z-20 grid place-items-center bg-slate-950/40 p-4">
          <form
            onSubmit={submit}
            className="w-full max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div>
              <h2 className="text-lg font-semibold">New project</h2>
              <p className="text-sm text-slate-500">
                Create a shared space for tasks and members.
              </p>
            </div>
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Name</span>
              <input
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
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
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="h-9 rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
