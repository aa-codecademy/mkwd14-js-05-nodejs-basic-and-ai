import { z } from "zod";

// Request schema for creating new reminders (required name, optional isCompleted).
export const createReminderSchema = z.object({
  name: z
    .string()
    .min(5, "Name must be at least 2 characters")
    .max(50, "Name cannot be more than 50 characters long"),
  isCompleted: z.boolean().optional(),
});

// For updates we allow partial payloads, because clients usually send only changed fields.
// This can also be written as createReminderSchema.partial().

export const updateReminderSchema = z.object({
  name: z
    .string()
    .min(5, "Name must be at least 2 characters")
    .max(50, "Name cannot be more than 50 characters long")
    .optional(),
  isCompleted: z.boolean().optional(),
});
