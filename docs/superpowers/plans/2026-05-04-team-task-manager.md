# Team Task Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a deployed full-stack team task manager (auth, projects, tasks, RBAC, dashboard) on Railway in 8–12 hours.

**Architecture:** Single Next.js 15 (App Router) app, Postgres via Prisma, NextAuth (Auth.js v5) with Credentials + JWT cookie sessions, REST route handlers, Tailwind + shadcn/ui, polished UI generated via stitch-design and react-components skills.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma, Postgres (Railway plugin), NextAuth v5, Tailwind 4, shadcn/ui, Zod, bcryptjs, Vitest, pnpm.

**Spec:** [`docs/superpowers/specs/2026-05-04-team-task-manager-design.md`](../specs/2026-05-04-team-task-manager-design.md)

---

## File Structure

```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          # redirect → /dashboard or /login
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (authed)/
│   │   ├── layout.tsx                    # auth gate + top nav
│   │   ├── dashboard/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── projects/[id]/page.tsx        # tabs: tasks/members/settings
│   │   └── tasks/[id]/page.tsx
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts
│       │   └── signup/route.ts
│       ├── projects/
│       │   ├── route.ts                  # GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts              # GET, PATCH, DELETE
│       │       ├── members/
│       │       │   ├── route.ts          # GET, POST
│       │       │   └── [userId]/route.ts # PATCH, DELETE
│       │       └── tasks/route.ts        # GET, POST
│       ├── tasks/[id]/route.ts           # GET, PATCH, DELETE
│       └── me/dashboard/route.ts
├── components/
│   ├── ui/                               # shadcn primitives
│   ├── nav.tsx
│   ├── project-card.tsx
│   ├── task-card.tsx
│   ├── task-board.tsx                    # Kanban
│   ├── task-form.tsx
│   ├── member-table.tsx
│   └── ...                               # filled by stitch/react-components skills
├── lib/
│   ├── auth.ts                           # NextAuth config
│   ├── db.ts                             # Prisma singleton
│   ├── rbac.ts                           # requireProjectRole
│   ├── api.ts                            # apiError + handler wrapper
│   └── validators/
│       ├── auth.ts
│       ├── project.ts
│       ├── member.ts
│       └── task.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
│   ├── unit/
│   │   ├── rbac.test.ts
│   │   └── validators.test.ts
│   └── api/
│       ├── auth.test.ts
│       ├── projects.test.ts
│       ├── members.test.ts
│       └── tasks.test.ts
├── .env.example
├── README.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── vitest.config.ts
└── docs/
    └── superpowers/
        ├── specs/2026-05-04-team-task-manager-design.md
        └── plans/2026-05-04-team-task-manager.md
```

---

## Phase 0 — Project Bootstrap

### Task 0.1: Initialize repo + Next.js + git

**Files:**
- Create: `D:\Ethara\` (project root)
- Create: `.gitignore`, `README.md` (stub), `package.json`

- [ ] **Step 1: Scaffold Next.js with TypeScript + Tailwind + App Router**

```bash
cd /d/Ethara
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-pnpm --no-turbopack
```

When prompted about overwriting existing `docs/`, answer **No**.

- [ ] **Step 2: Initialize git and first commit**

```bash
cd /d/Ethara
git init
git add -A
git commit -m "chore: scaffold Next.js app"
```

- [ ] **Step 3: Add Railway-relevant scripts to package.json**

In `package.json` `scripts`, ensure:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "prisma migrate deploy && next start -p ${PORT:-3000}",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore: add build/start/test scripts"
```

---

### Task 0.2: Install runtime dependencies

- [ ] **Step 1: Install core deps**

```bash
pnpm add prisma @prisma/client next-auth@beta @auth/prisma-adapter bcryptjs zod
pnpm add -D @types/bcryptjs tsx vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Install shadcn/ui**

```bash
pnpm dlx shadcn@latest init -d
pnpm dlx shadcn@latest add button input label card dialog dropdown-menu select badge tabs table toast sonner avatar separator
```

Accept defaults (New York style, slate base color, CSS vars yes).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: install dependencies and shadcn primitives"
```

---

### Task 0.3: Vitest config

**Files:** Create `vitest.config.ts`, `tests/setup.ts`

- [ ] **Step 1: Write vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 2: Write tests/setup.ts**

```ts
import { beforeAll } from "vitest";

beforeAll(() => {
  process.env.NEXTAUTH_SECRET = "test-secret-please-change";
  process.env.NEXTAUTH_URL = "http://localhost:3000";
});
```

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts tests/setup.ts
git commit -m "test: configure vitest"
```

---

### Task 0.4: Environment template

**Files:** Create `.env.example`, `.env`

- [ ] **Step 1: Write .env.example**

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ethara?schema=public"
NEXTAUTH_SECRET="replace-me-with-32-byte-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 2: Copy to .env locally and confirm `.env` is gitignored**

```bash
cp .env.example .env
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
```

- [ ] **Step 3: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add env template"
```

---

## Phase 1 — Database Schema

### Task 1.1: Prisma schema

**Files:** Create `prisma/schema.prisma`

- [ ] **Step 1: Initialize Prisma**

```bash
pnpm prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Replace `prisma/schema.prisma` with full schema**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  MEMBER
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

model User {
  id            String       @id @default(cuid())
  email         String       @unique
  name          String
  passwordHash  String
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  ownedProjects Project[]    @relation("ProjectOwner")
  memberships   Membership[]
  assignedTasks Task[]       @relation("TaskAssignee")
  createdTasks  Task[]       @relation("TaskCreator")
}

model Project {
  id          String       @id @default(cuid())
  name        String
  description String       @default("")
  ownerId     String
  owner       User         @relation("ProjectOwner", fields: [ownerId], references: [id])
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  memberships Membership[]
  tasks       Task[]
}

model Membership {
  id        String   @id @default(cuid())
  userId    String
  projectId String
  role      Role     @default(MEMBER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
  @@index([projectId])
}

model Task {
  id          String     @id @default(cuid())
  projectId   String
  title       String
  description String     @default("")
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  assigneeId  String?
  createdById String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee  User?   @relation("TaskAssignee", fields: [assigneeId], references: [id], onDelete: SetNull)
  createdBy User    @relation("TaskCreator", fields: [createdById], references: [id])

  @@index([projectId, status])
  @@index([assigneeId])
}
```

- [ ] **Step 3: Run initial migration locally**

```bash
pnpm prisma migrate dev --name init
```

Expected: migration created in `prisma/migrations/<timestamp>_init/`, Prisma Client generated.

- [ ] **Step 4: Commit**

