import express from 'express';
import { z } from 'zod';
import { validateCitationsBatch } from '../../services/legalValidator.js';
import { checkPlan } from '../../middleware/checkPlan.js';
import { ValidationError } from '../../errors/AppError.js';

const router = express.Router();

const citationSchema = z.object({
    citations: z.array(z.string().min(3)).min(1).max(50)
});

router.post('/citations', checkPlan('legalValidation'), async (req, res, next) => {
    try {
        const parsed = citationSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new ValidationError('Envie um array de citações para validação.', parsed.error.format());
        }

        const result = await validateCitationsBatch(parsed.data.citations);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
