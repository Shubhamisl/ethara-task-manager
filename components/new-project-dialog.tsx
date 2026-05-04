"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const PROJECT_COLORS = [
  "#3F52C9",
  "#5E3AAE",
  "#1F6E7A",
  "#1F7A4D",
  "#95590C",
  "#B0352B",
  "#9B2B6E",
];

export default function NewProjectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#3F52C9" });
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
    setForm({ name: "", description: "", color: "#3F52C9" });
    router.push(`/projects/${project.id}`);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-primary"
      >
        <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
          <path
            d="M7.5 2V13M2 7.5H13"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        New project
      </button>

      {open && (
        <div className="dialog-backdrop" onClick={() => setOpen(false)}>
          <form
            className="dialog"
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-head">
              <div className="dialog-title">Create project</div>
              <div className="dialog-subtitle">
                Group tasks, members, and milestones.
              </div>
            </div>

            <div className="dialog-body">
              <div className="field">
                <label className="field-label" htmlFor="proj-name">
                  Project name
                </label>
                <input
                  className="input"
                  id="proj-name"
                  placeholder="e.g. Q3 launch"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="proj-desc">
                  Description{" "}
                  <span style={{ color: "var(--ink-7)", fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <textarea
                  className="textarea"
                  id="proj-desc"
                  placeholder="What is this project about?"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label className="field-label">Color</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: 36,
                    padding: "0 10px",
                    background: "var(--white)",
                    border: "1px solid var(--ink-3)",
                    borderRadius: 6,
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        background: c,
                        border:
                          c === form.color
                            ? "2px solid var(--ink-12)"
                            : "2px solid transparent",
                        boxShadow:
                          c === form.color ? "0 0 0 2px var(--white) inset" : "none",
                        padding: 0,
                        cursor: "pointer",
                        flexShrink: 0,
                        transition: "transform 80ms",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.15)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    />
                  ))}
                </div>
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
            </div>

            <div className="dialog-foot">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary btn-sm"
              >
                {busy ? "Creating…" : "Create project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
