import { processDocumentJob } from './workers/documentProcessor.js';

class QueueManager {
    constructor() {
        this.jobs = [];
        this.processing = false;
        // Map job types to handlers
        this.handlers = {
            'process-document': processDocumentJob
        };
    }

    add(type, data) {
        console.log(`[Queue] Added job: ${type}`);
        this.jobs.push({ type, data, timestamp: Date.now() });
        this.processNext();
    }

    async processNext() {
        if (this.processing || this.jobs.length === 0) return;

        this.processing = true;
        const job = this.jobs.shift();

        try {
            const handler = this.handlers[job.type];
            if (handler) {
                await handler(job.data);
            } else {
                console.warn(`[Queue] No handler for job type: ${job.type}`);
            }
        } catch (e) {
            console.error(`[Queue] Job execution failed:`, e);
        } finally {
            this.processing = false;
            // Process next immediately
            if (this.jobs.length > 0) this.processNext();
        }
    }
}

export const queue = new QueueManager();