```bash
git add prisma/
git commit -m "feat(db): initial Prisma schema and migration"
```

---

### Task 1.2: Prisma client singleton

**Files:** Create `lib/db.ts`

- [ ] **Step 1: Write lib/db.ts**

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 2: Commit**

```bash
git add lib/db.ts
git commit -m "feat(db): add Prisma client singleton"
```

---

## Phase 2 — Validators (Zod)

### Task 2.1: Auth validator

**Files:** Create `lib/validators/auth.ts`, `tests/unit/validators.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/validators.test.ts
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
```

- [ ] **Step 2: Run — should fail (module not found)**

```bash
pnpm test -- tests/unit/validators.test.ts
```

- [ ] **Step 3: Implement**

```ts
// lib/validators/auth.ts
import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(1).max(80).trim(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

- [ ] **Step 4: Run — should pass**

```bash
pnpm test -- tests/unit/validators.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/validators/auth.ts tests/unit/validators.test.ts
git commit -m "feat(validators): auth signup and login schemas"
```

---

### Task 2.2: Project, member, task validators

**Files:** Create `lib/validators/project.ts`, `lib/validators/member.ts`, `lib/validators/task.ts`; extend `tests/unit/validators.test.ts`

- [ ] **Step 1: Append failing tests**

Append to `tests/unit/validators.test.ts`:

```ts
import { createProjectSchema, updateProjectSchema } from "@/lib/validators/project";
import { addMemberSchema, updateMemberRoleSchema } from "@/lib/validators/member";
import { createTaskSchema, updateTaskSchema } from "@/lib/validators/task";

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
```

- [ ] **Step 2: Run — should fail (modules not found)**

```bash
pnpm test -- tests/unit/validators.test.ts
```

- [ ] **Step 3: Implement validators**

```ts
// lib/validators/project.ts
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(120).trim(),
  description: z.string().max(2000).default(""),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(120).trim().optional(),
  description: z.string().max(2000).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
```

```ts
// lib/validators/member.ts
import { z } from "zod";

export const roleEnum = z.enum(["ADMIN", "MEMBER"]);

export const addMemberSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  role: roleEnum.default("MEMBER"),
});

