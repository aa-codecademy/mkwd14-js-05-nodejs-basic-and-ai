import { z } from 'zod';

export const createReminderSchema = z.object({
	name: z
		.string()
		.min(5, 'Name must be at least 2 characters')
		.max(50, 'Name cannot be more than 50 characters long'),
	isCompleted: z.boolean(),
});

// export const updateReminderSchema = createReminderSchema.partial();

export const updateReminderSchema = z.object({
	name: z
		.string()
		.min(5, 'Name must be at least 2 characters')
		.max(50, 'Name cannot be more than 50 characters long')
		.optional(),
	isCompleted: z.boolean().optional(),
});
