import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { projectColor } from "@/lib/project-style";

export const dynamic = "force-dynamic";

function getDayGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

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

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const userName = session!.user!.name ?? "there";
  const now = new Date();

  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + (7 - now.getDay()));

  const [byStatus, overdue, projects, myTasks] = await Promise.all([
    prisma.task.groupBy({
      by: ["status"],
      where: { assigneeId: userId },
      _count: { _all: true },
    }),
    prisma.task.count({
      where: {
        assigneeId: userId,
        dueDate: { lt: now },
        status: { not: "DONE" },
      },
    }),
    prisma.project.findMany({
      where: { memberships: { some: { userId } } },
      include: {
        _count: { select: { tasks: true, memberships: true } },
        tasks: {
          where: { status: "DONE" },
          select: { id: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.task.findMany({
      where: { assigneeId: userId, status: { not: "DONE" } },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 6,
    }),
  ]);

  const counts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  for (const row of byStatus) {
    if (row.status in counts) counts[row.status as keyof typeof counts] = row._count._all;
  }

  const PRIORITY_CHIP: Record<string, string> = {
    HIGH: "chip chip-high",
    MEDIUM: "chip chip-medium",
    LOW: "chip chip-low",
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "28px 32px 40px",
        background: "var(--ink-0)",
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div>
            <div className="page-eyebrow">{formatDate()}</div>
            <h1 className="page-title">
              {getDayGreeting()}, {userName.split(" ")[0]}
            </h1>
            <p
              style={{
                color: "var(--ink-7)",
                marginTop: 6,
                fontSize: 13.5,
              }}
            >
              You have{" "}
              <strong style={{ color: "var(--ink-12)" }}>
                {counts.TODO + counts.IN_PROGRESS} open tasks
              </strong>
              {overdue > 0 && (
                <>
                  {" "}and{" "}
                  <strong style={{ color: "var(--red-9)" }}>
                    {overdue} overdue
                  </strong>
                </>
              )}
              .
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href="/projects"
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: "none" }}
            >
              View projects
            </Link>
          </div>
        </div>

        {/* Metric cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 28,
          }}
        >
          <MetricCard
            label="Open"
            value={counts.TODO + counts.IN_PROGRESS}
            sub="tasks assigned to you"
          />
          <MetricCard
            label="In Progress"
            value={counts.IN_PROGRESS}
            sub={`${Math.round((counts.IN_PROGRESS / (counts.TODO + counts.IN_PROGRESS || 1)) * 100)}% of open`}
          />
          <MetricCard
            label="Overdue"
            value={overdue}
            sub="needs attention"
            warn={overdue > 0}
          />
          <MetricCard
            label="Completed"
            value={counts.DONE}
            sub="total completed"
          />
        </div>

        {/* Two-column grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* My tasks card */}
          <section className="card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 16px 10px",
                borderBottom: "1px solid var(--ink-3)",
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
                My tasks this week
              </h2>
              <span className="chip chip-neutral" style={{ marginLeft: 10 }}>
                {myTasks.length}
              </span>
            </div>

            {myTasks.length === 0 ? (
              <div
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "var(--ink-7)",
                  fontSize: 13,
                }}
              >
                No open tasks assigned to you.
              </div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {myTasks.map((task, i) => {
                  const isOverdue =
                    task.dueDate && new Date(task.dueDate) < now && task.status !== "DONE";
                  return (
                    <li
                      key={task.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto auto auto",
                        gap: 12,
                        alignItems: "center",
                        padding: "10px 16px",
                        borderBottom:
                          i === myTasks.length - 1 ? "none" : "1px solid var(--ink-2)",
                        cursor: "pointer",
                        transition: "background 80ms",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--ink-1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13.5,
                            fontWeight: 500,
                            color: "var(--ink-12)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {task.title}
                        </div>
                        {task.project && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--ink-7)",
                              marginTop: 2,
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <span
                              className="sb-project-dot"
                              style={{
                                background: projectColor(task.project.id),
                              }}
                            />
                            {task.project.name}
                          </div>
                        )}
                      </div>
                      <span className={PRIORITY_CHIP[task.priority] ?? "chip chip-neutral"}>
                        {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                      </span>
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
                      {task.assignee && (
                        <div
                          className={`avatar avatar-sm ${avatarColor(task.assignee.name)}`}
                          title={task.assignee.name}
                        >
                          {getInitials(task.assignee.name)}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Right column — Projects */}
          <section className="card">
            <div
              style={{
                padding: "14px 16px 10px",
                borderBottom: "1px solid var(--ink-3)",
                display: "flex",
                alignItems: "center",
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
                Projects
              </h2>
              <Link
                href="/projects"
                className="btn btn-ghost btn-sm"
                style={{
                  marginLeft: "auto",
                  color: "var(--ink-7)",
                  textDecoration: "none",
                }}
              >
                View all
                <svg width="12" height="12" viewBox="0 0 15 15" fill="none">
                  <path
                    d="M3 7.5H12M8.5 3.5L12.5 7.5L8.5 11.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            {projects.length === 0 ? (
              <div
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "var(--ink-7)",
                  fontSize: 13,
                }}
              >
                No projects yet.{" "}
                <Link href="/projects" style={{ color: "var(--accent-9)" }}>
                  Create one
                </Link>
              </div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {projects.map((project, i) => {
                  const total = project._count.tasks;
                  const done = project.tasks.length;
                  const progress = total > 0 ? done / total : 0;
                  return (
                    <li
                      key={project.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 16px",
                        borderTop: i === 0 ? "none" : "1px solid var(--ink-2)",
                        cursor: "pointer",
                        transition: "background 80ms",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--ink-1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <span
                        className="sb-project-dot"
                        style={{ background: projectColor(project.id) }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "var(--ink-12)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {project.name}
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: 4,
                            background: "var(--ink-2)",
                            borderRadius: 999,
                            marginTop: 6,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${progress * 100}%`,
                              height: "100%",
                              background: projectColor(project.id),
                              borderRadius: 999,
                              transition: "width 300ms ease",
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className="tnum"
                        style={{
                          fontSize: 11.5,
                          color: "var(--ink-7)",
                          minWidth: 30,
                          textAlign: "right",
                        }}
                      >
                        {Math.round(progress * 100)}%
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  warn = false,
}: {
  label: string;
  value: number;
  sub: string;
  warn?: boolean;
}) {
  return (
    <div className="card" style={{ padding: "16px 18px" }}>
      <div style={{ fontSize: 12, color: "var(--ink-7)", fontWeight: 500, marginBottom: 8 }}>
        {label}
      </div>
      <div
        className="tnum"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color: warn ? "var(--red-9)" : "var(--ink-12)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--ink-7)", marginTop: 6 }}>{sub}</div>
    </div>
  );
}
