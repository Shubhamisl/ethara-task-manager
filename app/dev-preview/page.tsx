"use client";

import { useMemo, useState } from "react";
import { projectColor, projectKey } from "@/lib/project-style";

type View = "dashboard" | "projects" | "project" | "auth";
type Status = "TODO" | "IN_PROGRESS" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH";

const user = {
  name: "Avery Stone",
  email: "avery@ethara.local",
};

const members = [
  { id: "u1", name: "Avery Stone", email: "avery@ethara.local", role: "Admin" },
  { id: "u2", name: "Mina Kapoor", email: "mina@ethara.local", role: "Member" },
  { id: "u3", name: "Theo Grant", email: "theo@ethara.local", role: "Member" },
  { id: "u4", name: "Nora Reed", email: "nora@ethara.local", role: "Member" },
];

const projects = [
  {
    id: "prj-brand",
    name: "Brand Refresh",
    description: "Premium redesign, navigation polish, and customer-facing copy pass.",
    members: 4,
    tasks: 18,
    done: 11,
  },
  {
    id: "prj-mobile",
    name: "Mobile Beta",
    description: "Ship the private beta checklist for iOS and Android users.",
    members: 3,
    tasks: 14,
    done: 6,
  },
  {
    id: "prj-growth",
    name: "Growth Ops",
    description: "Activation experiments, onboarding instrumentation, and weekly review.",
    members: 5,
    tasks: 22,
    done: 15,
  },
];

const tasks = [
  {
    id: "ETH-241",
    title: "Finalize sidebar keyboard states",
    description: "Confirm hover, focus, and active states match the design bundle.",
    status: "TODO" as Status,
    priority: "HIGH" as Priority,
    due: "May 6",
    assigneeId: "u1",
    projectId: "prj-brand",
  },
  {
    id: "ETH-238",
    title: "Review project detail empty states",
    description: "Make sure the first-run experience feels calm and useful.",
    status: "TODO" as Status,
    priority: "MEDIUM" as Priority,
    due: "May 8",
    assigneeId: "u2",
    projectId: "prj-brand",
  },
  {
    id: "ETH-226",
    title: "Wire command menu visual shell",
    description: "Local mock only. Keyboard handling comes in a later pass.",
    status: "IN_PROGRESS" as Status,
    priority: "MEDIUM" as Priority,
    due: "May 9",
    assigneeId: "u3",
    projectId: "prj-mobile",
  },
  {
    id: "ETH-219",
    title: "QA invite dialog spacing",
    description: "Check dense layouts at tablet and desktop widths.",
    status: "IN_PROGRESS" as Status,
    priority: "LOW" as Priority,
    due: "May 10",
    assigneeId: "u4",
    projectId: "prj-growth",
  },
  {
    id: "ETH-203",
    title: "Publish design token notes",
    description: "Document color, radius, shadow, and typography usage.",
    status: "DONE" as Status,
    priority: "LOW" as Priority,
    due: "May 2",
    assigneeId: "u1",
    projectId: "prj-brand",
  },
  {
    id: "ETH-197",
    title: "Normalize project progress cards",
    description: "Use deterministic colors and tabular numeric progress.",
    status: "DONE" as Status,
    priority: "HIGH" as Priority,
    due: "May 1",
    assigneeId: "u2",
    projectId: "prj-growth",
  },
];

const columns: Array<{ status: Status; label: string; color: string }> = [
  { status: "TODO", label: "To do", color: "var(--ink-5)" },
  { status: "IN_PROGRESS", label: "In progress", color: "var(--accent-9)" },
  { status: "DONE", label: "Done", color: "var(--green-9)" },
];

