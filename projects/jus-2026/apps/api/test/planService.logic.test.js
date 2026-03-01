import { describe, it, expect } from 'vitest';
import { planService } from '../src/services/planService.js';

describe('planService', () => {
    it('aplica fallback para free quando plano não existe', () => {
        const plan = planService.getPlan('desconhecido');
        expect(plan.id).toBe('free');
    });

    it('libera webSearch para plano pro', () => {
        const plan = planService.getPlan('pro');
        expect(plan.webSearch).toBe(true);
    });

    it('bloqueia legalValidation no free', () => {
        const feature = planService.canUseFeature('free', 'legalValidation');
        expect(feature).toBe(false);
    });
});
