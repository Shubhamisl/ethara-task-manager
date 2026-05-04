import bcrypt from "bcryptjs";
import { vi } from "vitest";
import { prisma } from "@/lib/db";

export async function resetDb() {
  await prisma.task.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
}

export async function makeUser(email: string, name = email.split("@")[0]) {
  return prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await bcrypt.hash("abcd1234", 4),
    },
  });
}

export function mockSession(userId: string, email = "user@x.com", name = "User") {
  vi.doMock("@/lib/auth", () => ({
    auth: async () => ({ user: { id: userId, email, name } }),
  }));
}
