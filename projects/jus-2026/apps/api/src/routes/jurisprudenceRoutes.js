import express from 'express';
import * as CrawlerService from '../crawler.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ error: 'Query parameter required' });

        const results = await CrawlerService.searchJurisprudence(query);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
