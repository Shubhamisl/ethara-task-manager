import { beforeAll } from "vitest";

beforeAll(() => {
  process.env.NEXTAUTH_SECRET = "test-secret-please-change";
  process.env.NEXTAUTH_URL = "http://localhost:3000";
});
