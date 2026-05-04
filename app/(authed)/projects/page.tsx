import Link from "next/link";
import NewProjectDialog from "@/components/new-project-dialog";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { projectColor, projectKey } from "@/lib/project-style";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const projects = await prisma.project.findMany({
    where: { memberships: { some: { userId } } },
    include: {
      _count: { select: { tasks: true, memberships: true } },
      memberships: { where: { userId }, select: { role: true } },
      tasks: { where: { status: "DONE" }, select: { id: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

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
        {/* Header */}
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
            <div className="page-eyebrow">Workspace</div>
            <h1 className="page-title">Projects</h1>
            <p style={{ color: "var(--ink-7)", marginTop: 6, fontSize: 13.5 }}>
              {projects.length} active project{projects.length !== 1 ? "s" : ""} across your team.
            </p>
          </div>
          <NewProjectDialog />
        </div>

        {/* Grid */}
        {projects.length === 0 ? (
          <div
            style={{
              border: "1px dashed var(--ink-3)",
              borderRadius: 10,
              padding: 40,
              textAlign: "center",
              color: "var(--ink-7)",
              fontSize: 13.5,
            }}
          >
            No projects yet. Create one to invite teammates and track tasks.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {projects.map((project) => {
              const total = project._count.tasks;
              const done = project.tasks.length;
              const progress = total > 0 ? done / total : 0;
              const role = project.memberships[0]?.role ?? "MEMBER";
              const color = projectColor(project.id);

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="card hover-card"
                  style={{
                    textAlign: "left",
                    padding: 0,
                    cursor: "pointer",
                    display: "block",
                    textDecoration: "none",
                  }}
                >
                  <div style={{ padding: "16px 18px 14px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: color,
                          color: "white",
                          display: "grid",
                          placeItems: "center",
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.02em",
                          flexShrink: 0,
                        }}
                      >
                        {projectKey(project.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14.5,
                            fontWeight: 600,
                            color: "var(--ink-12)",
                            letterSpacing: "-0.01em",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {project.name}
                        </div>
                        <div
                          style={{ fontSize: 11.5, color: "var(--ink-7)", marginTop: 1 }}
                        >
                          {role.charAt(0) + role.slice(1).toLowerCase()}
                        </div>
                      </div>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: 12.5,
                        color: "var(--ink-7)",
                        lineHeight: 1.5,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: 36,
                      }}
                    >
                      {project.description || "No description"}
                    </p>
                  </div>

                  <div style={{ padding: "0 18px 14px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 11.5,
                        color: "var(--ink-7)",
                        marginBottom: 6,
                      }}
                    >
                      <span>Progress</span>
                      <span
                        className="tnum"
                        style={{ color: "var(--ink-11)", fontWeight: 500 }}
                      >
                        {Math.round(progress * 100)}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 5,
                        background: "var(--ink-2)",
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${progress * 100}%`,
                          height: "100%",
                          background: color,
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "10px 18px",
                      borderTop: "1px solid var(--ink-2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      fontSize: 11.5,
                      color: "var(--ink-7)",
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <svg width="12" height="12" viewBox="0 0 15 15" fill="none">
                        <path
                          d="M2.5 7.5L5.5 10.5L12.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="tnum">{total - done}</span> open
                    </span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <svg width="12" height="12" viewBox="0 0 15 15" fill="none">
                        <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.4" />
                        <path
                          d="M5 7.5L7 9.5L10 5.5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="tnum">{project._count.memberships}</span> members
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