export const updateMemberRoleSchema = z.object({
  role: roleEnum,
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
```

```ts
// lib/validators/task.ts
import { z } from "zod";

export const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

const isoDate = z.string().datetime().optional().nullable();

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(5000).optional().default(""),
  status: taskStatusEnum.optional().default("TODO"),
  priority: taskPriorityEnum.optional().default("MEDIUM"),
  dueDate: isoDate,
  assigneeId: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(5000).optional(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  dueDate: isoDate,
  assigneeId: z.string().optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
```

- [ ] **Step 4: Run — all pass**

```bash
pnpm test -- tests/unit/validators.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/validators tests/unit/validators.test.ts
git commit -m "feat(validators): project, member, task schemas"
```

---

## Phase 3 — Auth & Session

### Task 3.1: NextAuth config (Credentials + JWT)

**Files:** Create `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `types/next-auth.d.ts`

- [ ] **Step 1: Write `lib/auth.ts`**

```ts
// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validators/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id as string;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) (session.user as { id: string }).id = token.id as string;
      return session;
    },
  },
});
```

- [ ] **Step 2: Write the route handler**

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 3: Type augmentation for Session.user.id**

```ts
// types/next-auth.d.ts
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}
```

- [ ] **Step 4: Add types path to tsconfig include if not already**

Open `tsconfig.json`, ensure `"include"` contains `"types/**/*.d.ts"`.

- [ ] **Step 5: Commit**

```bash
git add lib/auth.ts app/api/auth/[...nextauth]/route.ts types/ tsconfig.json
git commit -m "feat(auth): NextAuth credentials provider with JWT sessions"
```

---

### Task 3.2: Signup endpoint

**Files:** Create `app/api/auth/signup/route.ts`, `lib/api.ts`

- [ ] **Step 1: Write `lib/api.ts` helper**

```ts
// lib/api.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: message, ...(details ? { details } : {}) }, { status });
}

export function zodError(err: ZodError) {
  return apiError(400, "Validation failed", err.flatten().fieldErrors);
}
```

- [ ] **Step 2: Write signup route**

```ts
// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validators/auth";
import { apiError, zodError } from "@/lib/api";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const { email, name, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return apiError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json(user, { status: 201 });
}
```

- [ ] **Step 3: Manual smoke test (skip if DB not running locally yet)**

```bash
pnpm dev &
curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "content-type: application/json" \
  -d '{"email":"a@b.com","name":"Ann","password":"abcd1234"}'
```

Expected: `201` with `{id, email, name}`. Kill dev server.

- [ ] **Step 4: Commit**

```bash
git add lib/api.ts app/api/auth/signup/
git commit -m "feat(auth): signup endpoint with bcrypt and conflict handling"
```

---

## Phase 4 — RBAC

### Task 4.1: requireProjectRole helper + tests

**Files:** Create `lib/rbac.ts`, `tests/unit/rbac.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/rbac.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    membership: { findUnique: vi.fn() },
  },
}));

import { prisma } from "@/lib/db";
import { hasRole, RoleError } from "@/lib/rbac";

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
```

- [ ] **Step 2: Run — should fail**

```bash
pnpm test -- tests/unit/rbac.test.ts
```

- [ ] **Step 3: Implement**

```ts
// lib/rbac.ts
import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

export class RoleError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const rank: Record<Role, number> = { MEMBER: 1, ADMIN: 2 };

export async function hasRole(userId: string, projectId: string, required: Role) {
  const m = await prisma.membership.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (!m) throw new RoleError(404, "Project not found");
  if (rank[m.role] < rank[required]) throw new RoleError(403, "Forbidden");
  return m;
}
```

- [ ] **Step 4: Run — should pass**

```bash
pnpm test -- tests/unit/rbac.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/rbac.ts tests/unit/rbac.test.ts
git commit -m "feat(rbac): requireProjectRole helper with tests"
```

---

### Task 4.2: Session helper

**Files:** Append to `lib/api.ts`

- [ ] **Step 1: Add `requireSession` to `lib/api.ts`**

```ts
// append to lib/api.ts
import { auth } from "@/lib/auth";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new RoleError(401, "Unauthorized");
  return session.user as { id: string; email: string; name: string };
}
```

Also export `RoleError` re-import at top of file:

```ts
import { RoleError } from "@/lib/rbac";
export { RoleError } from "@/lib/rbac";
```

And add a `handleApiError` wrapper:

```ts
export function handleApiError(err: unknown) {
  if (err instanceof RoleError) return apiError(err.status, err.message);
  console.error("Unhandled API error:", err);
  return apiError(500, "Internal server error");
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/api.ts
git commit -m "feat(api): session helper and error wrapper"
```

---

## Phase 5 — Project APIs

### Task 5.1: List + create projects

**Files:** Create `app/api/projects/route.ts`

- [ ] **Step 1: Write the route**

```ts
// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createProjectSchema } from "@/lib/validators/project";
import { apiError, handleApiError, requireSession, zodError } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireSession();
    const projects = await prisma.project.findMany({
      where: { memberships: { some: { userId: user.id } } },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { tasks: true, memberships: true } },
        memberships: { where: { userId: user.id }, select: { role: true } },
      },
    });
    return NextResponse.json(
      projects.map((p) => ({ ...p, role: p.memberships[0]?.role ?? null, memberships: undefined }))
    );
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireSession();
    const body = await req.json().catch(() => null);
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? "",
        ownerId: user.id,
        memberships: { create: { userId: user.id, role: "ADMIN" } },
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/projects/route.ts
git commit -m "feat(api): list and create projects"
```

---

### Task 5.2: Project detail / update / delete

**Files:** Create `app/api/projects/[id]/route.ts`

- [ ] **Step 1: Write the route**

```ts
// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateProjectSchema } from "@/lib/validators/project";
import { handleApiError, requireSession, zodError } from "@/lib/api";
import { hasRole } from "@/lib/rbac";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await hasRole(user.id, id, "MEMBER");
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        memberships: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
    });
    return NextResponse.json(project);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await hasRole(user.id, id, "ADMIN");
    const body = await req.json().catch(() => null);
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);
    const updated = await prisma.project.update({ where: { id }, data: parsed.data });
    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await hasRole(user.id, id, "ADMIN");
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/projects/[id]/route.ts
git commit -m "feat(api): get/update/delete project"
```

---

## Phase 6 — Member APIs

### Task 6.1: List + add members

**Files:** Create `app/api/projects/[id]/members/route.ts`

- [ ] **Step 1: Write the route**

```ts
// app/api/projects/[id]/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addMemberSchema } from "@/lib/validators/member";
import { apiError, handleApiError, requireSession, zodError } from "@/lib/api";
import { hasRole } from "@/lib/rbac";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await hasRole(user.id, id, "MEMBER");
    const members = await prisma.membership.findMany({
      where: { projectId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(members);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await hasRole(user.id, id, "ADMIN");
    const body = await req.json().catch(() => null);
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const target = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!target) return apiError(404, "User with that email does not exist");

    const existing = await prisma.membership.findUnique({
      where: { userId_projectId: { userId: target.id, projectId: id } },
    });
    if (existing) return apiError(409, "User is already a member");

    const m = await prisma.membership.create({
      data: { userId: target.id, projectId: id, role: parsed.data.role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(m, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/projects/[id]/members/route.ts
git commit -m "feat(api): list and add project members"
```

---

### Task 6.2: Update role + remove member (with last-admin guard)

**Files:** Create `app/api/projects/[id]/members/[userId]/route.ts`

- [ ] **Step 1: Write the route**

```ts
// app/api/projects/[id]/members/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateMemberRoleSchema } from "@/lib/validators/member";
import { apiError, handleApiError, requireSession, zodError } from "@/lib/api";
import { hasRole } from "@/lib/rbac";

type Ctx = { params: Promise<{ id: string; userId: string }> };

async function adminCount(projectId: string) {
  return prisma.membership.count({ where: { projectId, role: "ADMIN" } });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const me = await requireSession();
    const { id, userId } = await params;
    await hasRole(me.id, id, "ADMIN");

    const body = await req.json().catch(() => null);
    const parsed = updateMemberRoleSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const target = await prisma.membership.findUnique({
      where: { userId_projectId: { userId, projectId: id } },
    });
    if (!target) return apiError(404, "Member not found");

    if (target.role === "ADMIN" && parsed.data.role === "MEMBER") {
      const count = await adminCount(id);
      if (count <= 1) return apiError(400, "Cannot demote the last admin");
    }

    const updated = await prisma.membership.update({
      where: { userId_projectId: { userId, projectId: id } },
      data: { role: parsed.data.role },
    });
    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const me = await requireSession();
    const { id, userId } = await params;
    await hasRole(me.id, id, "ADMIN");

    const target = await prisma.membership.findUnique({
      where: { userId_projectId: { userId, projectId: id } },
    });
    if (!target) return apiError(404, "Member not found");

    if (target.role === "ADMIN") {
      const count = await adminCount(id);
      if (count <= 1) return apiError(400, "Cannot remove the last admin");
    }

    // Null out task assignments for this user in this project
    await prisma.task.updateMany({
      where: { projectId: id, assigneeId: userId },
      data: { assigneeId: null },
    });

    await prisma.membership.delete({
      where: { userId_projectId: { userId, projectId: id } },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/projects/[id]/members/[userId]/route.ts
git commit -m "feat(api): update role and remove member with last-admin guard"
```

---

## Phase 7 — Task APIs

### Task 7.1: List + create tasks (per project)

**Files:** Create `app/api/projects/[id]/tasks/route.ts`

- [ ] **Step 1: Write the route**

```ts
// app/api/projects/[id]/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createTaskSchema } from "@/lib/validators/task";
import { apiError, handleApiError, requireSession, zodError } from "@/lib/api";
import { hasRole } from "@/lib/rbac";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await hasRole(user.id, id, "MEMBER");

    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? undefined;
    const assigneeId = url.searchParams.get("assigneeId") ?? undefined;
    const overdue = url.searchParams.get("overdue") === "true";
    const priority = url.searchParams.get("priority") ?? undefined;

    const where: Record<string, unknown> = { projectId: id };
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (priority) where.priority = priority;
    if (overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { not: "DONE" };
    }

    const tasks = await prisma.task.findMany({
      where: where as any,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(tasks);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await hasRole(user.id, id, "MEMBER");

    const body = await req.json().catch(() => null);
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    if (parsed.data.assigneeId) {
      const ok = await prisma.membership.findUnique({
        where: { userId_projectId: { userId: parsed.data.assigneeId, projectId: id } },
      });
      if (!ok) return apiError(400, "Assignee is not a member of this project");
    }

    const task = await prisma.task.create({
      data: {
        projectId: id,
        title: parsed.data.title,
        description: parsed.data.description ?? "",
        status: parsed.data.status ?? "TODO",
        priority: parsed.data.priority ?? "MEDIUM",
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        assigneeId: parsed.data.assigneeId ?? null,
        createdById: user.id,
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/projects/[id]/tasks/route.ts
git commit -m "feat(api): list and create project tasks"
```

---

### Task 7.2: Task get/update/delete

**Files:** Create `app/api/tasks/[id]/route.ts`

- [ ] **Step 1: Write the route**

```ts
// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateTaskSchema } from "@/lib/validators/task";
import { apiError, handleApiError, requireSession, zodError } from "@/lib/api";
import { hasRole } from "@/lib/rbac";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
    if (!task) return apiError(404, "Task not found");
    await hasRole(user.id, task.projectId, "MEMBER");
    return NextResponse.json(task);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return apiError(404, "Task not found");
    const membership = await hasRole(user.id, task.projectId, "MEMBER");

    const body = await req.json().catch(() => null);
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    // MEMBER can only change status, and only for tasks assigned to them
    if (membership.role === "MEMBER") {
      const onlyStatus =
        Object.keys(parsed.data).length === 1 && parsed.data.status !== undefined;
      if (!onlyStatus) return apiError(403, "Members can only update status");
      if (task.assigneeId !== user.id)
        return apiError(403, "Members can only update tasks assigned to them");
    }

    if (parsed.data.assigneeId) {
      const ok = await prisma.membership.findUnique({
        where: { userId_projectId: { userId: parsed.data.assigneeId, projectId: task.projectId } },
      });
      if (!ok) return apiError(400, "Assignee is not a member of this project");
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...parsed.data,
        dueDate:
          parsed.data.dueDate === undefined
            ? undefined
            : parsed.data.dueDate === null
              ? null
              : new Date(parsed.data.dueDate),
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireSession();
    const { id } = await params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return apiError(404, "Task not found");
    await hasRole(user.id, task.projectId, "ADMIN");
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/tasks/[id]/route.ts
git commit -m "feat(api): get/update/delete task with role-gated update"
```

---

## Phase 8 — Dashboard API

### Task 8.1: Per-user dashboard aggregate

**Files:** Create `app/api/me/dashboard/route.ts`

- [ ] **Step 1: Write the route**

```ts
// app/api/me/dashboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, requireSession } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireSession();
    const now = new Date();

    const [byStatus, overdueCount, projects] = await Promise.all([
      prisma.task.groupBy({
        by: ["status"],
        where: { assigneeId: user.id },
        _count: { _all: true },
      }),
      prisma.task.count({
        where: { assigneeId: user.id, dueDate: { lt: now }, status: { not: "DONE" } },
      }),
      prisma.project.findMany({
        where: { memberships: { some: { userId: user.id } } },
        select: {
          id: true,
          name: true,
          _count: { select: { tasks: true } },
          memberships: { where: { userId: user.id }, select: { role: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
    ]);

    const statusCounts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 } as Record<string, number>;
    for (const row of byStatus) statusCounts[row.status] = row._count._all;

    return NextResponse.json({
      myTasks: statusCounts,
      overdue: overdueCount,
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        taskCount: p._count.tasks,
        role: p.memberships[0]?.role ?? null,
      })),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/me/dashboard/route.ts
git commit -m "feat(api): user dashboard aggregate"
```

---

## Phase 9 — UI Design via Stitch

### Task 9.1: Generate design system + screens with stitch-design skill

**Files:** Generated via skill into `.stitch/DESIGN.md` and Stitch project

- [ ] **Step 1: Invoke stitch-design skill**

Use the `stitch-design` skill (via the `Skill` tool, name: `stitch-design`). Provide this brief:

> "Premium, polished team task manager. Pages: login, signup, dashboard, projects list, project detail (tabs: tasks/members/settings), task detail. Aesthetic: modern SaaS, calm/professional, slate/indigo palette, generous whitespace, subtle motion. Strong typography with one display + one UI sans. Kanban with drag affordances. Anti-generic UI standards (taste-design)."

The skill will produce a `.stitch/DESIGN.md` and Stitch-hosted high-fidelity screens.

- [ ] **Step 2: Iterate on screens until visually approved**

Adjust prompts via the same skill. Save each accepted screen.

- [ ] **Step 3: Commit any local artifacts (DESIGN.md, screen exports)**

```bash
git add .stitch
git commit -m "design: stitch-generated design system and screens"
```

---

### Task 9.2: Convert Stitch screens to React/Next.js components

**Files:** populates `components/` and writes page-level wrappers under `app/(authed)/`

- [ ] **Step 1: Invoke react-components skill**

Use the `react-components` skill. Brief:

> "Convert the approved Stitch screens into reusable React + Tailwind components in this Next.js 15 App Router project. Avoid Vite-specific imports; use Next.js conventions (`'use client'` where needed, `next/link`, `next/navigation`). Wire each screen to the data shapes returned by the existing API routes (see `app/api/`)."

- [ ] **Step 2: Adapt outputs to Next.js where needed**

- Replace any `react-router` with `next/link` / `useRouter` from `next/navigation`.
- Mark interactive components with `'use client'`.
- Move data fetching (lists, dashboard) into Server Components calling `prisma` directly OR fetch from internal API routes — pick one and stay consistent.

- [ ] **Step 3: Commit**

```bash
git add components app/\(authed\)
git commit -m "feat(ui): integrate Stitch-generated components into App Router"
```

---

## Phase 10 — Page Wiring

### Task 10.1: Auth pages

**Files:** Create/refine `app/(auth)/layout.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`

- [ ] **Step 1: Auth group layout**

```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen grid place-items-center bg-slate-50 p-6">{children}</main>;
}
```

- [ ] **Step 2: Login page (client component) — replace Stitch placeholder if any**

```tsx
// app/(auth)/login/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid credentials");
    else router.push("/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <input className="w-full rounded border px-3 py-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="w-full rounded border px-3 py-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="w-full rounded bg-slate-900 py-2 text-white disabled:opacity-50">{loading ? "..." : "Log in"}</button>
      <p className="text-sm text-slate-600">No account? <Link href="/signup" className="underline">Sign up</Link></p>
    </form>
  );
}
```

(Replace styling with the Stitch-derived components produced in Task 9.2 once available.)

- [ ] **Step 3: Signup page**

```tsx
// app/(auth)/signup/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Signup failed");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <input className="w-full rounded border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <input className="w-full rounded border px-3 py-2" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input className="w-full rounded border px-3 py-2" type="password" placeholder="Password (min 8)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="w-full rounded bg-slate-900 py-2 text-white disabled:opacity-50">{loading ? "..." : "Sign up"}</button>
      <p className="text-sm text-slate-600">Have an account? <Link href="/login" className="underline">Log in</Link></p>
    </form>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add "app/(auth)"
git commit -m "feat(ui): functional login and signup pages"
```

---

### Task 10.2: Authenticated layout + nav + auth gate

**Files:** Create `app/(authed)/layout.tsx`, `components/nav.tsx`, `app/page.tsx`

- [ ] **Step 1: Root redirect**

```tsx
// app/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Index() {
  const s = await auth();
  redirect(s?.user ? "/dashboard" : "/login");
}
```

- [ ] **Step 2: Authenticated layout**

```tsx
// app/(authed)/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Nav from "@/components/nav";

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav user={session.user as { id: string; name: string; email: string }} />
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Nav component**

```tsx
// components/nav.tsx
"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function Nav({ user }: { user: { name: string; email: string } }) {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/dashboard" className="text-lg font-semibold">Ethara</Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/projects">Projects</Link>
          <span className="text-slate-500">{user.name}</span>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="rounded border px-3 py-1">Log out</button>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add "app/page.tsx" "app/(authed)/layout.tsx" components/nav.tsx
git commit -m "feat(ui): authenticated layout with auth gate and nav"
```

---

### Task 10.3: Dashboard page

**Files:** Create `app/(authed)/dashboard/page.tsx`

- [ ] **Step 1: Server component fetching aggregate from DB directly**

```tsx
// app/(authed)/dashboard/page.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id as string;
  const now = new Date();

  const [byStatus, overdue, projects] = await Promise.all([
    prisma.task.groupBy({ by: ["status"], where: { assigneeId: userId }, _count: { _all: true } }),
    prisma.task.count({ where: { assigneeId: userId, dueDate: { lt: now }, status: { not: "DONE" } } }),
    prisma.project.findMany({
      where: { memberships: { some: { userId } } },
      include: { _count: { select: { tasks: true } }, memberships: { where: { userId }, select: { role: true } } },
      take: 12,
    }),
  ]);
  const counts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 } as Record<string, number>;
  for (const r of byStatus) counts[r.status] = r._count._all;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card label="Open tasks" value={counts.TODO + counts.IN_PROGRESS} />
        <Card label="Done" value={counts.DONE} />
        <Card label="Overdue" value={overdue} accent={overdue > 0 ? "text-red-600" : ""} />
        <Card label="Projects" value={projects.length} />
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Your projects</h2>
          <Link href="/projects" className="text-sm underline">See all</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="rounded-2xl border bg-white p-5 hover:shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{p.name}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{p.memberships[0]?.role}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{p._count.tasks} tasks</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Card({ label, value, accent = "" }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className={`text-3xl font-semibold ${accent}`}>{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(authed)/dashboard"
git commit -m "feat(ui): dashboard page"
```

---

### Task 10.4: Projects list page

**Files:** Create `app/(authed)/projects/page.tsx`, `components/new-project-dialog.tsx`

- [ ] **Step 1: List page**

```tsx
// app/(authed)/projects/page.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NewProjectDialog from "@/components/new-project-dialog";

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session!.user!.id as string;
  const projects = await prisma.project.findMany({
    where: { memberships: { some: { userId } } },
    include: {
      _count: { select: { tasks: true, memberships: true } },
      memberships: { where: { userId }, select: { role: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <NewProjectDialog />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="rounded-2xl border bg-white p-5 hover:shadow">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{p.name}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{p.memberships[0]?.role}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-500">{p.description || "No description"}</p>
            <p className="mt-3 text-xs text-slate-400">{p._count.memberships} members · {p._count.tasks} tasks</p>
          </Link>
        ))}
        {projects.length === 0 && <p className="text-slate-500">No projects yet — create one.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: New-project dialog**

```tsx
// components/new-project-dialog.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      const p = await res.json();
      setOpen(false);
      router.push(`/projects/${p.id}`);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded bg-slate-900 px-4 py-2 text-sm text-white">New project</button>
      {open && (
        <div className="fixed inset-0 z-10 grid place-items-center bg-black/30 p-6">
          <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6">
            <h2 className="text-lg font-semibold">New project</h2>
            <input className="w-full rounded border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <textarea className="w-full rounded border px-3 py-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded border px-3 py-1">Cancel</button>
              <button disabled={busy} className="rounded bg-slate-900 px-3 py-1 text-white disabled:opacity-50">{busy ? "..." : "Create"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/(authed)/projects" components/new-project-dialog.tsx
git commit -m "feat(ui): projects list with create dialog"
```

---

### Task 10.5: Project detail page (tabs + Kanban + members)

**Files:** Create `app/(authed)/projects/[id]/page.tsx`, `components/task-board.tsx`, `components/task-form.tsx`, `components/member-table.tsx`, `components/project-settings.tsx`

- [ ] **Step 1: Project detail server component (data + tab routing via search param)**

```tsx
// app/(authed)/projects/[id]/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import TaskBoard from "@/components/task-board";
import MemberTable from "@/components/member-table";
import ProjectSettings from "@/components/project-settings";
import Link from "next/link";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> };

export default async function ProjectDetail({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab = "tasks" } = await searchParams;
  const session = await auth();
  const userId = session!.user!.id as string;

  const me = await prisma.membership.findUnique({ where: { userId_projectId: { userId, projectId: id } } });
  if (!me) redirect("/projects");

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      memberships: { include: { user: { select: { id: true, name: true, email: true } } } },
      tasks: { include: { assignee: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!project) redirect("/projects");

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="text-sm text-slate-500">{project.description || "No description"}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{me.role}</span>
      </header>
      <nav className="flex gap-2 border-b">
        {[{ k: "tasks", l: "Tasks" }, { k: "members", l: "Members" }, ...(me.role === "ADMIN" ? [{ k: "settings", l: "Settings" }] : [])].map((t) => (
          <Link key={t.k} href={`?tab=${t.k}`} className={`px-3 py-2 text-sm ${tab === t.k ? "border-b-2 border-slate-900 font-medium" : "text-slate-500"}`}>{t.l}</Link>
        ))}
      </nav>
      {tab === "tasks" && (
        <TaskBoard
          projectId={project.id}
          role={me.role}
          currentUserId={userId}
          initialTasks={project.tasks}
          members={project.memberships.map((m) => m.user)}
        />
      )}
      {tab === "members" && (
        <MemberTable projectId={project.id} role={me.role} members={project.memberships} />
      )}
      {tab === "settings" && me.role === "ADMIN" && (
        <ProjectSettings projectId={project.id} initial={{ name: project.name, description: project.description }} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: TaskBoard (Kanban with simple HTML5 drag-and-drop)**

```tsx
// components/task-board.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Task = {
  id: string; title: string; description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
  assigneeId: string | null;
  assignee: { id: string; name: string; email: string } | null;
};
type Member = { id: string; name: string; email: string };

const COLS: Task["status"][] = ["TODO", "IN_PROGRESS", "DONE"];

export default function TaskBoard({
  projectId, role, currentUserId, initialTasks, members,
}: {
  projectId: string;
  role: "ADMIN" | "MEMBER";
  currentUserId: string;
  initialTasks: Task[];
  members: Member[];
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [newOpen, setNewOpen] = useState(false);

  async function move(taskId: string, status: Task["status"]) {
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, status } : t)));
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setNewOpen(true)} className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">New task</button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLS.map((col) => (
          <div
            key={col}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = e.dataTransfer.getData("text/plain");
              const t = tasks.find((x) => x.id === id);
              if (!t || t.status === col) return;
              const canMove = role === "ADMIN" || t.assigneeId === currentUserId;
              if (!canMove) return;
              move(id, col);
            }}
            className="rounded-2xl border bg-white p-3"
          >
            <h3 className="mb-3 text-sm font-semibold text-slate-600">{col.replace("_", " ")}</h3>
            <ul className="space-y-2">
              {tasks.filter((t) => t.status === col).map((t) => (
                <li
                  key={t.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
                  className="cursor-grab rounded-xl border bg-slate-50 p-3 text-sm shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t.title}</span>
                    <PriorityBadge p={t.priority} />
                  </div>
                  {t.dueDate && (
                    <div className={`mt-1 text-xs ${new Date(t.dueDate) < new Date() && t.status !== "DONE" ? "text-red-600" : "text-slate-500"}`}>
                      Due {new Date(t.dueDate).toLocaleDateString()}
                    </div>
                  )}
                  {t.assignee && <div className="mt-1 text-xs text-slate-500">@{t.assignee.name}</div>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {newOpen && (
        <NewTaskDialog
          projectId={projectId}
          members={members}
          onClose={() => setNewOpen(false)}
          onCreated={() => router.refresh()}
        />
      )}
    </div>
  );
}

function PriorityBadge({ p }: { p: Task["priority"] }) {
  const cls = p === "HIGH" ? "bg-red-100 text-red-700" : p === "MEDIUM" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600";
  return <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{p}</span>;
}

function NewTaskDialog({
  projectId, members, onClose, onCreated,
}: { projectId: string; members: Member[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM", assigneeId: "", dueDate: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const body: Record<string, unknown> = {
      title: form.title,
      description: form.description,
      priority: form.priority,
    };
    if (form.assigneeId) body.assigneeId = form.assigneeId;
    if (form.dueDate) body.dueDate = new Date(form.dueDate).toISOString();
    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error ?? "Failed");
      return;
    }
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-10 grid place-items-center bg-black/30 p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-3 rounded-2xl bg-white p-6">
        <h2 className="text-lg font-semibold">New task</h2>
        <input className="w-full rounded border px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="w-full rounded border px-3 py-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <select className="rounded border px-3 py-2" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <input type="date" className="rounded border px-3 py-2" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </div>
        <select className="w-full rounded border px-3 py-2" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
          <option value="">Unassigned</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded border px-3 py-1">Cancel</button>
          <button disabled={busy} className="rounded bg-slate-900 px-3 py-1 text-white disabled:opacity-50">{busy ? "..." : "Create"}</button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: MemberTable**

```tsx
// components/member-table.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string; role: "ADMIN" | "MEMBER";
  user: { id: string; name: string; email: string };
};

export default function MemberTable({ projectId, role, members }: { projectId: string; role: "ADMIN" | "MEMBER"; members: Member[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, role: newRole }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d.error ?? "Failed");
      return;
    }
    setEmail("");
    router.refresh();
  }

  async function changeRole(userId: string, r: "ADMIN" | "MEMBER") {
    const res = await fetch(`/api/projects/${projectId}/members/${userId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: r }),
    });
    if (res.ok) router.refresh();
    else alert((await res.json()).error);
  }

  async function remove(userId: string) {
    if (!confirm("Remove this member?")) return;
    const res = await fetch(`/api/projects/${projectId}/members/${userId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert((await res.json()).error);
  }

  return (
    <div className="space-y-4">
      {role === "ADMIN" && (
        <form onSubmit={add} className="flex flex-wrap items-center gap-2 rounded-2xl border bg-white p-3">
          <input className="flex-1 rounded border px-3 py-2" type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <select className="rounded border px-3 py-2" value={newRole} onChange={(e) => setNewRole(e.target.value as "ADMIN" | "MEMBER")}>
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button disabled={busy} className="rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50">Add</button>
          {err && <span className="text-sm text-red-600">{err}</span>}
        </form>
      )}
      <table className="w-full overflow-hidden rounded-2xl border bg-white text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3"></th></tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-t">
              <td className="p-3">{m.user.name}</td>
              <td className="p-3 text-slate-500">{m.user.email}</td>
              <td className="p-3">
                {role === "ADMIN" ? (
                  <select value={m.role} onChange={(e) => changeRole(m.user.id, e.target.value as "ADMIN" | "MEMBER")} className="rounded border px-2 py-1">
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                ) : m.role}
              </td>
              <td className="p-3 text-right">
                {role === "ADMIN" && (
                  <button onClick={() => remove(m.user.id)} className="text-red-600">Remove</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: ProjectSettings**

```tsx
// components/project-settings.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectSettings({ projectId, initial }: { projectId: string; initial: { name: string; description: string } }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    router.refresh();
  }

  async function destroy() {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (res.ok) router.push("/projects");
  }

  return (
    <div className="space-y-6 rounded-2xl border bg-white p-6">
      <form onSubmit={save} className="space-y-3">
        <h3 className="text-lg font-medium">Settings</h3>
        <input className="w-full rounded border px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <textarea className="w-full rounded border px-3 py-2" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button disabled={busy} className="rounded bg-slate-900 px-3 py-1 text-white disabled:opacity-50">Save</button>
      </form>
      <div className="border-t pt-4">
        <button onClick={destroy} className="rounded border border-red-300 px-3 py-1 text-red-700">Delete project</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add "app/(authed)/projects/[id]" components/task-board.tsx components/member-table.tsx components/project-settings.tsx
git commit -m "feat(ui): project detail with tabs, kanban, members, settings"
```

---

## Phase 11 — API Integration Tests

### Task 11.1: Test harness for route handlers

**Files:** Create `tests/helpers.ts`, `tests/api/auth.test.ts`

**Note:** Tests use a separate test DB. Set `DATABASE_URL` for test runs to a Postgres test database (local docker container or a separate Railway dev branch).

- [ ] **Step 1: Test helper that resets DB and creates users**

```ts
// tests/helpers.ts
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function resetDb() {
  await prisma.task.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
}

export async function makeUser(email: string, name = email.split("@")[0]) {
  return prisma.user.create({
    data: { email, name, passwordHash: await bcrypt.hash("abcd1234", 4) },
  });
}
```

- [ ] **Step 2: Auth test — signup happy + duplicate**

```ts
// tests/api/auth.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { POST as signup } from "@/app/api/auth/signup/route";
import { resetDb } from "../helpers";

function req(body: unknown) {
  return new Request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as any;
}

describe("POST /api/auth/signup", () => {
  beforeEach(async () => { await resetDb(); });

  it("creates a user", async () => {
    const res = await signup(req({ email: "a@b.com", name: "A", password: "abcd1234" }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.email).toBe("a@b.com");
  });

  it("rejects duplicate email", async () => {
    await signup(req({ email: "a@b.com", name: "A", password: "abcd1234" }));
    const res = await signup(req({ email: "a@b.com", name: "B", password: "abcd1234" }));
    expect(res.status).toBe(409);
  });

  it("rejects bad password", async () => {
    const res = await signup(req({ email: "a@b.com", name: "A", password: "short" }));
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 3: Run tests against test DB**

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ethara_test pnpm test -- tests/api/auth.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add tests/helpers.ts tests/api/auth.test.ts
git commit -m "test(api): signup integration tests"
```

---

### Task 11.2: Project + member + task tests (last-admin guard)

**Files:** Create `tests/api/projects.test.ts`, `tests/api/members.test.ts`, `tests/api/tasks.test.ts`

These tests must mock `@/lib/auth`'s `auth()` to return a session for a specific user.

- [ ] **Step 1: Mock helper for session**

Append to `tests/helpers.ts`:

```ts
import { vi } from "vitest";

export function mockSession(userId: string, email = "user@x.com", name = "User") {
  vi.doMock("@/lib/auth", async (orig) => {
    const actual = (await orig()) as Record<string, unknown>;
    return {
      ...actual,
      auth: async () => ({ user: { id: userId, email, name } }),
    };
  });
}
```

- [ ] **Step 2: Projects test — create + list visible only to members**

```ts
// tests/api/projects.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { resetDb, makeUser } from "../helpers";

beforeEach(async () => {
  vi.resetModules();
  await resetDb();
});

it("creates a project and returns it on list for the creator only", async () => {
  const u1 = await makeUser("u1@x.com");
  const u2 = await makeUser("u2@x.com");

  vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: u1.id, email: u1.email, name: u1.name } }) }));
  const { POST, GET } = await import("@/app/api/projects/route");

  const create = await POST(new Request("http://localhost/api/projects", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "P1" }),
  }) as any);
  expect(create.status).toBe(201);

  const list1 = await (await GET()).json();
  expect(list1).toHaveLength(1);

  vi.resetModules();
  vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: u2.id, email: u2.email, name: u2.name } }) }));
  const { GET: GET2 } = await import("@/app/api/projects/route");
  const list2 = await (await GET2()).json();
  expect(list2).toHaveLength(0);
});
```

- [ ] **Step 3: Members test — last-admin guard**

```ts
// tests/api/members.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb, makeUser } from "../helpers";

