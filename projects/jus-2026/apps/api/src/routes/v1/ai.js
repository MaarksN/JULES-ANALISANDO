import express from 'express';
import { z } from 'zod';
import { aiOrchestrator } from '../../services/aiOrchestrator.js';
import { ragService } from '../../services/ragService.js';
import { tokenService } from '../../services/tokenService.js';
import { postProcessResponse } from '../../services/hallucinationGuard.js';
import { validatePayload } from '../../middleware/payloadValidator.js';
import { PROMPTS } from '../../data/prompts/v1.js';
import { modelRouter } from '../../services/modelRouter.js';
import { planService } from '../../services/planService.js';
import { AIQuotaError } from '../../errors/AppError.js';
import { chatSchema } from '../../schemas/chatSchema.js';

const router = express.Router();
const buildRequestId = () => `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const chatSchema = z.object({
    message: z.string().min(2).max(10000),
    agentId: z.enum(['PETITION', 'CONTRACT_REVIEW', 'JURISPRUDENCE', 'GENERIC']),
    caseId: z.string().optional(),
    stream: z.boolean().default(false)
});

router.post('/chat', validatePayload(chatSchema), async (req, res) => {
    const requestId = buildRequestId();
    const { message, agentId, caseId } = req.body;
    const { tenantId, uid } = req.user;
    const safeMessage = String(message || '').trim();

    await tokenService.checkQuota(tenantId, 2000);

    let contextData = { context: '', sources: [], documents: [], jurisprudence: [] };
    if (caseId) contextData = await ragService.retrieveContext(safeMessage, req.user, { caseId });

    const systemPrompt = PROMPTS[agentId] || PROMPTS.GENERIC;
    const aiResponse = await aiOrchestrator.generate(safeMessage, contextData, {
        tenantId,
        userId: uid,
        model: 'gemini-1.5-pro',
        fallbackModel: 'gpt-4o',
        systemPrompt
    });

    const integrityCheck = postProcessResponse(aiResponse.text, contextData.documents);
    await tokenService.deductUsage(tenantId, uid, Math.ceil(aiResponse.tokensUsed), aiResponse.model);

    res.json({
        requestId,
        text: aiResponse.text,
        sources: aiResponse.sources,
        integrity: integrityCheck,
        metadata: { model: aiResponse.model, tokensUsed: aiResponse.tokensUsed }
    });
});

router.get('/stream', async (req, res, next) => {
    const requestId = buildRequestId();
    try {
        const { sessionId, prompt = '', caseId } = req.query;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        if (!sessionId || !prompt) {
            res.write(`event: error\ndata: ${JSON.stringify({ requestId, error: 'sessionId e prompt são obrigatórios' })}\n\n`);
            res.end();
            return;
        }

        const safePrompt = String(prompt).trim();
        if (!safePrompt) {
            res.write(`event: error\ndata: ${JSON.stringify({ requestId, error: 'prompt vazio' })}\n\n`);
            res.end();
            return;
        }

        let closed = false;
        req.on('close', () => { closed = true; });

        const keepAlive = setInterval(() => {
            if (!closed) res.write(': ping\n\n');
        }, 15000);

        let contextData = { context: '', sources: [], documents: [], jurisprudence: [] };
        if (caseId) contextData = await ragService.retrieveContext(safePrompt, req.user, { caseId: String(caseId) });

        const streamResult = await aiOrchestrator.generateStream(safePrompt, contextData, { model: 'gemini-1.5-pro' });

        let fullText = '';
        for await (const chunk of streamResult.stream) {
            if (closed) break;
            const token = chunk.text();
            if (!token) continue;
            fullText += token;
            res.write(`event: token\ndata: ${JSON.stringify({ requestId, token })}\n\n`);
        }

        clearInterval(keepAlive);

        const integrity = postProcessResponse(fullText, contextData.documents);
        if (!closed) {
            res.write(`event: done\ndata: ${JSON.stringify({ requestId, done: true, sources: streamResult.sources, integrity })}\n\n`);
            res.end();
        }
    } catch (error) {
        next(error);
    }
});

export default router;
