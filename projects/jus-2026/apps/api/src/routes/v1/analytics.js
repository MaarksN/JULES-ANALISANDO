import express from 'express';
import { getTenantStats } from '../../services/analyticsService.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
    const stats = await getTenantStats(req.user.tenantId);
    res.json(stats);
});

export default router;
