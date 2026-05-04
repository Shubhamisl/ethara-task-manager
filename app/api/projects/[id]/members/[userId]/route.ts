import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateMemberRoleSchema } from "@/lib/validators/member";
import { apiError, handleApiError, requireSession, zodError } from "@/lib/api";
import { hasRole } from "@/lib/rbac";

type Ctx = { params: Promise<{ id: string; userId: string }> };

async function adminCount(projectId: string) {
  return prisma.membership.count({ where: { projectId, role: "ADMIN" } });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const me = await requireSession();
    const { id, userId } = await params;
    await hasRole(me.id, id, "ADMIN");

    const body = await req.json().catch(() => null);
    const parsed = updateMemberRoleSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const target = await prisma.membership.findUnique({
      where: { userId_projectId: { userId, projectId: id } },
    });
    if (!target) return apiError(404, "Member not found");

    if (target.role === "ADMIN" && parsed.data.role === "MEMBER") {
      const count = await adminCount(id);
      if (count <= 1) return apiError(400, "Cannot demote the last admin");
    }

    const updated = await prisma.membership.update({
      where: { userId_projectId: { userId, projectId: id } },
      data: { role: parsed.data.role },
    });
    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const me = await requireSession();
    const { id, userId } = await params;
    await hasRole(me.id, id, "ADMIN");

    const target = await prisma.membership.findUnique({
      where: { userId_projectId: { userId, projectId: id } },
    });
    if (!target) return apiError(404, "Member not found");

    if (target.role === "ADMIN") {
      const count = await adminCount(id);
      if (count <= 1) return apiError(400, "Cannot remove the last admin");
    }

    await prisma.task.updateMany({
      where: { projectId: id, assigneeId: userId },
      data: { assigneeId: null },
    });

    await prisma.membership.delete({
      where: { userId_projectId: { userId, projectId: id } },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
