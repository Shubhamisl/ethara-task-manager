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
