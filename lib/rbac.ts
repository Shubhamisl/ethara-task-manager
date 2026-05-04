import { prisma } from "@/lib/db";
import type { Role } from "@/lib/generated/prisma/client";
import { RoleError } from "@/lib/errors";

const rank: Record<Role, number> = { MEMBER: 1, ADMIN: 2 };

export async function hasRole(userId: string, projectId: string, required: Role) {
  const m = await prisma.membership.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (!m) throw new RoleError(404, "Project not found");
  if (rank[m.role] < rank[required]) throw new RoleError(403, "Forbidden");
  return m;
}
