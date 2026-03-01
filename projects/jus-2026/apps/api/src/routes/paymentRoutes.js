import express from 'express';
import * as PaymentService from '../payment.js';
import { validatePayload } from '../middleware/payloadValidator.js';
import { checkoutSchema } from '../schemas/paymentSchema.js';
import { AuthError } from '../errors/AppError.js';

const router = express.Router();

router.post('/checkout', validatePayload(checkoutSchema), async (req, res, next) => {
    try {
        if (!req.user || !req.user.uid) throw new AuthError('Usuário não autenticado.');

        const { priceId } = req.safeBody;
        const session = await PaymentService.createCheckoutSession(priceId, req.user.uid);
        res.json(session);
    } catch (error) {
        next(error);
    }
});

export default router;
