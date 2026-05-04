"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

const COLUMNS: Array<{ status: TaskStatus; label: string }> = [
  { status: "TODO", label: "To do" },
  { status: "IN_PROGRESS", label: "In progress" },
  { status: "DONE", label: "Done" },
];

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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setNewOpen(true)}
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          New task
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.status === column.status
          );

          return (
            <section
              key={column.status}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const taskId = event.dataTransfer.getData("text/plain");
                const task = tasks.find((item) => item.id === taskId);
                if (!task || task.status === column.status) return;
                const canMove =
                  role === "ADMIN" || task.assigneeId === currentUserId;
                if (!canMove) return;
                move(taskId, column.status);
              }}
              className="min-h-96 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">
                  {column.label}
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {columnTasks.length}
                </span>
              </div>
              <ul className="space-y-2">
                {columnTasks.map((task) => (
                  <li
                    key={task.id}
                    draggable
                    onDragStart={(event) =>
                      event.dataTransfer.setData("text/plain", task.id)
                    }
                    className="cursor-grab rounded-md border border-slate-200 bg-slate-50 p-3 text-sm shadow-sm active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-medium text-slate-950">
                        {task.title}
                      </span>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    {task.description ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                        {task.description}
                      </p>
                    ) : null}
                    {task.dueDate ? (
                      <div
                        className={`mt-2 text-xs ${
                          new Date(task.dueDate) < new Date() &&
                          task.status !== "DONE"
                            ? "text-red-600"
                            : "text-slate-500"
                        }`}
                      >
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    ) : null}
                    {task.assignee ? (
                      <div className="mt-1 text-xs text-slate-500">
                        Assigned to {task.assignee.name}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {newOpen ? (
        <NewTaskDialog
          projectId={projectId}
          members={members}
          onClose={() => setNewOpen(false)}
          onCreated={() => router.refresh()}
        />
      ) : null}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const classes = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-amber-100 text-amber-700",
    HIGH: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${classes[priority]}`}
    >
      {priority}
    </span>
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
  onCreated: () => void;
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

    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-slate-950/40 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div>
          <h2 className="text-lg font-semibold">New task</h2>
          <p className="text-sm text-slate-500">
            Add work to this project board.
          </p>
        </div>
        <input
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          placeholder="Title"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          required
        />
        <textarea
          className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          placeholder="Description"
          value={form.description}
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            value={form.priority}
            onChange={(event) =>
              setForm({
                ...form,
                priority: event.target.value as TaskPriority,
              })
            }
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <input
            type="date"
            className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            value={form.dueDate}
            onChange={(event) =>
              setForm({ ...form, dueDate: event.target.value })
            }
          />
        </div>
        <select
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          value={form.assigneeId}
          onChange={(event) =>
            setForm({ ...form, assigneeId: event.target.value })
          }
        >
          <option value="">Unassigned</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
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
  );
}
