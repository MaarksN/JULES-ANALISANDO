import express from 'express';
import * as TemplateService from '../templates.js';
import { validatePayload } from '../middleware/payloadValidator.js';
import { templateSchema } from '../schemas/templateSchema.js';

const router = express.Router();

router.get('/:userId', async (req, res, next) => {
    try {
        const templates = await TemplateService.getTemplates(req.params.userId);
        res.json(templates);
    } catch (error) {
        next(error);
    }
});

router.post('/', validatePayload(templateSchema), async (req, res, next) => {
    try {
        const template = await TemplateService.createTemplate(req.safeBody);
        res.status(201).json(template);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        await TemplateService.deleteTemplate(req.params.id);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

export default router;
