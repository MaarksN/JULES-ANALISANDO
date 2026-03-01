import cron from 'node-cron';
import { db } from './db.js';
import * as NotificationService from './notifications.js';
import * as EmailService from './email.js';

export const startJobs = () => {
    console.log("⏰ Deadline Monitor Started (Every 24h)");

    // Run every day at 08:00 AM
    cron.schedule('0 8 * * *', async () => {
        console.log("Running Daily Deadline Check...");

        try {
            // Mock Query for deadlines (In real app, query 'deadlines' collection)
            // Simulating fetching active sessions
            const snapshot = await db.collection('sessions').get();
            const sessions = snapshot.docs.map(d => ({id: d.id, ...d.data()}));

            let deadlinesFound = 0;

            for (const session of sessions) {
                // Mock logic: randomly decide if a deadline is near for demo
                const isUrgent = Math.random() > 0.8;
                if (isUrgent && session.userId) {
                    console.log(`[ALERT] Deadline approaching for Case ${session.title} (User: ${session.userId})`);
                    deadlinesFound++;
                    await NotificationService.createNotification(
                        session.userId,
                        "Prazo Próximo",
                        `O caso "${session.title}" requer atenção urgente.`
                    );

                    // Mock Email
                    await EmailService.sendEmail(
                        'advogado@exemplo.com',
                        `Alerta de Prazo: ${session.title}`,
                        `Olá, detectamos um prazo fatal para o processo ${session.title}. Verifique na plataforma.`
                    );
                }
            }

            console.log(`Checked ${sessions.length} cases. Found ${deadlinesFound} alerts.`);

        } catch (e) {
            console.error("Job Error:", e);
        }
    });
};
