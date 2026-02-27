let bullmq;
let ioredis;

try {
    bullmq = await import('bullmq');
    ioredis = await import('ioredis');
} catch {
    bullmq = null;
    ioredis = null;
}

const sendSlackAlert = async (text) => {
    if (!process.env.SLACK_WEBHOOK_URL) return;
    try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
    } catch (error) {
        console.error('[QUEUE] Falha ao notificar Slack:', error.message);
    }
};

const queueConfigs = {
    'document-processing': { concurrency: 3, attempts: 3, backoffDelay: 2000 },
    'rag-indexing': { concurrency: 2, attempts: 5, backoffDelay: 1500 },
    notifications: { concurrency: 10, attempts: 1, backoffDelay: 0 },
    'dead-letter-queue': { concurrency: 1, attempts: 1, backoffDelay: 0 }
};

class MemoryQueueService {
    constructor() {
        this.jobs = [];
        this.handlers = new Map();
        this.id = 1;
        this.retentionMs = Number(process.env.QUEUE_RETENTION_MS || 3600_000);
        setInterval(() => this.tick(), 250);
        setInterval(() => this.cleanup(), 15_000);
    }

    registerWorker(queueName, handler, concurrency = 1) {
        this.handlers.set(queueName, { handler, concurrency, active: 0 });
    }

    async add(queueName, data, options = {}) {
        const config = queueConfigs[queueName] || queueConfigs.notifications;
        const job = {
            id: this.id++,
            queueName,
            data,
            status: 'waiting',
            attemptsMade: 0,
            createdAt: new Date().toISOString(),
            runAt: Date.now(),
            opts: { attempts: options.attempts || config.attempts, backoffDelay: options.backoffDelay ?? config.backoffDelay }
        };
        this.jobs.push(job);
        return job;
    }

    async sendToDeadLetter(payload) {
        await this.add('dead-letter-queue', payload, { attempts: 1, backoffDelay: 0 });
        await sendSlackAlert(`DLQ ALERT: ${JSON.stringify(payload)}`);
    }

    cleanup() {
        const now = Date.now();
        this.jobs = this.jobs.filter((job) => {
            if (!['completed', 'failed'].includes(job.status)) return true;
            const timestamp = new Date(job.completedAt || job.failedAt || job.createdAt).getTime();
            return now - timestamp <= this.retentionMs;
        });
    }

    async tick() {
        const now = Date.now();
        const candidates = this.jobs.filter((job) => job.status === 'waiting' && job.runAt <= now);

        for (const job of candidates) {
            const slot = this.handlers.get(job.queueName);
            if (!slot || slot.active >= slot.concurrency) continue;
            slot.active += 1;
            job.status = 'active';

            try {
                await slot.handler(job);
                job.status = 'completed';
                job.completedAt = new Date().toISOString();
            } catch (error) {
                job.attemptsMade += 1;
                const maxAttempts = job.opts.attempts || 1;
                if (job.attemptsMade >= maxAttempts) {
                    job.status = 'failed';
                    job.failedAt = new Date().toISOString();
                    await this.sendToDeadLetter({ queue: job.queueName, jobId: job.id, error: error.message, data: job.data });
                } else {
                    const delay = (job.opts.backoffDelay || 0) * (2 ** (job.attemptsMade - 1));
                    job.status = 'waiting';
                    job.runAt = Date.now() + delay;
                }
            } finally {
                slot.active -= 1;
            }
        }
    }

    snapshot() {
        return this.jobs.map((job) => ({ id: job.id, queueName: job.queueName, status: job.status, attemptsMade: job.attemptsMade, runAt: job.runAt }));
    }

    health() {
        const snap = this.snapshot();
        return {
            mode: 'memory',
            total: snap.length,
            waiting: snap.filter((j) => j.status === 'waiting').length,
            active: snap.filter((j) => j.status === 'active').length,
            failed: snap.filter((j) => j.status === 'failed').length
        };
    }
}

let queueService;
let queues;

if (bullmq && ioredis) {
    const { Queue } = bullmq;
    const Redis = ioredis.default;
    const connection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', { maxRetriesPerRequest: null });

    queues = {
        documentProcessing: new Queue('document-processing', { connection, defaultJobOptions: { attempts: queueConfigs['document-processing'].attempts, backoff: { type: 'exponential', delay: queueConfigs['document-processing'].backoffDelay } } }),
        ragIndexing: new Queue('rag-indexing', { connection, defaultJobOptions: { attempts: queueConfigs['rag-indexing'].attempts, backoff: { type: 'exponential', delay: queueConfigs['rag-indexing'].backoffDelay } } }),
        notifications: new Queue('notifications', { connection, defaultJobOptions: { attempts: queueConfigs.notifications.attempts } }),
        deadLetter: new Queue('dead-letter-queue', { connection, defaultJobOptions: { attempts: 1 } })
    };

    queueService = {
        mode: 'bullmq',
        connection,
        queues,
        registerWorker() {},
        snapshot: () => [],
        health: () => ({ mode: 'bullmq', total: null }),
        async add(queueName, data, options = {}) {
            const map = {
                'document-processing': queues.documentProcessing,
                'rag-indexing': queues.ragIndexing,
                notifications: queues.notifications,
                'dead-letter-queue': queues.deadLetter
            };
            const queue = map[queueName];
            if (!queue) throw new Error(`Fila não suportada: ${queueName}`);
            return queue.add(options.name || queueName, data, options);
        },
        async sendToDeadLetter(payload) {
            await queues.deadLetter.add('failed-job', payload, { attempts: 1 });
            await sendSlackAlert(`DLQ ALERT: ${JSON.stringify(payload)}`);
        }
    };
} else {
    const memoryQueue = new MemoryQueueService();
    queueService = {
        mode: 'memory',
        connection: null,
        queues: null,
        add: (...args) => memoryQueue.add(...args),
        sendToDeadLetter: (...args) => memoryQueue.sendToDeadLetter(...args),
        registerWorker: (...args) => memoryQueue.registerWorker(...args),
        snapshot: () => memoryQueue.snapshot(),
        health: () => memoryQueue.health(),
        enqueueDocumentProcessing: (data, options = {}) => memoryQueue.add('document-processing', data, options),
        enqueueRagIndexing: (data, options = {}) => memoryQueue.add('rag-indexing', data, options),
        enqueueNotification: (data, options = {}) => memoryQueue.add('notifications', data, options)
    };
    queues = null;
}

export { queueService, queues, queueConfigs };
