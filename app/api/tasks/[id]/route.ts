import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateTaskSchema } from "@/lib/validators/task";
import { apiError, handleApiError, requireSession, zodError } from "@/lib/api";
import { hasRole } from "@/lib/rbac";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
    if (!task) return apiError(404, "Task not found");
    await hasRole(user.id, task.projectId, "MEMBER");
    return NextResponse.json(task);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return apiError(404, "Task not found");
    const membership = await hasRole(user.id, task.projectId, "MEMBER");

    const body = await req.json().catch(() => null);
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    // MEMBER can only change status, and only for tasks assigned to them
    if (membership.role === "MEMBER") {
      const onlyStatus =
        Object.keys(parsed.data).length === 1 && parsed.data.status !== undefined;
      if (!onlyStatus) return apiError(403, "Members can only update status");
      if (task.assigneeId !== user.id)
        return apiError(403, "Members can only update tasks assigned to them");
    }

    if (parsed.data.assigneeId) {
      const ok = await prisma.membership.findUnique({
        where: { userId_projectId: { userId: parsed.data.assigneeId, projectId: task.projectId } },
      });
      if (!ok) return apiError(400, "Assignee is not a member of this project");
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...parsed.data,
        dueDate:
          parsed.data.dueDate === undefined
            ? undefined
            : parsed.data.dueDate === null
              ? null
              : new Date(parsed.data.dueDate),
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return apiError(404, "Task not found");
    await hasRole(user.id, task.projectId, "ADMIN");
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
