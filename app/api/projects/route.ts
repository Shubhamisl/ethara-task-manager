import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createProjectSchema } from "@/lib/validators/project";
import { handleApiError, requireSession, zodError } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireSession();
    const projects = await prisma.project.findMany({
      where: { memberships: { some: { userId: user.id } } },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { tasks: true, memberships: true } },
        memberships: { where: { userId: user.id }, select: { role: true } },
      },
    });
    return NextResponse.json(
      projects.map((p) => ({ ...p, role: p.memberships[0]?.role ?? null, memberships: undefined }))
    );
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireSession();
    const body = await req.json().catch(() => null);
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? "",
        ownerId: user.id,
        memberships: { create: { userId: user.id, role: "ADMIN" } },
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
