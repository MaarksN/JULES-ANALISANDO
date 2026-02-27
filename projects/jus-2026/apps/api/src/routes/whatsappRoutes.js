import express from 'express';
import * as WhatsAppService from '../whatsapp.js';

const router = express.Router();

router.post('/webhook', async (req, res) => {
    const { From, Body, MediaUrl0 } = req.body;
    await WhatsAppService.handleIncomingMessage(From, Body, MediaUrl0);
    res.type('text/xml').send('<Response></Response>'); // Twilio expects XML
});

export default router;
