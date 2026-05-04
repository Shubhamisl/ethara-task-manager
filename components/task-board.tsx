"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
type Role = "ADMIN" | "MEMBER";

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assigneeId: string | null;
  assignee: { id: string; name: string; email: string } | null;
};

type Member = { id: string; name: string; email: string };

const COLUMNS: Array<{
  status: TaskStatus;
  label: string;
  color: string;
}> = [
  { status: "TODO", label: "To do", color: "var(--ink-5)" },
  { status: "IN_PROGRESS", label: "In progress", color: "var(--accent-9)" },
  { status: "DONE", label: "Done", color: "var(--green-9)" },
];

const PRIORITY_CHIP: Record<TaskPriority, string> = {
  LOW: "chip chip-low",
  MEDIUM: "chip chip-medium",
  HIGH: "chip chip-high",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "avatar-c1",
  "avatar-c2",
  "avatar-c3",
  "avatar-c4",
  "avatar-c5",
  "avatar-c6",
  "avatar-c7",
];
function avatarColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function TaskBoard({
  projectId,
  role,
  currentUserId,
  initialTasks,
  members,
}: {
  projectId: string;
  role: Role;
  currentUserId: string;
  initialTasks: Task[];
  members: Member[];
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [newOpen, setNewOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  async function move(taskId: string, status: TaskStatus) {
    const previous = tasks;
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status } : task))
    );

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setTasks(previous);
      router.refresh();
    }
  }

  const filtered = search
    ? tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    : tasks;

  const now = new Date();

  return (
    <div>
      {/* Filter row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 10px",
            height: 32,
            background: "var(--white)",
            border: "1px solid var(--ink-3)",
            borderRadius: 6,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none" style={{ color: "var(--ink-7)", flexShrink: 0 }}>
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 13,
              width: 180,
              color: "var(--ink-11)",
            }}
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary btn-sm">
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none" style={{ color: "var(--ink-7)" }}>
            <path d="M1.5 4h12M4 7.5h7M6.5 11h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Filter
        </button>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setNewOpen(true)}
          className="btn btn-primary btn-sm"
        >
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 2V13M2 7.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          New task
        </button>
      </div>

      {/* Kanban columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          alignItems: "start",
        }}
      >
        {COLUMNS.map((column) => {
          const columnTasks = filtered.filter((t) => t.status === column.status);

          return (
            <section
              key={column.status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const taskId = e.dataTransfer.getData("text/plain");
                const task = tasks.find((item) => item.id === taskId);
                if (!task || task.status === column.status) return;
                const canMove = role === "ADMIN" || task.assigneeId === currentUserId;
                if (!canMove) return;
                move(taskId, column.status);
              }}
              style={{
                background: "var(--ink-1)",
                border: "1px solid var(--ink-3)",
                borderRadius: 10,
                padding: 8,
                minHeight: 480,
              }}
            >
              {/* Column header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px 10px",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: column.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--ink-12)",
                  }}
                >
                  {column.label}
                </span>
                <span
                  className="tnum"
                  style={{
                    fontSize: 11.5,
                    color: "var(--ink-7)",
                    background: "var(--white)",
                    border: "1px solid var(--ink-3)",
                    padding: "1px 6px",
                    borderRadius: 999,
                  }}
                >
                  {columnTasks.length}
                </span>
                <div style={{ marginLeft: "auto" }}>
                  <button
                    type="button"
                    onClick={() => setNewOpen(true)}
                    className="btn-ghost"
                    style={{
                      width: 24,
                      height: 24,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 4,
                      border: "none",
                      color: "var(--ink-7)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                      <path d="M7.5 2V13M2 7.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Task cards */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {columnTasks.map((task) => {
                  const isOverdue =
                    task.dueDate &&
                    new Date(task.dueDate) < now &&
                    task.status !== "DONE";

                  return (
                    <li
                      key={task.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", task.id)}
                      style={{
                        background: "var(--white)",
                        border: "1px solid var(--ink-3)",
                        borderRadius: 8,
                        padding: "10px 12px",
                        cursor: "grab",
                        boxShadow: "var(--shadow-sm)",
                        transition: "border-color 100ms, box-shadow 100ms",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--ink-4)";
                        e.currentTarget.style.boxShadow = "var(--shadow-md)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--ink-3)";
                        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          className="tnum"
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "var(--ink-7)",
                          }}
                        >
                          {task.id.slice(-6).toUpperCase()}
                        </span>
                        <div style={{ flex: 1 }} />
                        <span className={PRIORITY_CHIP[task.priority]}>
                          {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 500,
                          color: "var(--ink-12)",
                          letterSpacing: "-0.005em",
                          lineHeight: 1.35,
                          marginBottom: task.description ? 4 : 8,
                        }}
                      >
                        {task.title}
                      </div>

                      {task.description && (
                        <p
                          style={{
                            margin: "0 0 8px 0",
                            fontSize: 12,
                            color: "var(--ink-7)",
                            lineHeight: 1.45,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {task.description}
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          paddingTop: 6,
                          borderTop: "1px solid var(--ink-2)",
                        }}
                      >
                        {task.dueDate && (
                          <span
                            className={`chip ${isOverdue ? "chip-overdue" : "chip-neutral"}`}
                          >
                            {new Date(task.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                        <div style={{ flex: 1 }} />
                        {task.assignee ? (
                          <div
                            className={`avatar avatar-sm ${avatarColor(task.assignee.name)}`}
                            title={task.assignee.name}
                          >
                            {getInitials(task.assignee.name)}
                          </div>
                        ) : (
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              border: "1.5px dashed var(--ink-4)",
                              display: "grid",
                              placeItems: "center",
                              color: "var(--ink-6)",
                            }}
                          >
                            <svg width="10" height="10" viewBox="0 0 15 15" fill="none">
                              <path d="M7.5 2V13M2 7.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Add task button */}
              <button
                type="button"
                onClick={() => setNewOpen(true)}
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: "8px 10px",
                  background: "transparent",
                  border: "1px dashed var(--ink-4)",
                  borderRadius: 6,
                  color: "var(--ink-7)",
                  fontSize: 12.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 80ms, color 80ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--white)";
                  e.currentTarget.style.color = "var(--ink-11)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--ink-7)";
                }}
              >
                <svg width="12" height="12" viewBox="0 0 15 15" fill="none">
                  <path d="M7.5 2V13M2 7.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Add task
              </button>
            </section>
          );
        })}
      </div>

      {newOpen && (
        <NewTaskDialog
          projectId={projectId}
          members={members}
          onClose={() => setNewOpen(false)}
          onCreated={(task) => {
            setTasks((current) => [task, ...current.filter((item) => item.id !== task.id)]);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function NewTaskDialog({
  projectId,
  members,
  onClose,
  onCreated,
}: {
  projectId: string;
  members: Member[];
  onClose: () => void;
  onCreated: (task: Task) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as TaskPriority,
    assigneeId: "",
    dueDate: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const body: Record<string, unknown> = {
      title: form.title,
      description: form.description,
      priority: form.priority,
    };
    if (form.assigneeId) body.assigneeId = form.assigneeId;
    if (form.dueDate) body.dueDate = new Date(form.dueDate).toISOString();

    const response = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    setBusy(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Failed to create task");
      return;
    }

    const task = (await response.json()) as Task;
    onCreated(task);
    onClose();
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <form
        className="dialog"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 560 }}
      >
        <div className="dialog-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "var(--ink-1)",
                display: "grid",
                placeItems: "center",
                color: "var(--ink-9)",
                flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2.5 7.5L5.5 10.5L12.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <div className="dialog-title">New task</div>
            </div>
            <div style={{ flex: 1 }} />
            <button type="button" className="tb-iconbtn" onClick={onClose}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M3 3L12 12M12 3L3 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="dialog-body">
          <input
            className="input"
            style={{
              height: 40,
              fontSize: 15,
              fontWeight: 500,
              border: "none",
              boxShadow: "none",
              padding: 0,
            }}
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            autoFocus
          />
          <textarea
            className="textarea"
            placeholder="Add a description…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ border: "none", boxShadow: "none", padding: "0 0", minHeight: 60 }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label className="field-label">Priority</label>
              <select
                className="input select-field"
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value as TaskPriority })
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">Due date</label>
              <input
                type="date"
                className="input"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Assignee</label>
            <select
              className="input select-field"
              value={form.assigneeId}
              onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
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
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
            {busy ? "Creating…" : "Create task"}
          </button>
        </div>
      </form>
    </div>
  );
}
