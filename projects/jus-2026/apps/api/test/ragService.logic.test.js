import { describe, it, expect } from 'vitest';
import { ragService } from '../src/services/ragService.js';

describe('ragService logical checks', () => {
    it('creates chunks with metadata and overlap strategy', () => {
        const text = Array.from({ length: 30 }, (_, i) => `Parágrafo ${i + 1} com conteúdo jurídico relevante sobre responsabilidade civil.`).join('\n\n');
        const chunks = ragService.chunkDocument({ id: 'doc-1', text, pageNumber: 2, section: 'facts' }, { chunkSize: 120, overlap: 20 });

        expect(chunks.length).toBeGreaterThan(1);
        expect(chunks[0].metadata.documentId).toBe('doc-1');
        expect(chunks[0].metadata.pageNumber).toBe(2);
        expect(chunks[0].metadata.section).toBe('facts');
        expect(chunks[1].metadata.chunkIndex).toBe(1);
    });
});
