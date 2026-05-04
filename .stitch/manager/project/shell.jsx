/* global React, Icon */
// Reusable shared bits: Avatar, AvatarStack, Sidebar, Topbar, Chips

function Avatar({ user, size = "md", showRing = true }) {
  const cls = size === "sm" ? "avatar-sm" : size === "lg" ? "avatar-lg" : size === "xl" ? "avatar-xl" : "";
  const colorClass = `avatar-c${user?.color || 1}`;
  return (
    <div
      className={`avatar ${colorClass} ${cls}`}
      style={!showRing ? { borderColor: "transparent" } : {}}
      title={user?.name}
    >
      {window.E.initials(user?.name)}
    </div>
  );
}

function AvatarStack({ users, max = 4, size = "md" }) {
  const visible = users.slice(0, max);
  const rest = users.length - visible.length;
  return (
    <div className="avatar-stack">
      {visible.map(u => <Avatar key={u.id} user={u} size={size} />)}
      {rest > 0 && (
        <div className={`avatar ${size === "sm" ? "avatar-sm" : ""}`} style={{ background: "var(--ink-2)", color: "var(--ink-9)" }}>
          +{rest}
        </div>
      )}
    </div>
  );
}

function PriorityChip({ priority }) {
  const map = {
    LOW:    { cls: "chip-low",    label: "Low",    icon: "arrowDown" },
    MEDIUM: { cls: "chip-medium", label: "Medium", icon: "flag" },
    HIGH:   { cls: "chip-high",   label: "High",   icon: "alert" },
  };
  const m = map[priority];
  return (
    <span className={`chip ${m.cls}`}>
      <Icon name={m.icon} size={11} stroke={2} />
      {m.label}
    </span>
  );
}

function StatusDot({ status }) {
  const map = {
    TODO:        { color: "var(--ink-5)",   label: "To do" },
    IN_PROGRESS: { color: "var(--accent-9)",label: "In progress" },
    DONE:        { color: "var(--green-9)", label: "Done" },
  };
  const m = map[status];
  if (status === "IN_PROGRESS") {
    return (
      <span className="chip chip-neutral" style={{ paddingLeft: 6 }}>
        <svg width="10" height="10" viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="4" fill="none" stroke={m.color} strokeWidth="1.5" />
          <path d="M5 1 a4 4 0 0 1 0 8" fill={m.color} />
        </svg>
        {m.label}
      </span>
    );
  }
  if (status === "DONE") {
    return (
      <span className="chip chip-success">
        <svg width="11" height="11" viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="5.5" fill="var(--green-9)" />
          <path d="M3.5 6 L5.2 7.7 L8.5 4.5" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {m.label}
      </span>
    );
  }
  return (
    <span className="chip chip-neutral">
      <span className="chip-dot" style={{ background: m.color, border: "1.5px solid var(--ink-5)", background: "transparent" }} />
      {m.label}
    </span>
  );
}

function DueChip({ iso, status }) {
  if (!iso) return null;
  const overdue = window.E.isOverdue(iso, status);
  const label = window.E.formatDue(iso);
  return (
    <span className={`chip ${overdue ? "chip-overdue" : "chip-neutral"}`}>
      <Icon name="clock" size={11} stroke={2} />
      {label}
    </span>
  );
}

function ProjectStatusChip({ status }) {
  const map = {
    "On track":  "chip-success",
    "At risk":   "chip-medium",
    "Blocked":   "chip-high",
    "Planning":  "chip-accent",
    "Done":      "chip-success",
  };
  return (
    <span className={`chip ${map[status] || "chip-neutral"}`}>
      <span className="chip-dot" style={{
        background: status === "On track" ? "var(--green-9)"
                  : status === "At risk"   ? "var(--amber-9)"
                  : status === "Blocked"   ? "var(--red-9)"
                  : status === "Planning"  ? "var(--accent-9)"
                  : "var(--ink-7)"
      }} />
      {status}
    </span>
  );
}

