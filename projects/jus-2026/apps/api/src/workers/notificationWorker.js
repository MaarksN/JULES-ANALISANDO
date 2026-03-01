import { queueService, queueConfigs } from '../services/queueService.js';

const processNotification = async (job) => {
    const payload = job.data || job;
    if (!payload) throw new Error('Payload inválido para notifications');
    return { delivered: true };
};

if (queueService.mode === 'bullmq') {
    const { Worker } = await import('bullmq');
    new Worker('notifications', processNotification, {
        connection: queueService.connection,
        concurrency: queueConfigs.notifications.concurrency
    });
} else {
    queueService.registerWorker('notifications', processNotification, queueConfigs.notifications.concurrency);
}
