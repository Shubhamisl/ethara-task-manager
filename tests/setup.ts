import { beforeAll } from "vitest";
import { loadLocalEnv } from "@/lib/load-env";

loadLocalEnv();

beforeAll(() => {
  process.env.NEXTAUTH_SECRET = "test-secret-please-change";
  process.env.NEXTAUTH_URL = "http://localhost:3000";
});