beforeEach(async () => { vi.resetModules(); await resetDb(); });

it("rejects demoting the only admin", async () => {
  const admin = await makeUser("admin@x.com");
  const project = await prisma.project.create({
    data: { name: "P", ownerId: admin.id, memberships: { create: { userId: admin.id, role: "ADMIN" } } },
  });
  vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: admin.id, email: admin.email, name: admin.name } }) }));
  const { PATCH } = await import("@/app/api/projects/[id]/members/[userId]/route");
  const res = await PATCH(
    new Request(`http://localhost/api/projects/${project.id}/members/${admin.id}`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ role: "MEMBER" }),
    }) as any,
    { params: Promise.resolve({ id: project.id, userId: admin.id }) },
  );
  expect(res.status).toBe(400);
});
```

- [ ] **Step 4: Tasks test — MEMBER can only update status of own tasks**

```ts
// tests/api/tasks.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb, makeUser } from "../helpers";

beforeEach(async () => { vi.resetModules(); await resetDb(); });

it("rejects MEMBER changing title", async () => {
  const admin = await makeUser("a@x.com");
  const member = await makeUser("m@x.com");
  const project = await prisma.project.create({
    data: {
      name: "P", ownerId: admin.id,
      memberships: { create: [{ userId: admin.id, role: "ADMIN" }, { userId: member.id, role: "MEMBER" }] },
    },
  });
  const task = await prisma.task.create({
    data: { projectId: project.id, title: "T", createdById: admin.id, assigneeId: member.id },
  });
  vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: member.id, email: member.email, name: member.name } }) }));
  const { PATCH } = await import("@/app/api/tasks/[id]/route");
  const res = await PATCH(
    new Request(`http://localhost/api/tasks/${task.id}`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Hacked" }),
    }) as any,
    { params: Promise.resolve({ id: task.id }) },
  );
  expect(res.status).toBe(403);
});

