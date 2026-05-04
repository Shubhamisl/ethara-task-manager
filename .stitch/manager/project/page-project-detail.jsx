/* global React, Icon, Avatar, AvatarStack, PriorityChip, StatusDot, DueChip, ProjectStatusChip, ProgressBar, Topbar, Checkbox */

const { useState: useStatePD, useMemo: useMemoPD } = React;

function ProjectDetailPage({ projectId, tab, onTabChange, onNewTask, onNavigate }) {
  const project = window.E.project(projectId);
  const tasks = window.ETHARA_DATA.tasks;
  const members = project.memberIds.map(id => window.E.user(id));

  return (
    <>
      <Topbar
        crumbs={[
          { label: "Acme workspace", icon: "building" },
          { label: "Projects" },
          { label: project.name },
        ]}
        actions={
          <>
            <button className="btn btn-ghost btn-sm" style={{ color: "var(--ink-7)" }}><Icon name="star" size={14} /></button>
            <div className="tb-divider" />
            <button className="btn btn-secondary btn-sm"><Icon name="link" size={13} /> Share</button>
            {tab === "tasks" && <button className="btn btn-primary btn-sm" onClick={onNewTask}><Icon name="plus" size={13} stroke={2.2} /> New task</button>}
          </>
        }
      />
      <div className="page">
        <div className="page-narrow">
          {/* Project header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10, background: project.color, color: "white",
              display: "grid", placeItems: "center", fontFamily: "var(--font-mono)",
              fontSize: 14, fontWeight: 600, letterSpacing: "0.02em", flexShrink: 0,
            }}>{project.key}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="hstack" style={{ gap: 10, marginBottom: 4 }}>
                <h1 className="page-title" style={{ fontSize: 22 }}>{project.name}</h1>
                <ProjectStatusChip status={project.status} />
              </div>
              <p className="page-subtitle" style={{ marginTop: 2 }}>{project.description}</p>
              <div className="hstack" style={{ gap: 16, marginTop: 12, fontSize: 12.5, color: "var(--ink-7)" }}>
                <span className="hstack" style={{ gap: 6 }}><Icon name="users" size={13} /> {members.length} members</span>
                <span className="hstack" style={{ gap: 6 }}><Icon name="calendar" size={13} /> Due Jul 18, 2026</span>
                <span className="hstack" style={{ gap: 6 }}><Icon name="trending" size={13} /> {Math.round(project.progress * 100)}% complete</span>
              </div>
            </div>
            <AvatarStack users={members} max={5} size="md" />
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button className={`tab ${tab === "tasks" ? "active" : ""}`} onClick={() => onTabChange("tasks")}>
              <Icon name="kanban" size={14} /> Tasks <span className="tab-count tnum">{tasks.length}</span>
            </button>
            <button className={`tab ${tab === "members" ? "active" : ""}`} onClick={() => onTabChange("members")}>
              <Icon name="users" size={14} /> Members <span className="tab-count tnum">{members.length}</span>
            </button>
            <button className={`tab ${tab === "settings" ? "active" : ""}`} onClick={() => onTabChange("settings")}>
              <Icon name="settings" size={14} /> Settings
            </button>
            <div style={{ marginLeft: "auto" }} />
          </div>

          {tab === "tasks" && <TaskBoard tasks={tasks} members={members} project={project} onNew={onNewTask} />}
          {tab === "members" && <MembersTable members={members} project={project} />}
          {tab === "settings" && <SettingsPanel project={project} />}
        </div>
      </div>
    </>
  );
}

// ---------- Kanban board ----------
function TaskBoard({ tasks, members, project, onNew }) {
  const cols = [
    { key: "TODO", label: "To do", icon: "x", color: "var(--ink-5)" },
    { key: "IN_PROGRESS", label: "In progress", icon: "clock", color: "var(--accent-9)" },
    { key: "DONE", label: "Done", icon: "check", color: "var(--green-9)" },
  ];
  return (
    <div>
      {/* Filter row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div className="hstack" style={{ gap: 6, padding: "0 10px", height: 30, background: "var(--white)", border: "1px solid var(--ink-3)", borderRadius: 6 }}>
          <Icon name="search" size={13} style={{ color: "var(--ink-7)" }} />
          <input style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: 180 }} placeholder="Search tasks…" />
        </div>
        <button className="btn btn-secondary btn-sm"><Icon name="filter" size={13} /> Status</button>
        <button className="btn btn-secondary btn-sm"><Icon name="users" size={13} /> Assignee</button>
        <button className="btn btn-secondary btn-sm"><Icon name="flag" size={13} /> Priority</button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--ink-7)" }}>{tasks.length} tasks · drag to update</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, alignItems: "start" }}>
        {cols.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <section key={col.key} style={{
              background: "var(--ink-1)",
              border: "1px solid var(--ink-3)",
              borderRadius: 10,
              padding: 8,
              minHeight: 480,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px 10px" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: col.color }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-12)" }}>{col.label}</span>
                <span className="tnum" style={{ fontSize: 11.5, color: "var(--ink-7)", background: "var(--white)", border: "1px solid var(--ink-3)", padding: "1px 6px", borderRadius: 999 }}>{colTasks.length}</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
                  <button className="btn btn-ghost btn-sm" style={{ width: 24, height: 24, padding: 0, color: "var(--ink-7)" }} onClick={onNew}><Icon name="plus" size={14} stroke={2} /></button>
                  <button className="btn btn-ghost btn-sm" style={{ width: 24, height: 24, padding: 0, color: "var(--ink-7)" }}><Icon name="more" size={14} /></button>
                </div>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {colTasks.map(t => <TaskCard key={t.id} task={t} project={project} />)}
              </ul>
              <button onClick={onNew} style={{
                width: "100%", marginTop: 8, padding: "8px 10px", background: "transparent",
                border: "1px dashed var(--ink-4)", borderRadius: 6, color: "var(--ink-7)",
                fontSize: 12.5, display: "flex", alignItems: "center", gap: 6, justifyContent: "center", cursor: "pointer",
              }}>
                <Icon name="plus" size={13} stroke={2} /> Add task
              </button>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({ task, project }) {
  const assignee = window.E.user(task.assigneeId);
  const overdue = window.E.isOverdue(task.dueDate, task.status);
  return (
    <li style={{
      background: "var(--white)",
      border: "1px solid var(--ink-3)",
      borderRadius: 8,
      padding: "10px 12px",
      cursor: "grab",
      boxShadow: "var(--shadow-sm)",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ink-4)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--ink-3)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span className="tnum" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-7)" }}>{task.key}</span>
        <div style={{ flex: 1 }} />
        <PriorityChip priority={task.priority} />
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink-12)", letterSpacing: "-0.005em", lineHeight: 1.35, marginBottom: task.description ? 4 : 8 }}>
        {task.title}
      </div>
      {task.description && (
        <p style={{ margin: 0, fontSize: 12, color: "var(--ink-7)", lineHeight: 1.45,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 8 }}>
          {task.description}
        </p>
      )}
      {task.labels && task.labels.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {task.labels.map(l => (
            <span key={l} style={{
              fontSize: 10.5, color: "var(--ink-8)", background: "var(--ink-1)",
              border: "1px solid var(--ink-3)", padding: "1px 6px", borderRadius: 4, letterSpacing: "0",
            }}>{l}</span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 6, borderTop: "1px solid var(--ink-2)" }}>
        {task.dueDate && <DueChip iso={task.dueDate} status={task.status} />}
        <div style={{ flex: 1 }} />
        <div className="hstack" style={{ gap: 8, color: "var(--ink-7)", fontSize: 11 }}>
          <span className="hstack" style={{ gap: 3 }}><Icon name="message" size={11} /> 2</span>
          <span className="hstack" style={{ gap: 3 }}><Icon name="paperclip" size={11} /> 1</span>
        </div>
        {assignee ? <Avatar user={assignee} size="sm" /> : (
          <div style={{
            width: 20, height: 20, borderRadius: "50%", border: "1.5px dashed var(--ink-4)",
            display: "grid", placeItems: "center", color: "var(--ink-6)",
          }}><Icon name="plus" size={10} /></div>
        )}
      </div>
    </li>
  );
}

// ---------- Members ----------
function MembersTable({ members, project }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid var(--ink-3)", display: "flex", alignItems: "center", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--ink-12)" }}>Project members</h2>
        <span className="chip chip-neutral">{members.length}</span>
        <div style={{ flex: 1 }} />
        <div className="hstack" style={{ gap: 6, padding: "0 10px", height: 30, background: "var(--ink-1)", border: "1px solid var(--ink-3)", borderRadius: 6 }}>
          <Icon name="search" size={13} style={{ color: "var(--ink-7)" }} />
          <input style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: 180 }} placeholder="Search members…" />
        </div>
        <button className="btn btn-primary btn-sm"><Icon name="plus" size={13} stroke={2.2} /> Invite</button>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 200px 130px 130px 60px",
        gap: 16, padding: "10px 18px", borderBottom: "1px solid var(--ink-3)",
        fontSize: 11, color: "var(--ink-7)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
      }}>
        <span>Name</span><span>Email</span><span>Role</span><span>Joined</span><span></span>
      </div>
      {members.map((m, i) => (
        <div key={m.id} style={{
          display: "grid", gridTemplateColumns: "1fr 200px 130px 130px 60px",
          gap: 16, padding: "12px 18px", alignItems: "center",
          borderTop: i === 0 ? "none" : "1px solid var(--ink-2)",
        }}>
          <div className="hstack" style={{ gap: 10 }}>
            <Avatar user={m} size="md" />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink-12)" }}>{m.name}{m.id === "u1" && <span style={{ marginLeft: 6, fontSize: 11, color: "var(--ink-7)", fontWeight: 400 }}>(you)</span>}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-7)" }}>{m.email}</div>
          <RoleSelect role={i === 0 ? "ADMIN" : "MEMBER"} />
          <div style={{ fontSize: 12.5, color: "var(--ink-7)" }}>{m.joined}</div>
          <button className="tb-iconbtn"><Icon name="more" size={15} /></button>
        </div>
      ))}
    </div>
  );
}

function RoleSelect({ role }) {
  return (
    <span className={`chip ${role === "ADMIN" ? "chip-accent" : "chip-neutral"}`} style={{ cursor: "pointer" }}>
      {role === "ADMIN" ? <Icon name="shield" size={11} stroke={2} /> : <Icon name="users" size={11} stroke={2} />}
      {role === "ADMIN" ? "Admin" : "Member"}
      <Icon name="chevronDown" size={10} stroke={2} />
    </span>
  );
}

// ---------- Settings ----------
function SettingsPanel({ project }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, maxWidth: 720 }}>
      <div className="card">
        <div style={{ padding: "16px 20px 6px" }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--ink-12)" }}>General</h2>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--ink-7)" }}>Basic information about this project.</p>
        </div>
        <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="field">
            <label className="field-label">Project name</label>
            <input className="input" defaultValue={project.name} />
          </div>
          <div className="field">
            <label className="field-label">Description</label>
            <textarea className="textarea" defaultValue={project.description} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="field">
              <label className="field-label">Key</label>
              <input className="input" defaultValue={project.key} style={{ fontFamily: "var(--font-mono)" }} />
              <div className="field-hint">Used as task prefix, e.g. {project.key}-101</div>
            </div>
            <div className="field">
              <label className="field-label">Color</label>
              <div className="hstack" style={{ gap: 6, height: 36, padding: "0 10px", background: "var(--white)", border: "1px solid var(--ink-3)", borderRadius: 6, boxShadow: "var(--shadow-sm)" }}>
                {["#3F52C9", "#5E3AAE", "#1F6E7A", "#1F7A4D", "#95590C", "#B0352B", "#9B2B6E"].map(c => (
                  <button key={c} style={{
                    width: 20, height: 20, borderRadius: 4, background: c,
                    border: c === project.color ? "2px solid var(--ink-12)" : "2px solid transparent",
                    boxShadow: c === project.color ? "0 0 0 2px var(--white) inset" : "none",
                    padding: 0,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--ink-2)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="btn btn-ghost btn-sm">Cancel</button>
          <button className="btn btn-primary btn-sm">Save changes</button>
        </div>
      </div>

      <div className="card" style={{ borderColor: "var(--red-3)", background: "#FFFCFB" }}>
        <div style={{ padding: "16px 20px 6px" }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--red-9)" }}>Danger zone</h2>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--ink-7)" }}>Irreversible actions. Proceed with care.</p>
        </div>
        <div style={{ padding: "12px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-12)" }}>Delete this project</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-7)" }}>All tasks, members, and history will be permanently removed.</div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ borderColor: "var(--red-3)", color: "var(--red-9)" }}>
            <Icon name="trash" size={13} /> Delete project
          </button>
        </div>
      </div>
    </div>
  );
}

window.ProjectDetailPage = ProjectDetailPage;
