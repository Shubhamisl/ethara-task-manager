"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "ADMIN" | "MEMBER";

type Member = {
  id: string;
  role: Role;
  user: { id: string; name: string; email: string };
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
  const [search, setSearch] = useState("");

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

    if (response.ok) { router.refresh(); return; }
    const data = await response.json().catch(() => ({}));
    setError(data.error ?? "Failed to change role");
  }

  async function remove(userId: string) {
    if (!confirm("Remove this member?")) return;

    const response = await fetch(`/api/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
    });

    if (response.ok) { router.refresh(); return; }
    const data = await response.json().catch(() => ({}));
    setError(data.error ?? "Failed to remove member");
  }

  const filtered = search
    ? members.filter(
        (m) =>
          m.user.name.toLowerCase().includes(search.toLowerCase()) ||
          m.user.email.toLowerCase().includes(search.toLowerCase())
      )
    : members;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          padding: "14px 18px 12px",
          borderBottom: "1px solid var(--ink-3)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: "var(--ink-12)",
          }}
        >
          Project members
        </h2>
        <span className="chip chip-neutral">{members.length}</span>

        <div style={{ flex: 1 }} />

        {/* Search */}
        <div
          className="member-search"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 10px",
            height: 32,
            background: "var(--ink-1)",
            border: "1px solid var(--ink-3)",
            borderRadius: 6,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none" style={{ color: "var(--ink-7)" }}>
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
            placeholder="Search members…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Invite form — admin only */}
        {role === "ADMIN" && (
          <form
            className="member-invite-form"
            onSubmit={add}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <input
              className="input"
              style={{ height: 32, width: 200, fontSize: 13 }}
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <select
              className="input select-field"
              style={{ height: 32, width: 110, fontSize: 13 }}
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary btn-sm"
            >
              {busy ? "Adding…" : "Invite"}
            </button>
          </form>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: "10px 18px",
            fontSize: 13,
            color: "var(--red-9)",
            background: "var(--red-2)",
            borderBottom: "1px solid var(--red-3)",
          }}
        >
          {error}
        </div>
      )}

      {/* Table header */}
      <div
        className="member-table-head"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px 140px 56px",
          gap: 16,
          padding: "10px 18px",
          borderBottom: "1px solid var(--ink-3)",
          fontSize: 11,
          color: "var(--ink-7)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 600,
        }}
      >
        <span>Name</span>
        <span>Email</span>
        <span>Role</span>
        <span />
      </div>

      {/* Rows */}
      {filtered.map((member, i) => (
        <div
          key={member.id}
          className="member-table-row"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 220px 140px 56px",
            gap: 16,
            padding: "12px 18px",
            alignItems: "center",
            borderTop: i === 0 ? "none" : "1px solid var(--ink-2)",
            transition: "background 80ms",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--ink-1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              className={`avatar avatar-lg ${avatarColor(member.user.name)}`}
            >
              {getInitials(member.user.name)}
            </div>
            <div>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: "var(--ink-12)",
                }}
              >
                {member.user.name}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, color: "var(--ink-7)" }}>
            {member.user.email}
          </div>

          <div>
            {role === "ADMIN" ? (
              <select
                value={member.role}
                onChange={(e) =>
                  changeRole(member.user.id, e.target.value as Role)
                }
                className={`chip ${member.role === "ADMIN" ? "chip-accent" : "chip-neutral"}`}
                style={{
                  cursor: "pointer",
                  border: "none",
                  height: "auto",
                  boxShadow: "none",
                  appearance: "none",
                  paddingRight: 4,
                }}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            ) : (
              <span
                className={`chip ${member.role === "ADMIN" ? "chip-accent" : "chip-neutral"}`}
              >
                {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
              </span>
            )}
          </div>

          <div style={{ textAlign: "right" }}>
            {role === "ADMIN" && (
              <button
                type="button"
                onClick={() => remove(member.user.id)}
                className="tb-iconbtn"
                title="Remove member"
              >
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                  <path
                    d="M3 3L12 12M12 3L3 12"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div
          style={{
            padding: "32px 18px",
            textAlign: "center",
            color: "var(--ink-7)",
            fontSize: 13,
          }}
        >
          No members found.
        </div>
      )}
    </div>
  );
}
