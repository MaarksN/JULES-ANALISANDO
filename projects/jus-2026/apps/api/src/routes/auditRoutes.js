import express from 'express';
import * as AuditService from '../audit.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
    try {
        const logs = await AuditService.getAuditLogs(req.params.userId);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
