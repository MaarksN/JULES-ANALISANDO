import * as AuditService from '../audit.js';
import { sanitizeAndTruncate } from '../utils.js';

export const auditLog = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const userId = req.body.userId || (req.user ? req.user.uid : 'Anon');
    console.log(`[AUDIT ${timestamp}] ${req.method} ${req.path} - UserID: ${userId}`);
    if (req.method !== 'GET') {
        const sanitizedBody = sanitizeAndTruncate(req.body);
        AuditService.logAction(userId, `${req.method} ${req.path}`, sanitizedBody);
    }
    next();
};
