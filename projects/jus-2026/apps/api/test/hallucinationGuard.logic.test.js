import { describe, it, expect } from 'vitest';
import { postProcessResponse } from '../src/services/hallucinationGuard.js';

describe('hallucination guard', () => {
    it('flags unverified citations', () => {
        const response = 'Conforme Art. 927 do Código Civil e Súmula 999 do STJ, aplica-se a teoria do risco.';
        const sources = [{ text: 'Trecho que menciona Art. 927 do Código Civil.' }];

        const result = postProcessResponse(response, sources);

        expect(result.valid).toBe(false);
        expect(result.unverifiedCitations.some((c) => /Súmula 999/i.test(c))).toBe(true);
    });
});
