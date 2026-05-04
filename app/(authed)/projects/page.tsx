import Link from "next/link";
import NewProjectDialog from "@/components/new-project-dialog";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const projects = await prisma.project.findMany({
    where: { memberships: { some: { userId } } },
    include: {
      _count: { select: { tasks: true, memberships: true } },
      memberships: { where: { userId }, select: { role: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Projects
          </h1>
        </div>
        <NewProjectDialog />
      </header>

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
            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
              {project.description || "No description"}
            </p>
            <p className="mt-4 text-xs text-slate-400">
              {project._count.memberships} members / {project._count.tasks} tasks
            </p>
          </Link>
        ))}
        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
            No projects yet. Create one to invite teammates and track tasks.
          </div>
        ) : null}
      </div>
    </div>
  );
}
