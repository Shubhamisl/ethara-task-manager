import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Prisma 7 requires a driver adapter (e.g. @prisma/adapter-pg) or accelerateUrl
// at the constructor level. The log-only config is cast here; the adapter will be
// added when wiring up the actual database connection in a later phase.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clientOptions: any = {
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(clientOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
