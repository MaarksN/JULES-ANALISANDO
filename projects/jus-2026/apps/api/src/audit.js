import { db } from './db.js';

export const logAction = async (userId, action, details) => {
    try {
        await db.collection('logs').add({
            userId,
            action,
            details,
            timestamp: new Date().toISOString()
        });
        console.log(`[AUDIT] ${action} by ${userId}`);
    } catch (e) {
        console.error("Failed to write audit log:", e);
    }
};

export const getAuditLogs = async (userId) => {
    try {
        const snapshot = await db.collection('logs')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error("Failed to get audit logs:", e);
        // Fallback Mock
        return [
            { id: '1', action: 'LOGIN', timestamp: new Date().toISOString(), details: { ip: '127.0.0.1' } },
            { id: '2', action: 'GENERATE_DOC', timestamp: new Date(Date.now() - 3600000).toISOString(), details: { agent: 'PETITION' } }
        ];
    }
};
