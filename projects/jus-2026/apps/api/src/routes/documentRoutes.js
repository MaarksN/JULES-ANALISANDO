import express from 'express';
import * as DocumentService from '../documents.js';
import { queue } from '../queue.js';

const router = express.Router();

router.post('/export', async (req, res) => {
    // Offload heavy task to queue (simulated)
    queue.add('generate-docx', { size: req.body.content.length });

    try {
        const { content, metadata } = req.body;
        const buffer = await DocumentService.generateDocx(content, metadata);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=documento.docx`);
        res.send(buffer);
    } catch (error) {
        console.error("Docx Error:", error);
        res.status(500).json({ error: "Erro ao gerar documento DOCX." });
    }
});

export default router;
