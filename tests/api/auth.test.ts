import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { POST as signup } from "@/app/api/auth/signup/route";
import { resetDb } from "../helpers";

function req(body: unknown) {
  return new Request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

describe("POST /api/auth/signup", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates a user", async () => {
    const res = await signup(
      req({ email: "a@b.com", name: "A", password: "abcd1234" })
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.email).toBe("a@b.com");
  });

  it("rejects duplicate email", async () => {
    await signup(req({ email: "a@b.com", name: "A", password: "abcd1234" }));
    const res = await signup(
      req({ email: "a@b.com", name: "B", password: "abcd1234" })
    );
    expect(res.status).toBe(409);
  });

  it("rejects bad password", async () => {
    const res = await signup(
      req({ email: "a@b.com", name: "A", password: "short" })
    );
    expect(res.status).toBe(400);
  });
});
