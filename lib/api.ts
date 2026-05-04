import { NextResponse } from "next/server";
import { type ZodError } from "zod";
import { auth } from "@/lib/auth";

export class RoleError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function apiError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: message, ...(details ? { details } : {}) }, { status });
}

export function zodError(err: ZodError) {
  return apiError(400, "Validation failed", err.flatten().fieldErrors);
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new RoleError(401, "Unauthorized");
  return session.user as { id: string; email: string; name: string };
}

export function handleApiError(err: unknown) {
  if (err instanceof RoleError) return apiError(err.status, err.message);
  console.error("Unhandled API error:", err);
  return apiError(500, "Internal server error");
}
