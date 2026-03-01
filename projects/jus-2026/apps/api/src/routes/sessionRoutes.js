import express from 'express';
import * as SessionService from '../sessions.js';
import { validatePayload } from '../middleware/payloadValidator.js';
import { sessionSchema } from '../schemas/sessionSchema.js';
import { AuthError, ForbiddenError } from '../errors/AppError.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        if (!req.user) throw new AuthError();
        const sessions = await SessionService.getSessions(req.user.uid, req.user.firmId || req.user.tenantId);
        res.json(sessions);
    } catch (error) {
        next(error);
    }
});

router.post('/', validatePayload(sessionSchema), async (req, res, next) => {
    try {
        if (!req.user) throw new AuthError();

        const cleanBody = req.safeBody;
        const sessionData = {
            ...cleanBody,
            userId: req.user.uid,
            firmId: req.user.firmId || req.user.tenantId
        };

        const session = await SessionService.createOrUpdateSession(sessionData);
        res.json(session);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        if (!req.user) throw new AuthError();

        await SessionService.deleteSession(req.params.id, req.user.firmId || req.user.tenantId);
        res.json({ success: true });
    } catch (error) {
        if (error.message === 'Unauthorized') return next(new ForbiddenError('Acesso negado à sessão solicitada.'));
        next(error);
    }
});

export default router;
