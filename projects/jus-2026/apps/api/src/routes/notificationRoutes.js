import express from 'express';
import * as NotificationService from '../notifications.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
    try {
        const notifs = await NotificationService.getNotifications(req.params.userId);
        res.json(notifs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/read/:id', async (req, res) => {
    try {
        await NotificationService.markAsRead(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
