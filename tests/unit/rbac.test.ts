import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("@/lib/db", () => ({
  prisma: {
    membership: { findUnique: vi.fn() },
  },
}));

// Mock auth module to avoid NextAuth initialization issues in test
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { hasRole } from "@/lib/rbac";
import { RoleError } from "@/lib/api";

describe("hasRole", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns membership when user has at-least required role", async () => {
    (prisma.membership.findUnique as any).mockResolvedValue({ role: "ADMIN" });
    const m = await hasRole("u", "p", "ADMIN");
    expect(m.role).toBe("ADMIN");
  });

  it("allows MEMBER when MEMBER required", async () => {
    (prisma.membership.findUnique as any).mockResolvedValue({ role: "MEMBER" });
    const m = await hasRole("u", "p", "MEMBER");
    expect(m.role).toBe("MEMBER");
  });

  it("throws when MEMBER tries ADMIN action", async () => {
    (prisma.membership.findUnique as any).mockResolvedValue({ role: "MEMBER" });
    await expect(hasRole("u", "p", "ADMIN")).rejects.toBeInstanceOf(RoleError);
  });

  it("throws 404-like when no membership", async () => {
    (prisma.membership.findUnique as any).mockResolvedValue(null);
    await expect(hasRole("u", "p", "MEMBER")).rejects.toBeInstanceOf(RoleError);
  });
});
