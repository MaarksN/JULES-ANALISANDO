import { z } from 'zod';

export const chatSchema = z.object({
    message: z.string().min(2).max(10000),
    agentId: z.enum(['PETITION', 'CONTRACT_REVIEW', 'JURISPRUDENCE', 'GENERIC']),
    caseId: z.string().optional(),
    stream: z.boolean().default(false),
    taskType: z.enum(['PETITION', 'CONTRACT_REVIEW', 'LEGAL_ANALYSIS', 'SUMMARY', 'CHAT_SIMPLE', 'RAG_RETRIEVAL']).optional(),
    documentPages: z.number().int().min(0).max(2000).optional()
});
