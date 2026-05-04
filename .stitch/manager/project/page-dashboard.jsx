/* global React, Icon, Avatar, AvatarStack, ProjectStatusChip, PriorityChip, StatusDot, DueChip, Topbar */

const { useMemo: useMemoDash } = React;

// ============================================================
// DASHBOARD
// ============================================================
function DashboardPage({ onNavigate }) {
  const { tasks, projects, users, activity } = window.ETHARA_DATA;
  const me = window.E.user("u1");

  // counts (across all projects, my tasks)
  const counts = useMemoDash(() => {
    const c = { TODO: 0, IN_PROGRESS: 0, DONE: 0, OVERDUE: 0 };
    tasks.forEach(t => {
      c[t.status]++;
      if (window.E.isOverdue(t.dueDate, t.status)) c.OVERDUE++;
    });
    return c;
  }, [tasks]);

  // Tasks "assigned to me" — pretend any unassigned + a couple are mine
  const myTasks = tasks.filter(t => t.assigneeId === "u1" || t.assigneeId === "u2").slice(0, 6);

  return (
    <>
      <Topbar crumbs={[{ label: "Acme workspace", icon: "building" }, { label: "Dashboard" }]}
        actions={<button className="btn btn-secondary btn-sm"><Icon name="plus" size={13} stroke={2.2} /> Quick add</button>} />
      <div className="page">
        <div className="page-narrow">
          <div className="page-head">
            <div>
              <div className="page-eyebrow">Tuesday, May 5</div>
              <h1 className="page-title">Good morning, Demo</h1>
              <p className="page-subtitle">You have <strong style={{ color: "var(--ink-12)" }}>3 tasks</strong> due this week and <strong style={{ color: "var(--red-9)" }}>1 overdue</strong>. Two pull requests are waiting on your review.</p>
            </div>
            <div className="hstack">
              <button className="btn btn-secondary btn-sm"><Icon name="calendar" size={13} /> May 5 – 11</button>
              <button className="btn btn-primary btn-sm"><Icon name="plus" size={13} stroke={2.2} /> New task</button>
            </div>
          </div>

          {/* Metric cards */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
            <MetricCard label="Open" value={counts.TODO + counts.IN_PROGRESS} delta="+3" trend="up" sub="tasks across 6 projects" />
            <MetricCard label="In progress" value={counts.IN_PROGRESS} delta="+1" trend="up" sub={`${Math.round((counts.IN_PROGRESS/(counts.TODO+counts.IN_PROGRESS||1))*100)}% of open`} />
            <MetricCard label="Overdue" value={counts.OVERDUE} delta={counts.OVERDUE > 0 ? "+1" : "0"} trend={counts.OVERDUE > 0 ? "warn" : "flat"} sub="needs attention" warn={counts.OVERDUE > 0} />
            <MetricCard label="Completed" value={counts.DONE} delta="+4" trend="up" sub="last 7 days" />
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}>
            {/* My tasks */}
            <section className="card">
              <div style={{ display: "flex", alignItems: "center", padding: "14px 16px 10px", borderBottom: "1px solid var(--ink-3)" }}>
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--ink-12)" }}>My tasks this week</h2>
                <span className="chip chip-neutral" style={{ marginLeft: 10 }}>{myTasks.length}</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                  <button className="btn btn-ghost btn-sm" style={{ color: "var(--ink-7)" }}><Icon name="filter" size={13} /> Filter</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: "var(--ink-7)" }}>View all <Icon name="arrowRight" size={12} /></button>
                </div>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {myTasks.map((t, i) => {
                  const proj = projects.find(p => p.id === "p1");
                  const assignee = window.E.user(t.assigneeId);
                  return (
                    <li key={t.id} style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto auto auto",
                      gap: 12,
                      alignItems: "center",
                      padding: "10px 16px",
                      borderBottom: i === myTasks.length - 1 ? "none" : "1px solid var(--ink-2)",
                      cursor: "pointer",
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--ink-1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <Checkbox checked={t.status === "DONE"} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="tnum" style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-7)" }}>{t.key}</span>
                          <span style={{
                            fontSize: 13.5,
                            fontWeight: 500,
                            color: t.status === "DONE" ? "var(--ink-7)" : "var(--ink-12)",
                            textDecoration: t.status === "DONE" ? "line-through" : "none",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>{t.title}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ink-7)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                          <span className="sb-project-dot" style={{ background: proj.color }} />
                          {proj.name}
                        </div>
                      </div>
                      <PriorityChip priority={t.priority} />
                      <DueChip iso={t.dueDate} status={t.status} />
                      <Avatar user={assignee} size="sm" />
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Activity */}
              <section className="card">
                <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--ink-3)" }}>
                  <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--ink-12)" }}>Activity</h2>
                </div>
                <ul style={{ listStyle: "none", padding: "8px 0", margin: 0 }}>
                  {activity.map(a => {
                    const u = window.E.user(a.who);
                    return (
                      <li key={a.id} style={{ display: "flex", gap: 10, padding: "8px 16px", alignItems: "flex-start" }}>
                        <Avatar user={u} size="sm" />
                        <div style={{ fontSize: 12.5, color: "var(--ink-9)", lineHeight: 1.45, flex: 1 }}>
                          <span style={{ fontWeight: 500, color: "var(--ink-12)" }}>{u.name}</span>{" "}
                          <span style={{ color: "var(--ink-7)" }}>{a.what}</span>{" "}
                          <span style={{ fontWeight: 500, color: "var(--ink-12)" }}>{a.target}</span>
                          {a.to && <> <span style={{ color: "var(--ink-7)" }}>to</span> <span style={{ fontWeight: 500, color: "var(--ink-12)" }}>{a.to}</span></>}
                          <div style={{ color: "var(--ink-7)", fontSize: 11.5, marginTop: 1 }}>{a.when}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Projects mini */}
              <section className="card">
                <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--ink-3)", display: "flex", alignItems: "center" }}>
                  <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--ink-12)" }}>Projects</h2>
                  <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("projects")} style={{ marginLeft: "auto", color: "var(--ink-7)" }}>View all <Icon name="arrowRight" size={12} /></button>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {projects.slice(0, 4).map((p, i) => (
                    <li key={p.id}
                      onClick={() => onNavigate("project", p.id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderTop: i === 0 ? "none" : "1px solid var(--ink-2)", cursor: "pointer" }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-12)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                        <ProgressBar value={p.progress} />
                      </div>
                      <div className="tnum" style={{ fontSize: 11.5, color: "var(--ink-7)", minWidth: 30, textAlign: "right" }}>{Math.round(p.progress * 100)}%</div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MetricCard({ label, value, delta, trend, sub, warn }) {
  const trendColor = trend === "up" ? "var(--green-9)" : trend === "warn" ? "var(--red-9)" : "var(--ink-7)";
  return (
    <div className="card" style={{ padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "var(--ink-7)", fontWeight: 500 }}>{label}</span>
        {trend && (
          <span style={{ fontSize: 11.5, color: trendColor, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 2 }}>
            {trend === "up" && <Icon name="arrowUpRight" size={11} stroke={2.2} />}
            {delta}
          </span>
        )}
      </div>
      <div className="tnum" style={{
        fontFamily: "var(--font-display)",
        fontSize: 30,
        fontWeight: 600,
        letterSpacing: "-0.03em",
        color: warn ? "var(--red-9)" : "var(--ink-12)",
        lineHeight: 1,
      }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-7)", marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function ProgressBar({ value, color = "var(--ink-12)", height = 4 }) {
  return (
    <div style={{ width: "100%", height, background: "var(--ink-2)", borderRadius: 999, marginTop: 6, overflow: "hidden" }}>
      <div style={{ width: `${value * 100}%`, height: "100%", background: color, borderRadius: 999 }} />
    </div>
  );
}

function Checkbox({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      aria-checked={checked}
      role="checkbox"
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        border: "1.5px solid " + (checked ? "var(--ink-12)" : "var(--ink-4)"),
        background: checked ? "var(--ink-12)" : "var(--white)",
        display: "grid",
        placeItems: "center",
        padding: 0,
        flexShrink: 0,
      }}
    >
      {checked && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2.5 6.5 L5 9 L9.5 3.5" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </button>
  );
}

window.DashboardPage = DashboardPage;
window.MetricCard = MetricCard;
window.ProgressBar = ProgressBar;
window.Checkbox = Checkbox;
