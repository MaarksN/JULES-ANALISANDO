import express from 'express';
import { db } from '../services/dbService.js';
import { queueService } from '../services/queueService.js';

const router = express.Router();

const probeDependencies = async () => {
    const dependencies = {
        database: 'UNKNOWN',
        queues: queueService?.mode ? 'UP' : 'DOWN'
    };

    try {
        if (db) {
            dependencies.database = 'UP';
        }
    } catch {
        dependencies.database = 'DOWN';
    }

    return dependencies;
};

router.get('/live', (req, res) => {
    res.status(200).json({ status: 'UP', time: new Date().toISOString() });
});

router.get('/ready', async (req, res) => {
    const services = await probeDependencies();
    const degraded = Object.values(services).some((status) => status !== 'UP');

    res.status(degraded ? 503 : 200).json({
        status: degraded ? 'DEGRADED' : 'UP',
        services,
        time: new Date().toISOString(),
        requestId: req.requestId
    });
});

/**
 * Item 18: Health Checks & Readiness Probes
 */
router.get('/', async (req, res) => {
    const services = await probeDependencies();
    const degraded = Object.values(services).some((status) => status !== 'UP');

    res.status(degraded ? 503 : 200).json({
        status: degraded ? 'DEGRADED' : 'UP',
        services: {
            ...services,
            api: 'UP'
        },
        requestId: req.requestId,
        time: new Date().toISOString()
    });
});

export default router;