it("allows MEMBER updating status of own task", async () => {
  const admin = await makeUser("a2@x.com");
  const member = await makeUser("m2@x.com");
  const project = await prisma.project.create({
    data: {
      name: "P", ownerId: admin.id,
      memberships: { create: [{ userId: admin.id, role: "ADMIN" }, { userId: member.id, role: "MEMBER" }] },
    },
  });
  const task = await prisma.task.create({
    data: { projectId: project.id, title: "T", createdById: admin.id, assigneeId: member.id },
  });
  vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: member.id, email: member.email, name: member.name } }) }));
  const { PATCH } = await import("@/app/api/tasks/[id]/route");
  const res = await PATCH(
    new Request(`http://localhost/api/tasks/${task.id}`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: "DONE" }),
    }) as any,
    { params: Promise.resolve({ id: task.id }) },
  );
  expect(res.status).toBe(200);
  const updated = await prisma.task.findUnique({ where: { id: task.id } });
  expect(updated?.status).toBe("DONE");
});
```

- [ ] **Step 5: Run integration tests against test DB**

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ethara_test pnpm prisma migrate deploy
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ethara_test pnpm test -- tests/api
```

- [ ] **Step 6: Commit**

```bash
git add tests/
git commit -m "test(api): projects, members, tasks integration tests"
```

