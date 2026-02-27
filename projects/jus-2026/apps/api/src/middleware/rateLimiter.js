import rateLimit from 'express-rate-limit';

const CRITICAL_ENDPOINTS = [/\/payment\//, /\/webhooks\//, /\/audit\//, /\/auth\//];

const isCriticalEndpoint = (path) => CRITICAL_ENDPOINTS.some((matcher) => matcher.test(path));

/**
 * Item 4: Rate Limiting por Plano (SLA-Based)
 */
export const enterpriseLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (req) => {
        if (isCriticalEndpoint(req.path)) return 60;
        if (req.user?.role === 'admin') return 1000;
        if (req.user?.role === 'premium') return 500;
        return 100;
    },
    keyGenerator: (req) => {
        const tenant = req.user?.tenantId || req.ip;
        return `${tenant}:${req.path}`;
    },
    skip: (req) => req.path.startsWith('/health'),
    handler: (req, res) => {
        res.status(429).json({
            requestId: req.requestId,
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Cota de uso excedida para seu plano. Aguarde alguns instantes.'
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});
