import { describe, it, expect } from 'vitest';
import { ensureContextShape, truncateToTokenBudget, estimateTokens } from '../src/services/aiOrchestrator.js';

describe('aiOrchestrator helpers', () => {
    it('normalizes legacy string context', () => {
        const ctx = ensureContextShape('texto legal');
        expect(ctx.documents.length).toBe(1);
        expect(ctx.jurisprudence.length).toBe(0);
    });

    it('truncates large prompts according to token budget', () => {
        const text = 'a'.repeat(200);
        const out = truncateToTokenBudget(text, 10);
        expect(estimateTokens(out)).toBeGreaterThanOrEqual(10);
        expect(out.length).toBeLessThan(text.length + 80);
    });
});
