import { logger } from '../utils/logger.js';

const HEALTH_PATHS = new Set(['/health', '/health/live', '/health/ready']);

export const requestLogger = (req, res, next) => {
    const startedAt = req.startedAt || Date.now();

    res.on('finish', () => {
        if (HEALTH_PATHS.has(req.path)) return;

        const durationMs = Date.now() - startedAt;
        const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

        logger[level]('http_request', {
            requestId: req.requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            durationMs,
            tenantId: req.user?.tenantId,
            actorId: req.user?.uid
        });
    });

    next();
};