---

## Phase 12 — Seed Data

### Task 12.1: Seed script

**Files:** Create `prisma/seed.ts`

- [ ] **Step 1: Write seed**

```ts
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: { email: "admin@demo.com", name: "Demo Admin", passwordHash },
  });
  const alice = await prisma.user.upsert({
    where: { email: "alice@demo.com" },
    update: {},
    create: { email: "alice@demo.com", name: "Alice", passwordHash },
  });
  const bob = await prisma.user.upsert({
    where: { email: "bob@demo.com" },
    update: {},
    create: { email: "bob@demo.com", name: "Bob", passwordHash },
  });

  const project = await prisma.project.create({
    data: {
      name: "Launch website",
      description: "Marketing site rewrite",
      ownerId: admin.id,
      memberships: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: alice.id, role: "MEMBER" },
          { userId: bob.id, role: "MEMBER" },
        ],
      },
      tasks: {
        create: [
          { title: "Hero copy", status: "IN_PROGRESS", priority: "HIGH", assigneeId: alice.id, createdById: admin.id, dueDate: new Date(Date.now() + 86400000 * 2) },
          { title: "Footer redesign", status: "TODO", priority: "MEDIUM", assigneeId: bob.id, createdById: admin.id },
          { title: "Set up analytics", status: "TODO", priority: "LOW", createdById: admin.id, dueDate: new Date(Date.now() - 86400000) },
          { title: "Domain DNS", status: "DONE", priority: "MEDIUM", assigneeId: admin.id, createdById: admin.id },
        ],
      },
    },
  });

  console.log("Seeded project:", project.id);
}

main().finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Run locally**

```bash
pnpm db:seed
```

Expected: prints "Seeded project: <cuid>".

- [ ] **Step 3: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat(db): seed script with demo users and project"
```

