import { describe, it, expect } from 'vitest';
import { queueService } from '../src/services/queueService.js';

describe('queue health snapshot', () => {
    it('returns a health payload', async () => {
        await queueService.add('notifications', { msg: 'x' });
        const health = queueService.health();
        expect(health).toBeTruthy();
        expect(health.mode).toBeDefined();
    });
});
