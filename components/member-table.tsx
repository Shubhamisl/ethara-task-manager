"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "ADMIN" | "MEMBER";

type Member = {
  id: string;
  role: Role;
  user: { id: string; name: string; email: string };
};

export default function MemberTable({
  projectId,
  role,
  members,
}: {
  projectId: string;
  role: Role;
  members: Member[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("MEMBER");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const response = await fetch(`/api/projects/${projectId}/members`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, role: newRole }),
    });

    setBusy(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Failed to add member");
      return;
    }

    setEmail("");
    router.refresh();
  }

  async function changeRole(userId: string, nextRole: Role) {
    const response = await fetch(`/api/projects/${projectId}/members/${userId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });

    if (response.ok) {
      router.refresh();
      return;
    }

    const data = await response.json().catch(() => ({}));
    setError(data.error ?? "Failed to change role");
  }

  async function remove(userId: string) {
    if (!confirm("Remove this member?")) return;

    const response = await fetch(`/api/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.refresh();
      return;
    }

    const data = await response.json().catch(() => ({}));
    setError(data.error ?? "Failed to remove member");
  }

  return (
    <div className="space-y-4">
      {role === "ADMIN" ? (
        <form
          onSubmit={add}
          className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <input
            className="h-10 min-w-56 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <select
            className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            value={newRole}
            onChange={(event) => setNewRole(event.target.value as Role)}
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button
            type="submit"
            disabled={busy}
            className="h-10 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Adding..." : "Add"}
          </button>
        </form>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-t border-slate-100">
                <td className="p-3 font-medium">{member.user.name}</td>
                <td className="p-3 text-slate-500">{member.user.email}</td>
                <td className="p-3">
                  {role === "ADMIN" ? (
                    <select
                      value={member.role}
                      onChange={(event) =>
                        changeRole(member.user.id, event.target.value as Role)
                      }
                      className="h-8 rounded-md border border-slate-300 px-2 text-sm"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  ) : (
                    member.role
                  )}
                </td>
                <td className="p-3 text-right">
                  {role === "ADMIN" ? (
                    <button
                      type="button"
                      onClick={() => remove(member.user.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
