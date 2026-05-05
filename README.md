# Ethara Task Manager

A full-stack team task management web app for creating projects, inviting members, assigning tasks, and tracking progress through a clean dashboard and Kanban-style task board.

## Links

- **Source code:** https://github.com/Shubhamisl/ethara-task-manager
- **Live app:** `https://ethara-task-manager-production-2d62.up.railway.app`

## Demo Accounts

After running the seed script, you can use these demo users:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | `demo1234` |
| Member | `alice@demo.com` | `demo1234` |
| Member | `bob@demo.com` | `demo1234` |

## Features

- Email/password authentication using NextAuth/Auth.js credentials flow
- JWT-based sessions
- User signup and login
- Project creation and project listing
- Per-project role-based access control
- Admin and Member roles
- Project detail page with task, member, and settings tabs
- Kanban board with `To do`, `In progress`, and `Done` columns
- Drag-and-drop task status updates
- Task priority, assignee, due date, and overdue indicators
- Personal dashboard with assigned task metrics
- Project progress summary
- Member management for project teams
- Server-side validation using Zod
- Prisma/PostgreSQL data layer
- Unit and API test setup using Vitest

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js App Router |
| UI | React, Tailwind CSS, shadcn/ui-style primitives |
| Language | TypeScript |
| Auth | NextAuth/Auth.js credentials provider |
| Database ORM | Prisma |
| Database | PostgreSQL |
| Validation | Zod |
| Testing | Vitest |
| Package manager | pnpm |
| Deployment target | Railway or any Node-compatible platform |

## Project Structure

```text
.
├── app/
│   ├── (auth)/              # Login and signup pages
│   ├── (authed)/            # Authenticated dashboard, projects, tasks
│   ├── api/                 # API route handlers
│   ├── globals.css
│   └── page.tsx             # Redirects to dashboard or login
├── components/              # UI components and feature components
├── lib/
│   ├── auth.ts              # NextAuth/Auth.js configuration
│   ├── db.ts                # Prisma client
│   ├── rbac.ts              # Role access helpers
│   ├── api.ts               # API helpers
│   └── validators/          # Zod validation schemas
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
│   ├── api/
│   └── unit/
├── types/
├── .env.example
├── next.config.ts
├── package.json
└── README.md
```

## Getting Started

### 1. Prerequisites

Install the following before running the project locally:

- Node.js
- pnpm
- PostgreSQL database

### 2. Clone the Repository

```bash
git clone https://github.com/Shubhamisl/ethara-task-manager.git
cd ethara-task-manager
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Configure Environment Variables

Copy the sample environment file:

```bash
cp .env.example .env
```

Update `.env` with your own values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ethara?schema=public"
NEXTAUTH_SECRET="replace-me-with-a-secure-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

For production, set `NEXTAUTH_URL` to your deployed app URL.

### 5. Set Up the Database

For a fresh local database, push the Prisma schema:

```bash
pnpm db:push
```

Seed demo users and sample project data:

```bash
pnpm db:seed
```

### 6. Run the Development Server

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the local development server |
| `pnpm build` | Generate Prisma client and build the Next.js app |
| `pnpm start` | Start the standalone production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Vitest tests |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm db:push` | Push Prisma schema to the database |
| `pnpm db:migrate` | Create and run a local Prisma migration |
| `pnpm db:seed` | Seed demo data |

## Testing

Run all tests:

```bash
pnpm test
```

Run unit tests only:

```bash
pnpm test -- tests/unit
```

Run API tests only:

```bash
pnpm test -- tests/api
```

Before API tests, make sure `DATABASE_URL` points to a test database.

## Production Build

```bash
pnpm build
pnpm start
```

The project is configured for standalone Next.js output, which is suitable for Node-based hosting platforms.

## Railway Deployment Notes

Set these variables in Railway:

```env
DATABASE_URL="your-railway-postgres-url"
NEXTAUTH_SECRET="your-secure-random-secret"
NEXTAUTH_URL="your-live-app-url"
```

Recommended Railway commands:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

For a new Railway PostgreSQL database, run once from the Railway shell or deployment console:

```bash
pnpm db:push
pnpm db:seed
```

## Data Model

The app uses four main database models:

| Model | Purpose |
|---|---|
| `User` | Stores user profile and password hash |
| `Project` | Stores team project information |
| `Membership` | Connects users to projects with roles |
| `Task` | Stores project tasks, status, priority, due dates, and assignees |

Supported task statuses:

- `TODO`
- `IN_PROGRESS`
- `DONE`

Supported priorities:

- `LOW`
- `MEDIUM`
- `HIGH`

Supported roles:

- `ADMIN`
- `MEMBER`

## API Overview

Main API areas:

| Route Area | Purpose |
|---|---|
| `/api/auth/signup` | Create a new account |
| `/api/auth/[...nextauth]` | NextAuth/Auth.js authentication routes |
| `/api/projects` | List and create projects |
| `/api/projects/[id]` | Read, update, or delete a project |
| `/api/projects/[id]/members` | Manage project members |
| `/api/projects/[id]/tasks` | Create and list project tasks |
| `/api/tasks/[id]` | Read, update, or delete a task |
| `/api/me/dashboard` | Dashboard summary data |

## Security Notes

- Passwords are hashed with bcrypt before storage.
- Project access is controlled through membership checks.
- Admin-only operations are protected by role checks.
- Request payloads are validated with Zod.
- Secrets must be stored in environment variables, not committed to GitHub.

