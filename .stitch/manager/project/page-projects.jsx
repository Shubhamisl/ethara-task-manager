/* global React, Icon, Avatar, AvatarStack, ProjectStatusChip, ProgressBar, Topbar */

const { useState: useStateP } = React;

function ProjectsPage({ onNavigate, onNew }) {
  const projects = window.ETHARA_DATA.projects;
  const users = window.ETHARA_DATA.users;
  const tasks = window.ETHARA_DATA.tasks;
  const [view, setView] = useStateP("grid");

  return (
    <>
      <Topbar
        crumbs={[{ label: "Acme workspace", icon: "building" }, { label: "Projects" }]}
        actions={
          <>
            <button className="btn btn-secondary btn-sm"><Icon name="filter" size={13} /> Filter</button>
            <button className="btn btn-primary btn-sm" onClick={onNew}><Icon name="plus" size={13} stroke={2.2} /> New project</button>
          </>
        }
      />
      <div className="page">
        <div className="page-narrow">
          <div className="page-head">
            <div>
              <div className="page-eyebrow">Workspace</div>
              <h1 className="page-title">Projects</h1>
              <p className="page-subtitle">{projects.length} active projects across your team. Drill in for tasks, members, and settings.</p>
            </div>
            <div className="hstack" style={{ background: "var(--ink-1)", borderRadius: 8, padding: 2, border: "1px solid var(--ink-3)" }}>
              <ToggleBtn active={view === "grid"} onClick={() => setView("grid")} icon="grid" label="Grid" />
              <ToggleBtn active={view === "list"} onClick={() => setView("list")} icon="list" label="List" />
            </div>
          </div>

          {view === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {projects.map(p => {
                const members = p.memberIds.map(id => window.E.user(id));
                const projTasks = tasks.filter(t => t.id); // mock — show all
                const open = Math.round((1 - p.progress) * 14);
                return (
                  <button key={p.id} className="card" onClick={() => onNavigate("project", p.id)} style={{
                    textAlign: "left", padding: 0, cursor: "pointer", border: "1px solid var(--ink-3)",
                    transition: "border-color 120ms, box-shadow 120ms",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ink-4)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--ink-3)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
                  >
                    <div style={{ padding: "16px 18px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: p.color, color: "white",
                          display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.02em" }}>{p.key}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink-12)", letterSpacing: "-0.01em",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                          <div style={{ fontSize: 11.5, color: "var(--ink-7)", marginTop: 1 }}>Admin</div>
                        </div>
                        <ProjectStatusChip status={p.status} />
                      </div>
                      <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-7)", lineHeight: 1.5,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 36 }}>
                        {p.description}
                      </p>
                    </div>
                    <div style={{ padding: "0 18px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, color: "var(--ink-7)", marginBottom: 6 }}>
                        <span>Progress</span>
                        <span className="tnum" style={{ color: "var(--ink-11)", fontWeight: 500 }}>{Math.round(p.progress * 100)}%</span>
                      </div>
                      <ProgressBar value={p.progress} color={p.color} height={5} />
                    </div>
                    <div style={{ padding: "10px 18px", borderTop: "1px solid var(--ink-2)", display: "flex", alignItems: "center" }}>
                      <AvatarStack users={members} max={4} size="sm" />
                      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14, fontSize: 11.5, color: "var(--ink-7)" }}>
                        <span className="hstack" style={{ gap: 4 }}><Icon name="check" size={12} /> <span className="tnum">{open}</span> open</span>
                        <span className="hstack" style={{ gap: 4 }}><Icon name="users" size={12} /> <span className="tnum">{members.length}</span></span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "auto 1fr 110px 220px 100px 110px",
                gap: 16, padding: "10px 18px", borderBottom: "1px solid var(--ink-3)",
                fontSize: 11, color: "var(--ink-7)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
              }}>
                <span style={{ width: 8 }}></span>
                <span>Project</span>
                <span>Status</span>
                <span>Progress</span>
                <span>Members</span>
                <span style={{ textAlign: "right" }}>Open</span>
              </div>
              {projects.map((p, i) => {
                const members = p.memberIds.map(id => window.E.user(id));
                const open = Math.round((1 - p.progress) * 14);
                return (
                  <div key={p.id} onClick={() => onNavigate("project", p.id)} style={{
                    display: "grid", gridTemplateColumns: "auto 1fr 110px 220px 100px 110px",
                    gap: 16, padding: "12px 18px", alignItems: "center", cursor: "pointer",
                    borderTop: i === 0 ? "none" : "1px solid var(--ink-2)",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--ink-1)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink-12)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</div>
                    </div>
                    <ProjectStatusChip status={p.status} />
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <ProgressBar value={p.progress} color={p.color} height={5} />
                      <span className="tnum" style={{ fontSize: 11.5, color: "var(--ink-7)", minWidth: 28 }}>{Math.round(p.progress * 100)}%</span>
                    </div>
                    <AvatarStack users={members} max={4} size="sm" />
                    <span className="tnum" style={{ textAlign: "right", fontSize: 12.5, color: "var(--ink-9)" }}>{open}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ToggleBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{
      height: 26, padding: "0 10px", border: "none",
      background: active ? "var(--white)" : "transparent",
      color: active ? "var(--ink-12)" : "var(--ink-7)",
      borderRadius: 6, fontSize: 12.5, fontWeight: 500,
      display: "inline-flex", alignItems: "center", gap: 5,
      boxShadow: active ? "var(--shadow-sm)" : "none",
    }}>
      <Icon name={icon} size={13} /> {label}
    </button>
  );
}

window.ProjectsPage = ProjectsPage;
window.ToggleBtn = ToggleBtn;
