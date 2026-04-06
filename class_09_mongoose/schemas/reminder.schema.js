import { z } from "zod";

// DTO/request validation schema (API boundary validation).
// This validation runs before data reaches Mongoose model methods.
export const createReminderSchema = z.object({
  name: z
    .string()
    .min(5, "Name must be at least 2 characters")
    .max(50, "Name cannot be more than 50 characters long"),
  isCompleted: z.boolean().optional(),
});

// Update schema allows partial updates (client can send only changed fields).

export const updateReminderSchema = z.object({
  name: z
    .string()
    .min(5, "Name must be at least 2 characters")
    .max(50, "Name cannot be more than 50 characters long")
    .optional(),
  isCompleted: z.boolean().optional(),
});
