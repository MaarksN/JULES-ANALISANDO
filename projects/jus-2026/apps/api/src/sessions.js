import { db } from './db.js';

export const getSessions = async (userId, firmId) => {
    try {
        let query = db.collection('sessions')
            .where('userId', '==', userId);

        if (firmId) {
            query = query.where('firmId', '==', firmId);
        }

        const snapshot = await query.orderBy('updatedAt', 'desc').get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting sessions:", error);
        return [];
    }
};

export const createOrUpdateSession = async (sessionData) => {
    const { id, userId, firmId, ...data } = sessionData;
    if (!userId || !firmId) throw new Error("User ID and Firm ID required");

    try {
        // Security Check: If updating, verify ownership (IDOR check)
        if (id) {
            const doc = await db.collection('sessions').doc(id).get();
            if (!doc.exists) throw new Error("Session not found");
            const existing = doc.data();
            if (existing.firmId !== firmId) throw new Error("Unauthorized access to session"); // Cross-tenant protection

            await db.collection('sessions').doc(id).set({ userId, firmId, ...data }, { merge: true });
            return { id, userId, firmId, ...data };
        } else {
             const ref = await db.collection('sessions').add({ userId, firmId, ...data, createdAt: new Date().toISOString() });
             return { id: ref.id, userId, firmId, ...data };
        }
    } catch (error) {
        console.error("Error saving session:", error);
        throw new Error(error.message || "Could not save session");
    }
};

export const deleteSession = async (sessionId, firmId) => {
    try {
        const docRef = db.collection('sessions').doc(sessionId);
        const doc = await docRef.get();

        if (!doc.exists) return false;

        const data = doc.data();
        if (data.firmId !== firmId) {
            console.warn(`Security Alert: User from firm ${firmId} tried to delete session of firm ${data.firmId}`);
            throw new Error("Unauthorized");
        }

        await docRef.delete();
        return true;
    } catch (error) {
        console.error("Error deleting session:", error);
        throw error;
    }
};
