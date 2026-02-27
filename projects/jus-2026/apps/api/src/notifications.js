import { db } from './db.js';

export const getNotifications = async (userId) => {
    try {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .where('read', '==', false)
            .orderBy('timestamp', 'desc')
            .get();
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error("Failed to get notifications:", e);
        // Mock
        return [
            { id: '1', title: 'Bem-vindo!', message: 'Configure seu perfil para começar.', timestamp: new Date().toISOString(), read: false }
        ];
    }
};

export const createNotification = async (userId, title, message) => {
    try {
        await db.collection('notifications').add({
            userId,
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false
        });
        console.log(`[NOTIFY] Sent to ${userId}: ${title}`);
    } catch (e) {
        console.error("Failed to create notification:", e);
    }
};

export const markAsRead = async (notificationId) => {
    try {
        await db.collection('notifications').doc(notificationId).update({ read: true });
        return true;
    } catch (e) {
        return false;
    }
};
