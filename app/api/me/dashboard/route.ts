import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, requireSession } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireSession();
    const now = new Date();

    const [byStatus, overdueCount, projects] = await Promise.all([
      prisma.task.groupBy({
        by: ["status"],
        where: { assigneeId: user.id },
        _count: { _all: true },
      }),
      prisma.task.count({
        where: { assigneeId: user.id, dueDate: { lt: now }, status: { not: "DONE" } },
      }),
      prisma.project.findMany({
        where: { memberships: { some: { userId: user.id } } },
        select: {
          id: true,
          name: true,
          _count: { select: { tasks: true } },
          memberships: { where: { userId: user.id }, select: { role: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
    ]);

    const statusCounts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 } as Record<string, number>;
    for (const row of byStatus) statusCounts[row.status] = row._count._all;

    return NextResponse.json({
      myTasks: statusCounts,
      overdue: overdueCount,
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        taskCount: p._count.tasks,
        role: p.memberships[0]?.role ?? null,
      })),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
