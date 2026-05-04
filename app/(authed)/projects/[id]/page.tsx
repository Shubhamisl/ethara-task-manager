import Link from "next/link";
import MemberTable from "@/components/member-table";
import ProjectSettings from "@/components/project-settings";
import TaskBoard from "@/components/task-board";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function ProjectDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { tab = "tasks" } = await searchParams;
  const session = await auth();
  const userId = session!.user!.id;

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

  const visibleTabs = [
    { key: "tasks", label: "Tasks" },
    { key: "members", label: "Members" },
    ...(me.role === "ADMIN" ? [{ key: "settings", label: "Settings" }] : []),
  ];
  const activeTab = visibleTabs.some((item) => item.key === tab) ? tab : "tasks";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/projects" className="text-sm font-medium text-slate-500">
            Projects
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            {project.description || "No description"}
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
          {me.role}
        </span>
      </header>

      <nav className="flex gap-2 border-b border-slate-200">
        {visibleTabs.map((item) => (
          <Link
            key={item.key}
            href={`?tab=${item.key}`}
            className={`px-3 py-2 text-sm ${
              activeTab === item.key
                ? "border-b-2 border-slate-950 font-medium text-slate-950"
                : "text-slate-500 hover:text-slate-950"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {activeTab === "tasks" ? (
        <TaskBoard
          projectId={project.id}
          role={me.role}
          currentUserId={userId}
          initialTasks={project.tasks.map((task) => ({
            ...task,
            dueDate: task.dueDate?.toISOString() ?? null,
          }))}
          members={project.memberships.map((membership) => membership.user)}
        />
      ) : null}

      {activeTab === "members" ? (
        <MemberTable
          projectId={project.id}
          role={me.role}
          members={project.memberships}
        />
      ) : null}

      {activeTab === "settings" && me.role === "ADMIN" ? (
        <ProjectSettings
          projectId={project.id}
          initial={{ name: project.name, description: project.description }}
        />
      ) : null}
    </div>
  );
}
