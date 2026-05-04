# Team Task Manager — Design Spec

**Date:** 2026-05-04
**Author:** Shubham (shubhamsm04@gmail.com)
**Timeline:** 1–2 days (8–12 hours)
**Deployment target:** Railway (mandatory; app must be live)

## 1. Goal

A web app where users sign up, create projects, invite teammates, assign and track tasks, and view a personal dashboard. Per-project role-based access control (Admin/Member) governs who can do what inside a given project.

## 2. Tech Stack

- **Framework:** Next.js 15 (App Router) — full-stack, single Railway service
- **UI:** React Server Components + Client Components where interactivity is needed; Tailwind CSS + shadcn/ui
- **High-fidelity UI generation:** Use the **stitch-design** skill to design polished screens and a design system, then **react-components** to convert them into components, adapted for Next.js App Router. UI quality bar is "really polished" per user requirement.
- **Database:** Postgres (Railway plugin) via Prisma ORM
- **Auth:** NextAuth (Auth.js) v5, Credentials provider, JWT session in httpOnly cookie
- **Validation:** Zod schemas shared between API handlers and client forms
- **Testing:** Vitest for unit + a handful of route-handler integration tests
- **Repo:** single Next.js app

## 3. Architecture

```
Browser ──HTTPS──▶ Next.js (Railway service)
                     ├── App Router pages (RSC + Client)
                     ├── /api/* Route Handlers (REST)
                     ├── auth() helper (NextAuth)
                     └── Prisma ──▶ Postgres (Railway plugin)
```

- All API endpoints are Next.js Route Handlers under `/app/api/*` returning JSON.
- A single `requireProjectRole(userId, projectId, role)` helper enforces RBAC at the top of every project-scoped route handler.
- Migrations are committed; `prisma migrate deploy` runs on Railway start.

## 4. Data Model (Prisma)

All ids are `cuid`. Every table has `createdAt` and `updatedAt`.

### User
- `id`, `email` (unique), `name`, `passwordHash`

### Project
- `id`, `name`, `description`, `ownerId` → User

### Membership
- `id`, `userId` → User, `projectId` → Project, `role` (`ADMIN` | `MEMBER`)
- Unique constraint on `(userId, projectId)`
- Project creator gets an `ADMIN` Membership row automatically

### Task
- `id`, `projectId` → Project, `title`, `description`
- `status` (`TODO` | `IN_PROGRESS` | `DONE`)
- `priority` (`LOW` | `MEDIUM` | `HIGH`)
- `dueDate` (nullable)
- `assigneeId` → User (nullable)
- `createdById` → User

### NextAuth tables
- With JWT sessions + Credentials provider, no Account/Session tables are required for the initial scope. Add them later only if OAuth providers are introduced.

### Rules
- A Task's `assigneeId` must reference a user with a Membership in the same project (enforced in the API layer).
- Deleting a Project cascades to its Memberships and Tasks.
- Removing a Membership nulls out that user's `assigneeId` on tasks in that project (tasks are kept, not deleted).
- A project must always have at least one ADMIN; the API rejects role changes / removals that would violate this.

## 5. REST API

All routes return JSON. All routes except `/api/auth/*` and `POST /api/auth/signup` require an authenticated session. Errors use shape `{ error: string, details?: ... }` with appropriate HTTP status codes.

### Auth
| Method | Path | Body | Notes |
|--------|------|------|-------|
| POST | `/api/auth/signup` | `{ email, name, password }` | Creates User; bcrypt-hash password |
| ALL  | `/api/auth/[...nextauth]` | — | NextAuth handler (login/logout/session) |

### Projects
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET    | `/api/projects` | session | Lists projects current user is a member of |
| POST   | `/api/projects` | session | Body `{ name, description }`; creates project + ADMIN membership for creator |
| GET    | `/api/projects/:id` | membership | Project detail with members + task summary |
| PATCH  | `/api/projects/:id` | ADMIN | Update name/description |
| DELETE | `/api/projects/:id` | ADMIN | Cascades |

### Members
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET    | `/api/projects/:id/members` | membership | List |
| POST   | `/api/projects/:id/members` | ADMIN | `{ email, role }` — adds existing user |
| PATCH  | `/api/projects/:id/members/:userId` | ADMIN | Change role; rejects last-admin demotion |
| DELETE | `/api/projects/:id/members/:userId` | ADMIN | Rejects last-admin removal; nulls task assignments |

