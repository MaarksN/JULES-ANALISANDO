import { embeddingService } from './embeddingService.js';

const dot = (a = [], b = []) => a.reduce((acc, value, i) => acc + (value * (b[i] || 0)), 0);
const norm = (a = []) => Math.sqrt(dot(a, a));
const cosineSimilarity = (a = [], b = []) => {
    const den = norm(a) * norm(b);
    return den ? dot(a, b) / den : 0;
};

/**
 * Ranqueia chunks por similaridade semântica usando embeddings.
 * @param {string} query
 * @param {Array<string|{text:string}>} chunks
 * @returns {Promise<Array<{text:string,score:number}>>}
 */
export const rankContext = async (query, chunks = []) => {
    if (!query || !Array.isArray(chunks) || !chunks.length) return [];

    const texts = chunks.map((chunk) => (typeof chunk === 'string' ? chunk : chunk?.text || '')).filter(Boolean);
    if (!texts.length) return [];

    const queryVector = await embeddingService.getEmbedding(query, {
        preferredModel: 'text-embedding-004',
        fallbackModel: 'text-embedding-3-small'
    });

    const chunkVectors = await embeddingService.getEmbeddingsBatch(texts, {
        preferredModel: 'text-embedding-004',
        fallbackModel: 'text-embedding-3-small'
    });

    return texts
        .map((text, index) => ({ text, score: cosineSimilarity(queryVector, chunkVectors[index]) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
};
