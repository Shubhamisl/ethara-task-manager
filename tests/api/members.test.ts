import type { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import { makeUser, mockSession, resetDbOrSkip } from "../helpers";

beforeEach(async (context) => {
  vi.resetModules();
  await resetDbOrSkip(context);
});

it("rejects demoting the only admin", async () => {
  const admin = await makeUser("admin@x.com");
  const project = await prisma.project.create({
    data: {
      name: "P",
      ownerId: admin.id,
      memberships: { create: { userId: admin.id, role: "ADMIN" } },
    },
  });

  mockSession(admin.id, admin.email, admin.name);
  const { PATCH } = await import(
    "@/app/api/projects/[id]/members/[userId]/route"
  );
  const res = await PATCH(
    new Request(`http://localhost/api/projects/${project.id}/members/${admin.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: "MEMBER" }),
    }) as NextRequest,
    { params: Promise.resolve({ id: project.id, userId: admin.id }) }
  );

  expect(res.status).toBe(400);
});
