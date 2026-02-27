import { db } from './db.js';

export const getTemplates = async (userId) => {
    try {
        const snapshot = await db.collection('templates')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching templates:", error);
        // Fallback for mock db
        if (db.collection('templates').docs) {
             return db.collection('templates').docs
                .map(d => ({id: d.id, ...d.data()}))
                .filter(t => t.userId === userId);
        }
        return [];
    }
};

export const createTemplate = async (templateData) => {
    try {
        const { userId, ...data } = templateData;
        const ref = await db.collection('templates').add({
            userId,
            ...data,
            createdAt: new Date().toISOString()
        });
        return { id: ref.id, userId, ...data };
    } catch (error) {
        console.error("Error creating template:", error);
        throw new Error("Could not create template");
    }
};

export const deleteTemplate = async (templateId) => {
    try {
        await db.collection('templates').doc(templateId).delete();
        return true;
    } catch (error) {
        console.error("Error deleting template:", error);
        return false;
    }
};
