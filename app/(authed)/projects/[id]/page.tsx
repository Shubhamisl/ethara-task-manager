import Link from "next/link";
import MemberTable from "@/components/member-table";
import ProjectSettings from "@/components/project-settings";
import TaskBoard from "@/components/task-board";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { projectColor, projectKey } from "@/lib/project-style";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
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

export default async function ProjectDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab = "tasks" } = await searchParams;
  const session = await auth();
  const userId = session!.user!.id!;

  const me = await prisma.membership.findUnique({
    where: { userId_projectId: { userId, projectId: id } },
  });
  if (!me) redirect("/projects");

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      memberships: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
      tasks: {
        include: { assignee: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!project) redirect("/projects");

  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter((t) => t.status === "DONE").length;
  const progress = totalTasks > 0 ? doneTasks / totalTasks : 0;

  const visibleTabs = [
    { key: "tasks", label: "Tasks", count: totalTasks },
    { key: "members", label: "Members", count: project.memberships.length },
    ...(me.role === "ADMIN" ? [{ key: "settings", label: "Settings", count: null }] : []),
  ];
  const activeTab = visibleTabs.some((item) => item.key === tab) ? tab : "tasks";

  const color = projectColor(project.id);
  const key = projectKey(project.name);

  return (
    <div
      className="page-scroll"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "28px 32px 40px",
        background: "var(--ink-0)",
      }}
    >
      <div className="page-container" style={{ maxWidth: 1240, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div
          className="project-crumb"
          style={{
            fontSize: 13,
            color: "var(--ink-7)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 20,
          }}
        >
          <Link
            href="/projects"
            className="link-muted"
            style={{
              textDecoration: "none",
            }}
          >
            Projects
          </Link>
          <svg width="12" height="12" viewBox="0 0 15 15" fill="none" style={{ color: "var(--ink-5)" }}>
            <path d="M5 3L10 7.5L5 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: "var(--ink-12)", fontWeight: 500 }}>{project.name}</span>
        </div>

        {/* Project header */}
        <div
          className="project-header"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: color,
              color: "white",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.02em",
              flexShrink: 0,
            }}
          >
            {key}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="project-title-row"
              style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}
            >
              <h1 className="page-title" style={{ fontSize: 22 }}>
                {project.name}
              </h1>
              <span className="chip chip-neutral">{me.role.charAt(0) + me.role.slice(1).toLowerCase()}</span>
            </div>
            {project.description && (
              <p style={{ color: "var(--ink-7)", marginTop: 4, fontSize: 13.5, maxWidth: "60ch" }}>
                {project.description}
              </p>
            )}
            <div
              className="project-meta-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: 12,
                fontSize: 12.5,
                color: "var(--ink-7)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M2 13C2 10.2386 4.46243 8 7.5 8C10.5376 8 13 10.2386 13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                {project.memberships.length} members
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
                  <path d="M2.5 7.5L5.5 10.5L12.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {totalTasks} tasks
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
                  <path d="M2 7.5C2 4.46243 4.46243 2 7.5 2C10.5376 2 13 4.46243 13 7.5C13 10.5376 10.5376 13 7.5 13C4.46243 13 2 10.5376 2 7.5Z" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M7.5 5V7.5L9.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {Math.round(progress * 100)}% complete
              </span>
            </div>
          </div>

          {/* Avatar stack */}
          <div className="project-avatar-stack" style={{ display: "inline-flex", alignItems: "center" }}>
            {project.memberships.slice(0, 5).map((m, idx) => (
              <div
                key={m.user.id}
                className={`avatar avatar-lg ${avatarColor(m.user.name)}`}
                style={{ marginLeft: idx > 0 ? -8 : 0 }}
                title={m.user.name}
              >
                {getInitials(m.user.name)}
              </div>
            ))}
            {project.memberships.length > 5 && (
              <div
                className="avatar avatar-lg"
                style={{ marginLeft: -8 }}
                title={`+${project.memberships.length - 5} more`}
              >
                +{project.memberships.length - 5}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {visibleTabs.map((item) => (
            <Link
              key={item.key}
              href={`?tab=${item.key}`}
              className={`tab ${activeTab === item.key ? "active" : ""}`}
            >
              {item.label}
              {item.count !== null && (
                <span className="tab-count">{item.count}</span>
              )}
            </Link>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "tasks" && (
          <TaskBoard
            projectId={project.id}
            role={me.role}
            currentUserId={userId}
            initialTasks={project.tasks.map((task) => ({
              ...task,
              dueDate: task.dueDate?.toISOString() ?? null,
            }))}
            members={project.memberships.map((m) => m.user)}
          />
        )}

        {activeTab === "members" && (
          <MemberTable
            projectId={project.id}
            role={me.role}
            members={project.memberships}
          />
        )}

        {activeTab === "settings" && me.role === "ADMIN" && (
          <ProjectSettings
            projectId={project.id}
            initial={{ name: project.name, description: project.description }}
          />
        )}
      </div>
    </div>
  );
}
