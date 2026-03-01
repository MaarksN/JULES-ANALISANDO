// apps/api/src/middleware/complianceMiddleware.js
import { db } from '../db.js';

// Phase 12: Kill Switch & Risk Management
export const complianceCheck = async (req, res, next) => {
    // 1. Verify Tenant Context (Phase 11 Requirement)
    if (!req.user || !req.user.firmId) {
        // Allow public/health routes to bypass if needed, but generally deny
        return res.status(401).json({ error: "Contexto de Tenant não identificado." });
    }

    const tenantId = req.user.firmId;

    try {
        // 2. Kill Switch Check (Cache this in Redis in production)
        const tenantDoc = await db.collection('tenants').doc(tenantId).get();

        if (tenantDoc.exists) {
            const data = tenantDoc.data();
            if (data.status === 'suspended' || data.killSwitchActive) {
                console.warn(`[COMPLIANCE] Blocked access for suspended tenant: ${tenantId}`);
                return res.status(403).json({
                    error: "Acesso temporariamente suspenso por Compliance.",
                    code: "TENANT_SUSPENDED"
                });
            }
        }

        next();
    } catch (e) {
        console.error("Compliance Check Failed:", e);
        // Fail closed for security
        return res.status(500).json({ error: "Erro na verificação de compliance." });
    }
};
