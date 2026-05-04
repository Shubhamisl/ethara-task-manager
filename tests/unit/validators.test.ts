import { describe, it, expect } from "vitest";
import { signupSchema, loginSchema } from "@/lib/validators/auth";
import { createProjectSchema, updateProjectSchema } from "@/lib/validators/project";
import { addMemberSchema, updateMemberRoleSchema } from "@/lib/validators/member";
import { createTaskSchema, updateTaskSchema } from "@/lib/validators/task";

describe("auth validators", () => {
  it("accepts a valid signup payload", () => {
    expect(
      signupSchema.safeParse({ email: "a@b.com", name: "Ann", password: "abcd1234" }).success
    ).toBe(true);
  });

  it("rejects short password on signup", () => {
    expect(
      signupSchema.safeParse({ email: "a@b.com", name: "Ann", password: "short" }).success
    ).toBe(false);
  });

  it("rejects invalid email on login", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "abcd1234" }).success).toBe(false);
  });
});

describe("project validators", () => {
  it("accepts valid create", () => {
    expect(createProjectSchema.safeParse({ name: "X", description: "" }).success).toBe(true);
  });
  it("rejects empty name", () => {
    expect(createProjectSchema.safeParse({ name: "", description: "" }).success).toBe(false);
  });
});

describe("member validators", () => {
  it("accepts add", () => {
    expect(addMemberSchema.safeParse({ email: "a@b.com", role: "MEMBER" }).success).toBe(true);
  });
  it("rejects bad role", () => {
    expect(addMemberSchema.safeParse({ email: "a@b.com", role: "OWNER" }).success).toBe(false);
  });
  it("accepts role update", () => {
    expect(updateMemberRoleSchema.safeParse({ role: "ADMIN" }).success).toBe(true);
  });
});

describe("task validators", () => {
  it("accepts minimal create", () => {
    expect(createTaskSchema.safeParse({ title: "T" }).success).toBe(true);
  });
  it("accepts full create with ISO dueDate", () => {
    expect(
      createTaskSchema.safeParse({
        title: "T",
        description: "D",
        status: "TODO",
        priority: "HIGH",
        dueDate: "2026-12-31T00:00:00.000Z",
        assigneeId: "ckxxx",
      }).success
    ).toBe(true);
  });
  it("rejects bad status on update", () => {
    expect(updateTaskSchema.safeParse({ status: "WAT" }).success).toBe(false);
  });
});
