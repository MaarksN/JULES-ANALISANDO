import crypto from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * Middleware global de erros em RFC 7807.
 */
export const globalErrorHandler = (err, req, res, next) => {
    const errorId = crypto.randomUUID();
    const requestId = req.requestId || req.get?.('x-request-id') || undefined;

    // Log detalhado para backend (Sentry/Cloud Logging)
    logger.error('http_error', {
        errorId,
        path: req.path,
        method: req.method,
        requestId,
        tenant: req.user?.tenantId,
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? 'HIDDEN' : err.stack
    });

    // Tratamento de erros conhecidos
    if (err.type === 'entity.parse.failed') { // JSON malformado
        return res.status(400).json({ requestId, errorId, error: 'INVALID_JSON', message: 'Payload JSON inválido.' });
    }

    // Resposta genérica segura para o cliente
    res.status(err.status || 500).json({
        requestId,
        errorId,
        error: 'INTERNAL_ERROR',
        message: 'Ocorreu um erro interno na plataforma. Contate o suporte informando o ID do erro.'
    });
};
