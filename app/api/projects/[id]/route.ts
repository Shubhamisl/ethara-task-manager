import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateProjectSchema } from "@/lib/validators/project";
import { handleApiError, requireSession, zodError } from "@/lib/api";
import { hasRole } from "@/lib/rbac";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await hasRole(user.id, id, "MEMBER");
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        memberships: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
    });
    return NextResponse.json(project);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await hasRole(user.id, id, "ADMIN");
    const body = await req.json().catch(() => null);
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);
    const updated = await prisma.project.update({ where: { id }, data: parsed.data });
    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await hasRole(user.id, id, "ADMIN");
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
