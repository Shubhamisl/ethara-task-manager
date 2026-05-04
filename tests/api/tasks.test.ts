import type { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import { makeUser, mockSession, resetDb } from "../helpers";

beforeEach(async () => {
  vi.resetModules();
  await resetDb();
});

it("rejects MEMBER changing title", async () => {
  const admin = await makeUser("a@x.com");
  const member = await makeUser("m@x.com");
  const project = await prisma.project.create({
    data: {
      name: "P",
      ownerId: admin.id,
      memberships: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: member.id, role: "MEMBER" },
        ],
      },
    },
  });
  const task = await prisma.task.create({
    data: {
      projectId: project.id,
      title: "T",
      createdById: admin.id,
      assigneeId: member.id,
    },
  });

  mockSession(member.id, member.email, member.name);
  const { PATCH } = await import("@/app/api/tasks/[id]/route");
  const res = await PATCH(
    new Request(`http://localhost/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Hacked" }),
    }) as NextRequest,
    { params: Promise.resolve({ id: task.id }) }
  );

  expect(res.status).toBe(403);
});

it("allows MEMBER updating status of own task", async () => {
  const admin = await makeUser("a2@x.com");
  const member = await makeUser("m2@x.com");
  const project = await prisma.project.create({
    data: {
      name: "P",
      ownerId: admin.id,
      memberships: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: member.id, role: "MEMBER" },
        ],
      },
    },
  });
  const task = await prisma.task.create({
    data: {
      projectId: project.id,
      title: "T",
      createdById: admin.id,
      assigneeId: member.id,
    },
  });

  mockSession(member.id, member.email, member.name);
  const { PATCH } = await import("@/app/api/tasks/[id]/route");
  const res = await PATCH(
    new Request(`http://localhost/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    }) as NextRequest,
    { params: Promise.resolve({ id: task.id }) }
  );

  expect(res.status).toBe(200);
  const updated = await prisma.task.findUnique({ where: { id: task.id } });
  expect(updated?.status).toBe("DONE");
});
