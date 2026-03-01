import { describe, it, expect } from 'vitest';
import { validateCitation, validateCitationsBatch } from '../src/services/legalValidator.js';

describe('legalValidator', () => {
    it('classifica Lei 8.666/93 como revogada', async () => {
        const result = await validateCitation('Lei 8.666/93');
        expect(result.status).toBe('revogada');
        expect(result.valid).toBe(false);
        expect(result.suggestedReplacement).toBe('Lei 14.133/2021');
    });

    it('classifica Lei 14.133/2021 como vigente', async () => {
        const result = await validateCitation('Lei 14.133/2021');
        expect(result.status).toBe('vigente');
        expect(result.valid).toBe(true);
    });

    it('retorna não_verificada para lei fora do baseline oficial local', async () => {
        const result = await validateCitation('Lei 12.999/2099');
        expect(['not_found', 'não_verificada']).toContain(result.status);
    });

    it('valida lote de citações com resumo', async () => {
        const batch = await validateCitationsBatch(['Lei 8.666/93', 'Lei 14.133/2021']);
        expect(batch.summary.total).toBe(2);
        expect(batch.summary.valid).toBe(1);
        expect(batch.summary.invalid).toBe(1);
    });
});