// ---------- Sidebar ----------
function Sidebar({ active, onNavigate, activeProjectId }) {
  const projects = window.ETHARA_DATA.projects;
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-brand-mark">E</div>
        <div className="sb-brand-name">Ethara</div>
        <button className="sb-brand-workspace" title="Switch workspace">
          <Icon name="chevronsUpDown" size={14} />
        </button>
      </div>

      <div className="sb-search">
        <Icon name="search" size={13} className="sb-search-icon" stroke={2} />
        <input placeholder="Search or jump to…" />
        <span className="sb-search-kbd">⌘K</span>
      </div>

      <div className="sb-nav">
        <div style={{ padding: "4px 0" }}>
          <NavItem label="Dashboard" icon="dashboard" active={active === "dashboard"} onClick={() => onNavigate("dashboard")} />
          <NavItem label="My tasks"  icon="check"     count={8}  onClick={() => onNavigate("dashboard")} />
          <NavItem label="Inbox"     icon="inbox"     count={3} />
          <NavItem label="Calendar"  icon="calendar" />
        </div>

        <div className="sb-section">
          <span>Projects</span>
          <button title="New project"><Icon name="plus" size={12} stroke={2.2} /></button>
        </div>
        <div>
          {projects.map(p => (
            <button
              key={p.id}
              className={`sb-link ${active === "project" && activeProjectId === p.id ? "active" : ""}`}
              onClick={() => onNavigate("project", p.id)}
            >
              <span className="sb-project-dot" style={{ background: p.color }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {p.name}
              </span>
            </button>
          ))}
          <button className={`sb-link ${active === "projects" ? "active" : ""}`} onClick={() => onNavigate("projects")} style={{ color: "var(--ink-7)", marginTop: 4 }}>
            <Icon name="folder" size={14} className="sb-icon" />
            <span>All projects</span>
          </button>
        </div>

        <div className="sb-section" style={{ marginTop: 8 }}>
          <span>Workspace</span>
        </div>
        <div>
          <NavItem label="Members" icon="users" />
          <NavItem label="Settings" icon="settings" />
        </div>
      </div>

      <div className="sb-footer">
        <div className="sb-user">
          <Avatar user={window.E.user("u1")} size="md" />
          <div>
            <div className="sb-user-name">Demo Admin</div>
            <div className="sb-user-plan">Acme · Business plan</div>
          </div>
          <Icon name="chevronsUpDown" size={13} className="sb-user-chev" />
        </div>
      </div>
    </aside>
  );
}

function NavItem({ label, icon, count, active, onClick }) {
  return (
    <button className={`sb-link ${active ? "active" : ""}`} onClick={onClick}>
      <Icon name={icon} size={15} className="sb-icon" />
      <span style={{ flex: 1 }}>{label}</span>
      {count != null && <span className="sb-count tnum">{count}</span>}
    </button>
  );
}

// ---------- Topbar ----------
function Topbar({ crumbs = [], actions, children }) {
  return (
    <header className="topbar">
      <div className="tb-crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="tb-sep"><Icon name="chevronRight" size={13} stroke={1.8} /></span>}
            <span className={`tb-crumb ${i === crumbs.length - 1 ? "active" : ""}`}>
              {c.icon && <Icon name={c.icon} size={14} />}
              {c.label}
            </span>
          </React.Fragment>
        ))}
      </div>
      {children}
      <div className="tb-actions">
        {actions}
        <button className="tb-iconbtn" title="Help">
          <Icon name="help" size={15} />
        </button>
        <button className="tb-iconbtn" title="Notifications">
          <Icon name="bell" size={15} />
          <span style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: "var(--red-9)" }} />
        </button>
      </div>
    </header>
  );
}

Object.assign(window, { Avatar, AvatarStack, PriorityChip, StatusDot, DueChip, ProjectStatusChip, Sidebar, Topbar, NavItem });
