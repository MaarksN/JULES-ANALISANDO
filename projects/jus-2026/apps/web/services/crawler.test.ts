import { describe, it, expect } from 'vitest';
import { validateCNJ, crawlProcess } from './crawler';

describe('Crawler Service', () => {
    describe('validateCNJ', () => {
        it('should return true for valid CNJ format', () => {
            const validCNJ = '1234567-12.2024.8.26.0000';
            expect(validateCNJ(validCNJ)).toBe(true);
        });

        it('should return false for invalid CNJ format', () => {
            expect(validateCNJ('12345')).toBe(false);
            expect(validateCNJ('invalid-string')).toBe(false);
        });
    });

    describe('crawlProcess', () => {
        it('should throw error for invalid CNJ', async () => {
            await expect(crawlProcess('invalid')).rejects.toThrow("Formato de CNJ inválido");
        });

        it('should return mock data for valid CNJ', async () => {
            const cnj = '1234567-12.2024.8.26.0000';
            const data = await crawlProcess(cnj);

            expect(data).toBeDefined();
            expect(data.cnj).toBe(cnj);
            expect(data.status).toBe('Ativo');
            expect(data.movimentacoes.length).toBeGreaterThan(0);
        });
    });
});
