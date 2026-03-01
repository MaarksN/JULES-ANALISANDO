import express from 'express';
import * as MarketplaceService from '../marketplace.js';

const router = express.Router();

router.get('/agents', async (req, res) => {
    try {
        const agents = await MarketplaceService.getAgents();
        res.json(agents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/agents', async (req, res) => {
    try {
        const newAgent = await MarketplaceService.createAgent(req.body);
        res.status(201).json(newAgent);
    } catch (error) {
        if (error.message === "Nome e preço obrigatórios.") {
             return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

export default router;