const viewLabels: Record<View, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  project: "Project detail",
  auth: "Auth screens",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function avatarClass(id: string) {
  const variants = ["avatar-c1", "avatar-c2", "avatar-c3", "avatar-c4", "avatar-c5", "avatar-c6"];
  return variants[Math.abs(id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % variants.length];
}

function priorityClass(priority: Priority) {
  if (priority === "HIGH") return "chip chip-high";
  if (priority === "MEDIUM") return "chip chip-medium";
  return "chip chip-low";
}

export default function DevPreviewPage() {
  const [view, setView] = useState<View>("dashboard");
  const selectedProject = projects[0];
  const openTasks = tasks.filter((task) => task.status !== "DONE").length;
  const doneTasks = tasks.filter((task) => task.status === "DONE").length;
  const progress = Math.round((selectedProject.done / selectedProject.tasks) * 100);

  const scopedTasks = useMemo(
    () => tasks.filter((task) => task.projectId === selectedProject.id || view !== "project"),
    [selectedProject.id, view],
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "248px 1fr",
        minHeight: "100vh",
        background: "var(--ink-0)",
      }}
    >
      <aside
        style={{
          background: "var(--white)",
          borderRight: "1px solid var(--ink-3)",
          height: "100vh",
          position: "sticky",
          top: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ height: 52, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--ink-3)" }}>
          <div className="sb-brand-mark">E</div>
          <span className="sb-brand-name">Ethara</span>
        </div>

        <div style={{ margin: "12px 12px 4px", position: "relative" }}>
          <span style={{ position: "absolute", left: 9, top: 8, color: "var(--ink-7)" }}>
            <SearchIcon />
          </span>
          <input className="input" style={{ height: 32, paddingLeft: 30, paddingRight: 54, background: "var(--ink-1)", boxShadow: "none", borderColor: "transparent" }} placeholder="Search..." />
          <span className="kbd" style={{ position: "absolute", right: 8, top: 5 }}>Ctrl K</span>
        </div>

        <nav style={{ padding: 8, flex: 1, overflowY: "auto" }}>
          {(Object.keys(viewLabels) as View[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 8px",
                border: 0,
                borderRadius: 6,
                background: view === item ? "var(--ink-2)" : "transparent",
                color: view === item ? "var(--ink-12)" : "var(--ink-9)",
                fontSize: 13.5,
                fontWeight: view === item ? 500 : 450,
                textAlign: "left",
                marginBottom: 2,
              }}
            >
              <span style={{ color: "var(--ink-7)", display: "flex" }}>
                {item === "dashboard" ? <GridIcon /> : item === "projects" ? <FolderIcon /> : item === "project" ? <CheckIcon /> : <PanelIcon />}
              </span>
              {viewLabels[item]}
            </button>
          ))}

          <div className="page-eyebrow" style={{ padding: "18px 8px 6px", marginBottom: 0 }}>Projects</div>
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => setView("project")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 8px",
                border: 0,
                borderRadius: 6,
                background: view === "project" && project.id === selectedProject.id ? "var(--ink-2)" : "transparent",
                color: "var(--ink-9)",
                fontSize: 13.5,
                textAlign: "left",
              }}
            >
              <span className="sb-project-dot" style={{ background: projectColor(project.id) }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.name}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: 8, borderTop: "1px solid var(--ink-3)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 8px" }}>
            <div className={`avatar avatar-lg ${avatarClass(user.email)}`}>{initials(user.name)}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-11)" }}>{user.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-7)", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
            </div>
          </div>
        </div>
      </aside>

      <main style={{ minWidth: 0 }}>
        <div style={{ height: 52, borderBottom: "1px solid var(--ink-3)", background: "rgba(255,255,255,0.86)", display: "flex", alignItems: "center", padding: "0 24px", position: "sticky", top: 0, zIndex: 4, backdropFilter: "blur(8px)" }}>
          <div style={{ fontSize: 13, color: "var(--ink-7)" }}>Local preview</div>
          <span style={{ color: "var(--ink-5)", margin: "0 8px" }}>/</span>
          <div style={{ fontSize: 13, color: "var(--ink-12)", fontWeight: 500 }}>{viewLabels[view]}</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm">Share</button>
            <button className="btn btn-primary btn-sm">New task</button>
          </div>
        </div>

        <div style={{ padding: "28px 32px 44px", maxWidth: 1240, margin: "0 auto" }}>
          {view === "dashboard" && <DashboardPreview openTasks={openTasks} doneTasks={doneTasks} />}
          {view === "projects" && <ProjectsPreview />}
          {view === "project" && <ProjectPreview project={selectedProject} tasks={scopedTasks} progress={progress} />}
          {view === "auth" && <AuthPreview />}
        </div>
      </main>
    </div>
  );
}

