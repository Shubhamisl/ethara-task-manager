# Ethara - Team Task Manager

A full-stack web app for teams to manage projects, assign tasks, and track progress with role-based access.

**Live URL:** Pending Railway deployment  
**Demo credentials:** `admin@demo.com` / `demo1234`  
**Demo video:** Pending recording

## Features

- Email/password auth with NextAuth credentials and JWT sessions
- Per-project RBAC with Admin and Member roles
- Projects with members and tasks
- Kanban task board with drag-to-update status
- Task priority, assignee, due date, and overdue state
- Personal dashboard with task and project summary

## Tech Stack

Next.js 16 App Router, React 19, TypeScript, Prisma 7, Postgres, NextAuth v5, Tailwind 4, shadcn/ui primitives, Zod, Vitest, pnpm.

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm prisma migrate deploy
pnpm db:seed
pnpm dev
```

Set `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` in `.env` before running database commands.

## Architecture

This is a single Next.js service. Route handlers under `app/api/*` expose the REST API. Authentication lives in `lib/auth.ts`, RBAC enforcement lives in `lib/rbac.ts`, validation schemas live in `lib/validators/*`, and Prisma is configured through `lib/db.ts`.

## Tests

Unit tests:

```bash
pnpm test -- tests/unit
```

Integration tests require a Postgres test database:

```bash
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ethara_test?schema=public"
pnpm prisma db push
pnpm test -- tests/api
```

Full local verification:

```bash
pnpm lint
pnpm tsc --noEmit
pnpm build
```
