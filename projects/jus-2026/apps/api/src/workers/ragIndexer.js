import { ragService } from '../services/ragService.js';
import { queueService, queueConfigs } from '../services/queueService.js';

const processRagIndex = async (job) => {
    const payload = job.data || job;
    const { tenantId, documents } = payload;

    if (!tenantId || !Array.isArray(documents)) {
        throw new Error('Payload inválido para rag-indexing');
    }

    return ragService.indexDocuments(tenantId, documents || []);
};

if (queueService.mode === 'bullmq') {
    const { Worker } = await import('bullmq');
    const worker = new Worker('rag-indexing', processRagIndex, {
        connection: queueService.connection,
        concurrency: queueConfigs['rag-indexing'].concurrency
    });

    worker.on('failed', async (job, error) => {
        if ((job?.attemptsMade || 0) >= queueConfigs['rag-indexing'].attempts) {
            await queueService.sendToDeadLetter({
                queue: 'rag-indexing',
                jobId: job.id,
                error: error.message
            });
        }
    });
} else {
    queueService.registerWorker('rag-indexing', processRagIndex, queueConfigs['rag-indexing'].concurrency);
}
