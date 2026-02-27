import { z } from 'zod';
import { ValidationError } from '../errors/AppError.js';

export const sanitizeText = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/[\x00-\x1F\x7F]/g, '').normalize('NFKC').trim();
};

export const validatePayload = (schema) => (req, res, next) => {
    try {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return next(new ValidationError('Dados de entrada inválidos.', result.error.format()));
        }

        req.safeBody = result.data;
        req.body = result.data;
        next();
    } catch (e) {
        next(new ValidationError('Falha ao validar o payload da requisição.'));
    }
};

export const schemas = {
    petition: z.object({
        title: z.string().min(5).max(200).transform(sanitizeText),
        area: z.enum(['Cível', 'Trabalhista', 'Família', 'Previdenciário']),
        content: z.string().max(50000).optional().transform(sanitizeText),
        priority: z.boolean().default(false)
    })
};
