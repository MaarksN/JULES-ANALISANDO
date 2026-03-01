import express from 'express';
import { db } from '../db.js';
import * as AnalyticsService from '../analytics.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
    // Basic authorization check: Ensure requesting user matches token user (or is admin)
    // if (req.user.uid !== req.params.userId) return res.status(403).send("Forbidden");
    try {
        const data = await AnalyticsService.getUserAnalytics(req.params.userId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