### Tasks
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET    | `/api/projects/:id/tasks` | membership | Filters: `?status=&assigneeId=&overdue=true&priority=` |
| POST   | `/api/projects/:id/tasks` | membership | Create task |
| GET    | `/api/tasks/:id` | project membership | Detail |
| PATCH  | `/api/tasks/:id` | role-gated | ADMIN edits any field; MEMBER may only update `status` of tasks assigned to them |
| DELETE | `/api/tasks/:id` | ADMIN | — |

### Dashboard
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/me/dashboard` | session | Aggregate: my tasks grouped by status, overdue count, per-project summary |

## 6. UI Pages

Tailwind + shadcn/ui. Pages behind auth except `/login` and `/signup`. **The high-fidelity visual design is produced via the stitch-design skill; components are then assembled with the react-components skill and integrated into the Next.js App Router.**

- `/login`, `/signup` — simple forms; redirect to `/dashboard` on success.
- `/dashboard` — cards for *My open tasks*, *Overdue*, *Done this week*; list of my projects with task counts; "New project" button.
- `/projects` — list of all projects I'm in, with role badge.
- `/projects/[id]` — project home with tabs:
  - **Tasks** (default) — Kanban columns (TODO / IN_PROGRESS / DONE), drag-to-update status, filter bar (assignee, overdue, priority), "New task".
  - **Members** — member table with role; ADMIN sees add/remove/role-change controls.
  - **Settings** — ADMIN-only; rename/delete project.
- `/tasks/[id]` — detail page or modal with full edit form (permissions enforced per role).
- Top nav — logo, *Dashboard*, *Projects*, user menu (logout).

## 7. Validation & Error Handling

- Zod schemas live in `lib/validators/` and are imported by API handlers and client forms.
- Every handler runs `schema.safeParse(input)`; failures → 400 with per-field errors.
- Constraints: email format, password min length 8, name lengths, enum values for `status` / `role` / `priority`.
- Single `apiError(status, message)` helper. Status codes: 400 validation, 401 unauthenticated, 403 wrong role, 404 not found, 500 unhandled (generic message, full stack logged).

## 8. Testing

Pragmatic, time-boxed:
- **Vitest unit tests** for `requireProjectRole` and the Zod validators.
- **Route-handler integration tests** for the critical paths: signup, login, create project, add member, create task, role-gated task update, last-admin protection.
- No E2E in this round. Manual smoke test the deployed app before recording the demo video.

## 9. Deployment (Railway)

- Two Railway services: **Postgres plugin** and the **Next.js app**.
- Env vars on the app service: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
- **Build:** `prisma generate && next build`
- **Start:** `prisma migrate deploy && next start`
- **Seed:** `prisma/seed.ts` creates a demo admin user, a sample project with a few members and tasks — used for the demo video and reviewer access.

## 10. Repo Structure

```
/
├── app/
│   ├── (auth)/login, signup
│   ├── (authed)/dashboard, projects, tasks
│   └── api/...
├── components/
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── db.ts              # Prisma client singleton
│   ├── rbac.ts            # requireProjectRole helper
│   └── validators/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
├── README.md
└── package.json
```

## 11. README Requirements

- Project description and feature list
- Live URL + demo credentials
- Local setup (env vars, `prisma migrate dev`, `pnpm dev`)
- Scripts reference
- Tech stack
- Link to demo video (2–5 min)
- Architecture diagram (simple)

## 12. Out of Scope (YAGNI)

- OAuth providers (Google/GitHub login)
- Email invites for non-existing users (members must already have an account)
- File attachments on tasks
- Real-time updates (no websockets); page refresh / re-fetch on action is fine
- Notifications
- Mobile-native app
- Audit log

## 13. Open Risks / Watch Items

- **Time pressure:** Polished UI via Stitch is the most variable cost. Budget it explicitly and fall back to clean shadcn defaults if Stitch iteration runs long.
- **NextAuth v5 + Prisma adapter quirks:** With JWT sessions and Credentials only, no adapter is needed — keep it that way to avoid setup drag.
- **Railway build timeout:** Ensure `prisma generate` runs in build, not start, to keep cold-start fast.
- **Last-admin invariant:** Easy to forget on the role-PATCH and member-DELETE endpoints. Cover both with tests.
