import { describe, it, expect } from 'vitest';
import { queueService } from '../src/services/queueService.js';

describe('queueService memory mode', () => {
    it('enqueues and processes a notification job', async () => {
        let processed = false;
        queueService.registerWorker('notifications', async () => { processed = true; }, 1);

        await queueService.add('notifications', { tenantId: 't1', message: 'ok' });

        await new Promise((resolve) => setTimeout(resolve, 600));
        expect(processed).toBe(true);
    });
});
