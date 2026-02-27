import admin from 'firebase-admin';
import { db } from '../services/dbService.js';
import { anonymizePII } from '../services/anonymizerService.js';
import { extractTextOCR } from '../ocr.js';
import { ragService } from '../services/ragService.js';
import { queueService, queueConfigs } from '../services/queueService.js';

const setDocumentError = async (docId, error) => {
    if (!docId) return;
    await db.collection('documents').doc(docId).update({
        status: 'error',
        error: error.message,
        failedAt: new Date().toISOString()
    });
};

const processDocument = async (job) => {
    const payload = job.data || job;
    const { docId, tenantId, storagePath } = payload;

    if (!docId || !tenantId || !storagePath) {
        throw new Error('Payload inválido para document-processing');
    }

    await db.collection('documents').doc(docId).update({ status: 'processing', startedAt: new Date().toISOString() });

    const [fileBuffer] = await admin.storage().bucket().file(storagePath).download();
    const rawText = await extractTextOCR(fileBuffer);
    const cleanText = anonymizePII(rawText);

    const documents = [{ id: docId, text: cleanText }];
    const chunks = documents.flatMap((d) => ragService.chunkDocument(d));

    await db.collection('documents').doc(docId).update({
        processedText: cleanText,
        chunkCount: chunks.length,
        status: 'vectorizing',
        processedAt: new Date().toISOString()
    });

    await queueService.add('rag-indexing', { tenantId, documents });
    return { chunks: chunks.length };
};

if (queueService.mode === 'bullmq') {
    const { Worker } = await import('bullmq');
    const worker = new Worker('document-processing', processDocument, { connection: queueService.connection, concurrency: queueConfigs['document-processing'].concurrency });

    worker.on('failed', async (job, error) => {
        await setDocumentError(job?.data?.docId, error);
        if ((job?.attemptsMade || 0) >= queueConfigs['document-processing'].attempts) {
            await queueService.sendToDeadLetter({ queue: 'document-processing', jobId: job.id, error: error.message });
        }
    });
} else {
    queueService.registerWorker('document-processing', async (job) => {
        try {
            return await processDocument(job);
        } catch (error) {
            await setDocumentError((job.data || job).docId, error);
            throw error;
        }
    }, queueConfigs['document-processing'].concurrency);
}
