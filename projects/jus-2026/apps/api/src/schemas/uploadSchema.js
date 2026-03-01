import { z } from 'zod';

export const uploadSchema = z.object({
    documentType: z.enum(['PETITION', 'CONTRACT', 'EVIDENCE', 'OTHER']).default('OTHER'),
    sessionId: z.string().min(2).max(120)
});
