import { z } from 'zod';

export const templateSchema = z.object({
    title: z.string().min(3).max(200),
    content: z.string().min(10).max(120000),
    category: z.string().min(2).max(80).optional(),
    visibility: z.enum(['private', 'firm', 'public']).default('private'),
    userId: z.string().optional()
});
