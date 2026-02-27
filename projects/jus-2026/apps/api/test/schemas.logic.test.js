import { describe, it, expect } from 'vitest';
import { sessionSchema } from '../src/schemas/sessionSchema.js';
import { uploadSchema } from '../src/schemas/uploadSchema.js';
import { checkoutSchema } from '../src/schemas/paymentSchema.js';
import { firmSchema } from '../src/schemas/firmSchema.js';

describe('schemas', () => {
    it('valida sessão com título e caseType', () => {
        const parsed = sessionSchema.safeParse({ title: 'Sessão Teste', caseType: 'CIVEL' });
        expect(parsed.success).toBe(true);
    });

    it('rejeita cnpj inválido', () => {
        const parsed = firmSchema.safeParse({ name: 'Firma', cnpj: '123' });
        expect(parsed.success).toBe(false);
    });

    it('valida upload e checkout com campos mínimos', () => {
        expect(uploadSchema.safeParse({ documentType: 'OTHER', sessionId: 's1' }).success).toBe(true);
        expect(checkoutSchema.safeParse({ priceId: 'price_123' }).success).toBe(true);
    });
});
