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
  const [saved, setSaved] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);

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

    setSaved(true);
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 720,
      }}
    >
      {/* General card */}
      <div className="card">
        <div style={{ padding: "16px 20px 6px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--ink-12)",
            }}
          >
            General
          </h2>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: 12.5,
              color: "var(--ink-7)",
            }}
          >
            Basic information about this project.
          </p>
        </div>

        <form
          onSubmit={save}
          style={{
            padding: "12px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div className="field">
            <label className="field-label" htmlFor="settings-name">
              Project name
            </label>
            <input
              className="input"
              id="settings-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="settings-desc">
              Description
            </label>
            <textarea
              className="textarea"
              id="settings-desc"
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What is this project about?"
            />
          </div>

          {error && (
            <div
              style={{
                fontSize: 13,
                color: "var(--red-9)",
                background: "var(--red-2)",
                border: "1px solid var(--red-3)",
                borderRadius: 6,
                padding: "8px 12px",
              }}
            >
              {error}
            </div>
          )}

          {saved && (
            <div
              style={{
                fontSize: 13,
                color: "var(--green-9)",
                background: "var(--green-2)",
                border: "1px solid var(--green-3)",
                borderRadius: 6,
                padding: "8px 12px",
              }}
            >
              Changes saved successfully.
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              paddingTop: 4,
              borderTop: "1px solid var(--ink-2)",
              marginTop: 4,
            }}
          >
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setForm(initial); setSaved(false); }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary btn-sm"
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div
        className="card"
        style={{
          borderColor: "var(--red-3)",
          background: "#FFFCFB",
        }}
      >
        <div style={{ padding: "16px 20px 6px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--red-9)",
            }}
          >
            Danger zone
          </h2>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: 12.5,
              color: "var(--ink-7)",
            }}
          >
            Irreversible actions. Proceed with care.
          </p>
        </div>
        <div
          style={{
            padding: "12px 20px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--ink-12)",
              }}
            >
              Delete this project
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-7)" }}>
              All tasks, members, and history will be permanently removed.
            </div>
          </div>
          <button
            type="button"
            onClick={destroy}
            className="btn btn-secondary btn-sm"
            style={{ borderColor: "var(--red-3)", color: "var(--red-9)" }}
          >
            <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
              <path
                d="M5 2H10M2 4H13M4 4L4.5 12C4.5 12.5523 4.94772 13 5.5 13H9.5C10.0523 13 10.5 12.5523 10.5 12L11 4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Delete project
          </button>
        </div>
      </div>
    </div>
  );
}
