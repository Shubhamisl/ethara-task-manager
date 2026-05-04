import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const now = new Date();

  const [byStatus, overdue, projects] = await Promise.all([
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
        _count: { select: { tasks: true } },
        memberships: { where: { userId }, select: { role: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
  ]);

  const counts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  for (const row of byStatus) counts[row.status] = row._count._all;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
        </div>
        <Link
          href="/projects"
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          View projects
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Open tasks"
          value={counts.TODO + counts.IN_PROGRESS}
        />
        <MetricCard label="Done" value={counts.DONE} />
        <MetricCard
          label="Overdue"
          value={overdue}
          accent={overdue > 0 ? "text-red-600" : ""}
        />
        <MetricCard label="Projects" value={projects.length} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Your projects</h2>
          <Link href="/projects" className="text-sm font-medium underline">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="truncate font-medium">{project.name}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {project.memberships[0]?.role}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {project._count.tasks} tasks
              </p>
            </Link>
          ))}
          {projects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
              No projects yet. Create your first project to start tracking work.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent = "",
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`text-3xl font-semibold tracking-tight ${accent}`}>
        {value}
      </div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}