function DashboardPreview({ openTasks, doneTasks }: { openTasks: number; doneTasks: number }) {
  return (
    <>
      <PageHeader eyebrow="Monday, May 4" title="Good morning, Avery" subtitle={`${openTasks} open tasks across your highest-priority projects.`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <Metric label="Open" value={openTasks} sub="assigned and pending" />
        <Metric label="In progress" value={2} sub="moving this week" />
        <Metric label="Overdue" value={1} sub="needs attention" warn />
        <Metric label="Completed" value={doneTasks} sub="closed recently" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 20, alignItems: "start" }}>
        <section className="card">
          <CardHeader title="My tasks this week" count={tasks.length} />
          {tasks.slice(0, 5).map((task, index) => (
            <TaskRow key={task.id} task={task} border={index < 4} />
          ))}
        </section>
        <section className="card">
          <CardHeader title="Projects" count={projects.length} />
          {projects.map((project) => (
            <ProjectProgress key={project.id} project={project} />
          ))}
        </section>
      </div>
    </>
  );
}

function ProjectsPreview() {
  return (
    <>
      <PageHeader eyebrow="Workspace" title="Projects" subtitle="Three active projects across your team." action={<button className="btn btn-primary">New project</button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {projects.map((project) => {
          const color = projectColor(project.id);
          const percent = Math.round((project.done / project.tasks) * 100);
          return (
            <section key={project.id} className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "16px 18px 14px" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: color, color: "white", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600 }}>{projectKey(project.name)}</div>
                  <div>
                    <div style={{ color: "var(--ink-12)", fontWeight: 600 }}>{project.name}</div>
                    <div style={{ color: "var(--ink-7)", fontSize: 11.5 }}>Admin</div>
                  </div>
                </div>
                <p style={{ margin: 0, minHeight: 38, color: "var(--ink-7)", fontSize: 12.5, lineHeight: 1.5 }}>{project.description}</p>
              </div>
              <div style={{ padding: "0 18px 14px" }}>
                <Progress value={percent} color={color} />
              </div>
              <div style={{ padding: "10px 18px", borderTop: "1px solid var(--ink-2)", color: "var(--ink-7)", fontSize: 11.5, display: "flex", gap: 14 }}>
                <span className="tnum">{project.tasks - project.done} open</span>
                <span className="tnum">{project.members} members</span>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function ProjectPreview({ project, tasks: scoped, progress }: { project: (typeof projects)[number]; tasks: typeof tasks; progress: number }) {
  const color = projectColor(project.id);
  return (
    <>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: color, color: "white", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{projectKey(project.name)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 className="page-title" style={{ fontSize: 22 }}>{project.name}</h1>
            <span className="chip chip-neutral">Admin</span>
          </div>
          <p className="page-subtitle">{project.description}</p>
          <div style={{ display: "flex", gap: 16, marginTop: 12, color: "var(--ink-7)", fontSize: 12.5 }}>
            <span>{project.members} members</span>
            <span>{project.tasks} tasks</span>
            <span>{progress}% complete</span>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          {members.slice(0, 4).map((member, index) => (
            <div key={member.id} className={`avatar avatar-lg ${avatarClass(member.id)}`} style={{ marginLeft: index ? -8 : 0 }} title={member.name}>{initials(member.name)}</div>
          ))}
        </div>
      </div>
      <div className="tabs">
        <button className="tab active">Tasks <span className="tab-count">{scoped.length}</span></button>
        <button className="tab">Members <span className="tab-count">{members.length}</span></button>
        <button className="tab">Settings</button>
      </div>
      <BoardPreview tasks={scoped} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 0.9fr", gap: 20, marginTop: 24 }}>
        <MembersPreview />
        <SettingsPreview />
      </div>
    </>
  );
}

function BoardPreview({ tasks: boardTasks }: { tasks: typeof tasks }) {
  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div className="input" style={{ width: 220, height: 32, display: "flex", alignItems: "center", boxShadow: "var(--shadow-sm)", color: "var(--ink-7)" }}>Search tasks...</div>
        <button className="btn btn-secondary btn-sm">Status</button>
        <button className="btn btn-secondary btn-sm">Assignee</button>
        <button className="btn btn-secondary btn-sm">Priority</button>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary btn-sm">Add task</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {columns.map((column) => {
          const columnTasks = boardTasks.filter((task) => task.status === column.status);
          return (
            <section key={column.status} style={{ background: "var(--ink-1)", border: "1px solid var(--ink-3)", borderRadius: 10, padding: 8, minHeight: 360 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px 10px" }}>
                <span className="sb-project-dot" style={{ background: column.color }} />
                <strong style={{ fontSize: 12.5, color: "var(--ink-12)" }}>{column.label}</strong>
                <span className="chip chip-neutral tnum">{columnTasks.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {columnTasks.map((task) => <TaskCard key={task.id} task={task} />)}
              </div>
              <button style={{ width: "100%", marginTop: 8, padding: "8px 10px", border: "1px dashed var(--ink-4)", borderRadius: 6, background: "transparent", color: "var(--ink-7)", fontSize: 12.5 }}>Add task</button>
            </section>
          );
        })}
      </div>
    </>
  );
}

function AuthPreview() {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="auth-shell" style={{ minHeight: 620 }}>
        <div className="auth-form-side">
          <div className="auth-brand"><div className="sb-brand-mark">E</div><span className="sb-brand-name">Ethara</span></div>
          <div className="auth-form-wrap">
            <div className="auth-form">
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-sub">Log in to continue to your workspace.</p>
              <div style={{ height: 28 }} />
              <div className="vstack" style={{ gap: 14 }}>
                <label className="field"><span className="field-label">Work email</span><input className="input" value="avery@ethara.local" readOnly /></label>
                <label className="field"><span className="field-label">Password</span><input className="input" value="password" type="password" readOnly /></label>
                <button className="btn btn-primary btn-lg" style={{ width: "100%" }}>Log in</button>
              </div>
              <p className="auth-foot" style={{ marginTop: 20 }}>No account? <span style={{ color: "var(--ink-12)", fontWeight: 500 }}>Create one</span></p>
            </div>
          </div>
        </div>
        <div className="auth-art-side">
          <div className="auth-art-grid" />
          <div style={{ position: "relative", zIndex: 1, color: "rgba(255,255,255,.55)", fontSize: 12 }}>All systems operational</div>
          <div>
            <div className="auth-quote">"Ethara is the calmest task manager we have used. It gets out of the way and lets the team ship."</div>
            <div className="auth-quote-author">Jordan Pierce - Head of Engineering</div>
          </div>
          <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 32, color: "rgba(255,255,255,.45)", fontSize: 12 }}>
            <Stat label="teams" value="4,200+" dark />
            <Stat label="SOC 2" value="Type II" dark />
            <Stat label="uptime" value="99.99%" dark />
          </div>
        </div>
      </div>
    </div>
  );
}

function MembersPreview() {
  return (
    <section className="card">
      <CardHeader title="Project members" count={members.length} action={<button className="btn btn-primary btn-sm">Invite</button>} />
      {members.map((member, index) => (
        <div key={member.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr .7fr auto", gap: 12, alignItems: "center", padding: "10px 16px", borderTop: index ? "1px solid var(--ink-2)" : 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}><div className={`avatar ${avatarClass(member.id)}`}>{initials(member.name)}</div><strong style={{ color: "var(--ink-12)", fontSize: 13 }}>{member.name}</strong></div>
          <span style={{ color: "var(--ink-7)", fontSize: 12.5 }}>{member.email}</span>
          <span className="chip chip-neutral">{member.role}</span>
          <button className="btn btn-ghost btn-sm">Edit</button>
        </div>
      ))}
    </section>
  );
}

function SettingsPreview() {
  return (
    <section className="card" style={{ padding: 18 }}>
      <h2 style={{ margin: 0, color: "var(--ink-12)", fontSize: 14 }}>General</h2>
      <div className="vstack" style={{ gap: 12, marginTop: 14 }}>
        <label className="field"><span className="field-label">Name</span><input className="input" value="Brand Refresh" readOnly /></label>
        <label className="field"><span className="field-label">Description</span><textarea className="textarea" value="Premium redesign and interface polish." readOnly /></label>
        <div style={{ border: "1px solid var(--red-3)", background: "var(--red-2)", borderRadius: 8, padding: 12 }}>
          <div style={{ color: "var(--red-9)", fontWeight: 600, fontSize: 13 }}>Danger zone</div>
          <p style={{ color: "var(--ink-8)", fontSize: 12.5, margin: "4px 0 10px" }}>This preview shows the destructive action treatment.</p>
          <button className="btn btn-secondary btn-sm" style={{ color: "var(--red-9)" }}>Delete project</button>
        </div>
      </div>
    </section>
  );
}

function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
      <div>
        <div className="page-eyebrow">{eyebrow}</div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Metric({ label, value, sub, warn }: { label: string; value: number; sub: string; warn?: boolean }) {
  return (
    <div className="card" style={{ padding: "16px 18px" }}>
      <div style={{ fontSize: 12, color: "var(--ink-7)", fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div className="tnum" style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, letterSpacing: "-0.03em", color: warn ? "var(--red-9)" : "var(--ink-12)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-7)", marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function CardHeader({ title, count, action }: { title: string; count?: number; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 16px 10px", borderBottom: "1px solid var(--ink-3)" }}>
      <h2 style={{ margin: 0, color: "var(--ink-12)", fontSize: 14, fontWeight: 600 }}>{title}</h2>
      {typeof count === "number" && <span className="chip chip-neutral" style={{ marginLeft: 10 }}>{count}</span>}
      <div style={{ marginLeft: "auto" }}>{action}</div>
    </div>
  );
}

function TaskRow({ task, border }: { task: (typeof tasks)[number]; border: boolean }) {
  const member = members.find((item) => item.id === task.assigneeId);
  const project = projects.find((item) => item.id === task.projectId);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 12, alignItems: "center", padding: "10px 16px", borderBottom: border ? "1px solid var(--ink-2)" : 0 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: "var(--ink-12)", fontWeight: 500, fontSize: 13.5 }}>{task.title}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--ink-7)", fontSize: 12, marginTop: 2 }}><span className="sb-project-dot" style={{ background: projectColor(task.projectId) }} />{project?.name}</div>
      </div>
      <span className={priorityClass(task.priority)}>{task.priority.toLowerCase()}</span>
      <span className="chip chip-neutral">{task.due}</span>
      {member && <div className={`avatar avatar-sm ${avatarClass(member.id)}`}>{initials(member.name)}</div>}
    </div>
  );
}

function TaskCard({ task }: { task: (typeof tasks)[number] }) {
  const member = members.find((item) => item.id === task.assigneeId);
  return (
    <article className="card" style={{ padding: "10px 12px", borderRadius: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
        <span className="tnum" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-7)", fontSize: 11 }}>{task.id}</span>
        <div style={{ flex: 1 }} />
        <span className={priorityClass(task.priority)}>{task.priority.toLowerCase()}</span>
      </div>
      <div style={{ color: "var(--ink-12)", fontSize: 13.5, fontWeight: 500, lineHeight: 1.35 }}>{task.title}</div>
      <p style={{ margin: "4px 0 8px", color: "var(--ink-7)", fontSize: 12, lineHeight: 1.45 }}>{task.description}</p>
      <div style={{ display: "flex", alignItems: "center", borderTop: "1px solid var(--ink-2)", paddingTop: 6 }}>
        <span className="chip chip-neutral">{task.due}</span>
        <div style={{ flex: 1 }} />
        {member && <div className={`avatar avatar-sm ${avatarClass(member.id)}`}>{initials(member.name)}</div>}
      </div>
    </article>
  );
}

function ProjectProgress({ project }: { project: (typeof projects)[number] }) {
  const color = projectColor(project.id);
  const percent = Math.round((project.done / project.tasks) * 100);
  return (
    <div style={{ padding: "11px 16px", borderTop: "1px solid var(--ink-2)", display: "flex", alignItems: "center", gap: 10 }}>
      <span className="sb-project-dot" style={{ background: color }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "var(--ink-12)", fontSize: 13, fontWeight: 500 }}>{project.name}</div>
        <Progress value={percent} color={color} />
      </div>
      <span className="tnum" style={{ color: "var(--ink-7)", fontSize: 11.5 }}>{percent}%</span>
    </div>
  );
}

function Progress({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ marginTop: 7 }}>
      <div style={{ height: 5, background: "var(--ink-2)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function Stat({ label, value, dark }: { label: string; value: string; dark?: boolean }) {
  return (
    <div>
      <div style={{ color: dark ? "white" : "var(--ink-12)", fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.025em" }}>{value}</div>
      {label}
    </div>
  );
}

function SearchIcon() {
  return <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" /><path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}

function GridIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="8.5" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="1" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

function FolderIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="4" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5 4V3C5 2.44772 5.44772 2 6 2H9C9.55228 2 10 2.44772 10 3V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}

function CheckIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5L5.5 10.5L12.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function PanelIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M2 5.5H13" stroke="currentColor" strokeWidth="1.4" /></svg>;
}
