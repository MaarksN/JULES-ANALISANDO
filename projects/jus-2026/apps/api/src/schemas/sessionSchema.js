import { z } from 'zod';

export const sessionSchema = z.object({
    id: z.string().optional(),
    agentId: z.string().min(2).max(100).optional(),
    title: z.string().min(1).max(200),
    messages: z.array(z.any()).optional(),
    dossier: z.array(z.any()).optional(),
    caseType: z.enum(['CIVEL', 'TRABALHISTA', 'FAMILIA', 'PREVIDENCIARIO', 'EMPRESARIAL']).default('CIVEL'),
    status: z.enum(['active', 'archived', 'closed']).optional(),
    area: z.string().max(80).optional(),
    deleted: z.boolean().optional()
});
