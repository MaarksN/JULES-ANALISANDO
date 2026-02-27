import { db } from './db.js';

export const handleIncomingMessage = async (from, body, mediaUrl) => {
    console.log(`WhatsApp from ${from}: ${body} (Media: ${mediaUrl})`);

    // Simulate finding a user by phone number
    const userId = 'demo-user-123456'; // Fixed for demo

    // Create a new session or append to inbox
    // For demo, we just log it. Real app would trigger an Agent.

    return { success: true };
};
