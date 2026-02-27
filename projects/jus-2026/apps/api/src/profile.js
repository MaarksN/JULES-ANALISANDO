import { db } from './db.js';

export const getUserProfile = async (userId) => {
    try {
        const doc = await db.collection('profiles').doc(userId).get();
        if (doc.exists) {
            return doc.data();
        }
        return null;
    } catch (error) {
        console.error("Error getting profile:", error);
        return null;
    }
};

export const updateUserProfile = async (userId, data) => {
    try {
        await db.collection('profiles').doc(userId).set(data, { merge: true });
        return { userId, ...data };
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};
