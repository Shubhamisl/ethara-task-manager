import { describe, it, expect } from "vitest";
import { signupSchema, loginSchema } from "@/lib/validators/auth";

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
