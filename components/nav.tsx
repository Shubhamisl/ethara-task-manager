"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function Nav({
  user,
}: {
  user: { name: string; email: string };
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          Ethara
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link className="text-slate-700 hover:text-slate-950" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-slate-700 hover:text-slate-950" href="/projects">
            Projects
          </Link>
          <span className="hidden max-w-32 truncate text-slate-500 sm:inline">
            {user.name || user.email}
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="h-9 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
