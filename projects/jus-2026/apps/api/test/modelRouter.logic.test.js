import { describe, it, expect } from 'vitest';
import { modelRouter } from '../src/services/modelRouter.js';

describe('modelRouter', () => {
    it('usa Pro para tarefas complexas', () => {
        const model = modelRouter.routeModel({ taskType: 'PETITION' });
        expect(model).toBe(modelRouter.models.PRO_MODEL);
    });

    it('usa Flash para chat simples', () => {
        const model = modelRouter.routeModel({ taskType: 'CHAT_SIMPLE' });
        expect(model).toBe(modelRouter.models.FLASH_MODEL);
    });

    it('habilita critic loop apenas para geração de peças', () => {
        expect(modelRouter.shouldRunCriticLoop({ taskType: 'PETITION', enabled: true })).toBe(true);
        expect(modelRouter.shouldRunCriticLoop({ taskType: 'CHAT_SIMPLE', enabled: true })).toBe(false);
    });
});
