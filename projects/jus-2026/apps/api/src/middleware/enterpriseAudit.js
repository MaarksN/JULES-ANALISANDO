import * as AuditService from '../services/auditService.js';
import { logger } from '../utils/logger.js';

/**
 * Item 16: Log Masking (PII Protection)
 */
export const maskPII = (data) => {
    if (!data) return data;
    let str = JSON.stringify(data);
    // Mascara CPF (123.456.789-00 -> ***.***.***-**)
    str = str.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, "***.***.***-**");
    // Mascara Email (exceto domínio)
    str = str.replace(/([a-zA-Z0-9._-]+)(@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, (match, user, domain) => {
        return `${user.substring(0, 3)}***${domain}`;
    });
    return JSON.parse(str);
};

/**
 * Item 3: Auditoria Imutável (Audit Trace v2)
 */
export const enterpriseAuditLog = (req, res, next) => {
    const start = Date.now();

    // Hook na finalização da resposta
    res.on('finish', () => {
        // Não auditar Health Checks para não poluir logs
        if (req.path === '/health' || req.path === '/api/health') return;

        const log = {
            tenantId: req.user?.tenantId || 'anonymous',
            actorId: req.user?.uid || 'anonymous',
            requestId: req.requestId,
            action: `${req.method} ${req.path}`,
            details: maskPII({
                requestId: req.requestId,
                query: req.query,
                body: req.method !== 'GET' ? req.body : undefined, // Cuidado com body muito grande
                ip: req.ip,
                userAgent: req.get('User-Agent')
            }),
            latency: Date.now() - start,
            status: res.statusCode,
            timestamp: new Date().toISOString()
        };

        // Fire and forget - não bloqueia a resposta
        AuditService.logAction(log.tenantId, log.actorId, log.action, log.details)
            .catch(err => logger.error('audit_write_failed', { requestId: req.requestId, error: err.message }));
    });

    next();
};
