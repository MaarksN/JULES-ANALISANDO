// apps/api/src/services/auditService.js
import { db } from '../db.js';

// Phase 11: Immutable Audit Log
// In production, this might write to a separate immutable ledger or use Firestore WORM policies.
export const logAction = async (tenantId, actorId, action, details) => {
    if (!tenantId || !actorId) {
        console.error("Audit Error: Missing tenant or actor context");
        return;
    }

    const logEntry = {
        tenantId,
        actorId,
        action,
        details: JSON.stringify(details), // Serialize for generic storage
        timestamp: new Date().toISOString(),
        immutable: true,
        hash: null // Placeholder for Merkle Tree hash in Phase 12
    };

    try {
        await db.collection('audit_logs').add(logEntry);
        console.log(`[AUDIT] [${tenantId}] ${actorId} -> ${action}`);
    } catch (e) {
        console.error("Critical Audit Failure:", e);
        // In Phase 12, this should trigger a circuit breaker
    }
};
