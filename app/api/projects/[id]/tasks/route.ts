import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createTaskSchema } from "@/lib/validators/task";
import { apiError, handleApiError, requireSession, zodError } from "@/lib/api";
import { hasRole } from "@/lib/rbac";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await hasRole(user.id, id, "MEMBER");

    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? undefined;
    const assigneeId = url.searchParams.get("assigneeId") ?? undefined;
    const overdue = url.searchParams.get("overdue") === "true";
    const priority = url.searchParams.get("priority") ?? undefined;

    const where: Record<string, unknown> = { projectId: id };
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (priority) where.priority = priority;
    if (overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { not: "DONE" };
    }

    const tasks = await prisma.task.findMany({
      where: where as any,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(tasks);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await hasRole(user.id, id, "MEMBER");

    const body = await req.json().catch(() => null);
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    if (parsed.data.assigneeId) {
      const ok = await prisma.membership.findUnique({
        where: { userId_projectId: { userId: parsed.data.assigneeId, projectId: id } },
      });
      if (!ok) return apiError(400, "Assignee is not a member of this project");
    }

    const task = await prisma.task.create({
      data: {
        projectId: id,
        title: parsed.data.title,
        description: parsed.data.description ?? "",
        status: parsed.data.status ?? "TODO",
        priority: parsed.data.priority ?? "MEDIUM",
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        assigneeId: parsed.data.assigneeId ?? null,
        createdById: user.id,
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
