import { describe, it, expect } from 'vitest';
import { tokenService } from '../src/services/tokenService.js';

describe('tokenService daily model quota', () => {
    it('bloqueia excedente de chamadas Pro no plano free', async () => {
        for (let i = 0; i < 10; i += 1) {
            tokenService.registerModelCall({ tenantId: 't-free', userId: 'u1', model: 'gemini-1.5-pro' });
        }

        await expect(tokenService.checkDailyModelQuota({
            tenantId: 't-free',
            userId: 'u1',
            model: 'gemini-1.5-pro',
            plan: 'free'
        })).rejects.toThrow(/Cota diária/);
    });

    it('não bloqueia chamadas Flash no plano enterprise', async () => {
        await expect(tokenService.checkDailyModelQuota({
            tenantId: 't-ent',
            userId: 'u1',
            model: 'gemini-1.5-flash',
            plan: 'enterprise'
        })).resolves.toBe(true);
    });
});
