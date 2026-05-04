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