---

## Phase 13 — Verification & Polish

### Task 13.1: Local end-to-end smoke

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Manual checks (open http://localhost:3000)**

- Sign up new user → redirected to dashboard
- Log out → redirected to login
- Log in as `admin@demo.com` / `demo1234` → see seeded project
- Open project → see Kanban with seeded tasks; drag a task between columns
- Members tab → add `alice@demo.com` if not already; toggle role
- Create new project → appears in list
- Try to demote sole admin → blocked with message
- Log in as MEMBER, try to edit a task title → blocked

- [ ] **Step 3: Fix any bugs found, then commit**

```bash
git add -A
git commit -m "fix: smoke-test bug fixes"
```

---

### Task 13.2: Run full test suite

- [ ] **Step 1: Run unit + integration tests**

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ethara_test pnpm test
```

Expected: all green.

- [ ] **Step 2: Lint and typecheck**

```bash
pnpm lint
pnpm tsc --noEmit
```

Fix any errors. Commit.

```bash
git add -A
git commit -m "chore: lint and typecheck clean"
```

---

## Phase 14 — Deployment to Railway

### Task 14.1: Push repo to GitHub

- [ ] **Step 1: Create GitHub repo and push**

```bash
gh repo create ethara-task-manager --public --source=. --remote=origin --push
```

(If `gh` is not available, create the repo via the GitHub UI and `git remote add origin <url> && git push -u origin main`.)

---

### Task 14.2: Railway project setup

- [ ] **Step 1: Install Railway CLI (if not installed)**

```bash
pnpm add -g @railway/cli
railway login
```

- [ ] **Step 2: Create Railway project + Postgres plugin**

Use Railway dashboard:
1. New Project → Deploy from GitHub repo → select `ethara-task-manager`.
2. Add → Database → Postgres.
3. In the app service Variables tab, ensure `DATABASE_URL` is referenced from the Postgres plugin (Railway auto-injects on link).
4. Add `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`).
5. Add `NEXTAUTH_URL` once a domain is provisioned (set after first deploy).

- [ ] **Step 3: Configure build/start commands**

In Railway service Settings:
- Build command: `pnpm install --frozen-lockfile && pnpm build`
- Start command: `pnpm start`
- Watch paths: `**`

- [ ] **Step 4: Generate a public domain**

In Settings → Networking → Generate Domain. Copy the URL, set `NEXTAUTH_URL` env var to it, redeploy.

- [ ] **Step 5: Run seed once on Railway**

In the Railway service shell:

```bash
pnpm db:seed
```

- [ ] **Step 6: Verify live**

Open the public URL, log in as `admin@demo.com` / `demo1234`, click around.

---

### Task 14.3: README + demo video

**Files:** Update `README.md`

- [ ] **Step 1: Write README**

```markdown
# Ethara — Team Task Manager

A web app for teams to manage projects, assign tasks, and track progress with role-based access (Admin / Member).

**Live URL:** <paste-railway-url>
**Demo credentials:** `admin@demo.com` / `demo1234`
**Demo video:** <paste-loom-or-drive-link>

## Features
- Email/password auth (NextAuth, JWT cookie sessions)
- Per-project RBAC (Admin / Member)
- Projects with members and tasks
- Kanban task board with drag-to-update status
- Filters: status, assignee, priority, overdue
- Personal dashboard

## Tech stack
Next.js 15 (App Router), TypeScript, Prisma, Postgres, NextAuth v5, Tailwind, shadcn/ui, Zod, Vitest. Deployed on Railway.

## Local setup
```bash
pnpm install
cp .env.example .env  # fill DATABASE_URL etc.
pnpm prisma migrate dev
pnpm db:seed
pnpm dev
```

## Architecture
Single Next.js service. Route Handlers under `/app/api/*` expose REST. RBAC enforced in `lib/rbac.ts`. Validators in `lib/validators/`.

## Tests
```bash
DATABASE_URL=...test_db pnpm test
```
```

- [ ] **Step 2: Record 2–5 minute demo video**

Walk through: signup → create project → add member → create tasks → drag on Kanban → role-switch demo (member can only update own task status) → dashboard view → live URL.

- [ ] **Step 3: Commit + push**

```bash
git add README.md
git commit -m "docs: README with live URL, credentials, and demo link"
git push
```

---

## Phase 15 — Submission

- [ ] **Step 1: Verify submission checklist**

- [ ] Live URL works in incognito, login succeeds
- [ ] GitHub repo public, README links correct
- [ ] Demo video link plays (test in incognito too)
- [ ] All required features visible: signup/login, projects, members, tasks, RBAC, dashboard

- [ ] **Step 2: Submit links**

Submit Live URL + GitHub repo + demo video link as required by the assignment.

---

## Notes

- **UI polish budget:** Phase 9 (Stitch) is the most variable. If iteration runs long, ship with the working Tailwind components from Phase 10 (already present in this plan as concrete code) and treat Stitch screens as a follow-up improvement.
- **Test DB:** Integration tests assume a separate `ethara_test` database. Bring up via Docker:
  ```bash
  docker run --name pg-test -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ethara_test -p 5432:5432 -d postgres:16
  ```
- **Railway cold start:** First request after deploy may take ~10–20s while migrations run.
