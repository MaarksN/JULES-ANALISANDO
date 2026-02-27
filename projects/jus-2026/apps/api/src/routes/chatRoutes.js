import express from 'express';
import * as AIService from '../services/aiService.js';

const router = express.Router();

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Envia uma mensagem para o agente de IA
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userMessage:
 *                 type: string
 *               agent:
 *                 type: object
 *               history:
 *                 type: array
 *     responses:
 *       200:
 *         description: Resposta da IA gerada com sucesso
 */
router.post('/', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        const { userMessage, agent, history } = req.body;

        if (!userMessage || !agent) {
            return res.status(400).json({ error: "Mensagem e Agente são obrigatórios." });
        }

        const response = await AIService.sendMessage(req.user, agent.id, userMessage, history);

        res.json(response);
    } catch (e) {
        console.error("Chat Error:", e);
        res.status(500).json({ error: e.message || "Erro interno na IA." });
    }
});

export default router;
