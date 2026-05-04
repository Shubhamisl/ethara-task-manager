import type { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";
import { makeUser, mockSession, resetDb } from "../helpers";

beforeEach(async () => {
  vi.resetModules();
  await resetDb();
});

it("creates a project and returns it on list for the creator only", async () => {
  const u1 = await makeUser("u1@x.com");
  const u2 = await makeUser("u2@x.com");

  mockSession(u1.id, u1.email, u1.name);
  const { POST, GET } = await import("@/app/api/projects/route");

  const create = await POST(
    new Request("http://localhost/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "P1" }),
    }) as NextRequest
  );
  expect(create.status).toBe(201);

  const list1 = await (await GET()).json();
  expect(list1).toHaveLength(1);

  vi.resetModules();
  mockSession(u2.id, u2.email, u2.name);
  const { GET: getForUser2 } = await import("@/app/api/projects/route");
  const list2 = await (await getForUser2()).json();
  expect(list2).toHaveLength(0);
});
