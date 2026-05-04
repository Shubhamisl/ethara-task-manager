import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addMemberSchema } from "@/lib/validators/member";
import { apiError, handleApiError, requireSession, zodError } from "@/lib/api";
import { hasRole } from "@/lib/rbac";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await hasRole(user.id, id, "MEMBER");
    const members = await prisma.membership.findMany({
      where: { projectId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(members);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await hasRole(user.id, id, "ADMIN");
    const body = await req.json().catch(() => null);
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const target = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!target) return apiError(404, "User with that email does not exist");

    const existing = await prisma.membership.findUnique({
      where: { userId_projectId: { userId: target.id, projectId: id } },
    });
    if (existing) return apiError(409, "User is already a member");

    const m = await prisma.membership.create({
      data: { userId: target.id, projectId: id, role: parsed.data.role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(m, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
