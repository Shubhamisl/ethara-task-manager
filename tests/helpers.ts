import bcrypt from "bcryptjs";
import type { TestContext } from "vitest";
import { vi } from "vitest";
import { prisma } from "@/lib/db";

let dbUnavailableReason: string | null | undefined;

export async function getDbUnavailableReason() {
  if (dbUnavailableReason !== undefined) return dbUnavailableReason;

  if (!process.env.DATABASE_URL) {
    dbUnavailableReason = "DATABASE_URL is not configured";
    return dbUnavailableReason;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbUnavailableReason = null;
  } catch {
    dbUnavailableReason = "PostgreSQL test database is not reachable";
  }

  return dbUnavailableReason;
}

export async function resetDbOrSkip(context: TestContext) {
  const reason = await getDbUnavailableReason();
  context.skip(Boolean(reason), reason ?? undefined);
  await resetDb();
}

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
