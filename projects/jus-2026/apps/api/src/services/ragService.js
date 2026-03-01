import { embeddingService } from './embeddingService.js';

let Pool;
try {
    const pg = await import('pg');
    Pool = pg.default.Pool;
} catch {
    Pool = null;
}

const pool = Pool && process.env.SUPABASE_DB_URL
    ? new Pool({ connectionString: process.env.SUPABASE_DB_URL })
    : null;

const estimateTokens = (text = '') => Math.ceil(text.length / 4);
const splitParagraphs = (text = '') => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const tokenize = (value = '') => value.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);

const dot = (a = [], b = []) => a.reduce((acc, val, i) => acc + (val * (b[i] || 0)), 0);
const norm = (a = []) => Math.sqrt(dot(a, a));
const cosine = (a = [], b = []) => {
    const den = norm(a) * norm(b);
    return den === 0 ? 0 : dot(a, b) / den;
};

const chunkDocument = (document, { chunkSize = 800, overlap = 100 } = {}) => {
    const chunks = [];
    const paragraphs = splitParagraphs(document.text || '');

    let current = [];
    let currentTokens = 0;
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphTokens = estimateTokens(paragraph);

        if (paragraphTokens > chunkSize) {
            const sentences = paragraph.split(/(?<=[.!?])\s+/);
            for (const sentence of sentences) {
                const sentenceTokens = estimateTokens(sentence);
                if (currentTokens + sentenceTokens > chunkSize && current.length) {
                    chunks.push({
                        text: current.join(' '),
                        metadata: { documentId: document.id, chunkIndex, pageNumber: document.pageNumber || null, section: document.section || 'general' }
                    });
                    chunkIndex += 1;
                    current = [];
                    currentTokens = 0;
                }
                current.push(sentence);
                currentTokens += sentenceTokens;
            }
            continue;
        }

        if (currentTokens + paragraphTokens > chunkSize && current.length) {
            chunks.push({
                text: current.join('\n\n'),
                metadata: { documentId: document.id, chunkIndex, pageNumber: document.pageNumber || null, section: document.section || 'general' }
            });
            chunkIndex += 1;

            const carry = [];
            let carryTokens = 0;
            for (let i = current.length - 1; i >= 0; i -= 1) {
                const t = estimateTokens(current[i]);
                if (carryTokens + t > overlap) break;
                carry.unshift(current[i]);
                carryTokens += t;
            }
            current = carry;
            currentTokens = carryTokens;
        }

        current.push(paragraph);
        currentTokens += paragraphTokens;
    }

    if (current.length) {
        chunks.push({
            text: current.join('\n\n'),
            metadata: { documentId: document.id, chunkIndex, pageNumber: document.pageNumber || null, section: document.section || 'general' }
        });
    }

    return chunks;
};

const rrfMerge = (semanticRows = [], lexicalRows = []) => {
    const scores = new Map();
    const K = 60;

    semanticRows.forEach((row, i) => {
        const current = scores.get(row.id) || { row, score: 0 };
        current.score += 0.6 * (1 / (K + i + 1));
        current.row = row;
        scores.set(row.id, current);
    });

    lexicalRows.forEach((row, i) => {
        const current = scores.get(row.id) || { row, score: 0 };
        current.score += 0.4 * (1 / (K + i + 1));
        current.row = current.row || row;
        scores.set(row.id, current);
    });

    return [...scores.values()].sort((a, b) => b.score - a.score).slice(0, 5).map(({ row, score }) => ({ ...row, fusionScore: score }));
};

const memoryStore = [];

const dedupeById = (rows = []) => {
    const seen = new Set();
    return rows.filter((row) => {
        const id = row.id || JSON.stringify(row.metadata || row);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

const trimContextToBudget = (rows = [], maxTokens = Number(process.env.RAG_MAX_CONTEXT_TOKENS || 4000)) => {
    const output = [];
    let used = 0;
    for (const row of rows) {
        const text = row.chunk_text || row.chunkText || '';
        const tokens = estimateTokens(text);
        if (used + tokens > maxTokens && output.length) break;
        output.push(row);
        used += tokens;
    }
    return output;
};

const lexicalScore = (text, queryTokens) => {
    const tokens = tokenize(text);
    if (!tokens.length || !queryTokens.length) return 0;
    const tokenSet = new Set(tokens);
    let hit = 0;
    for (const qt of queryTokens) if (tokenSet.has(qt)) hit += 1;
    return hit / queryTokens.length;
};

export const ragService = {
    chunkDocument,

    async indexDocuments(tenantId, documents = []) {
        const chunks = documents.flatMap((doc) => chunkDocument(doc));
        if (!chunks.length) return { indexed: 0, backend: pool ? 'pgvector' : 'memory' };

        const vectors = [];
        for (let i = 0; i < chunks.length; i += 100) {
            const batch = chunks.slice(i, i + 100);
            const embeddings = await embeddingService.getEmbeddingsBatch(batch.map((c) => c.text), { preferredModel: 'text-embedding-004', fallbackModel: 'text-embedding-ada-002' });
            embeddings.forEach((embedding, idx) => vectors.push({ chunk: batch[idx], embedding }));
        }

        if (!pool) {
            vectors.forEach((vector, idx) => memoryStore.push({ id: `${tenantId}-${Date.now()}-${idx}`, tenantId, chunkText: vector.chunk.text, metadata: vector.chunk.metadata, embedding: vector.embedding }));
            return { indexed: vectors.length, backend: 'memory' };
        }

        const client = await pool.connect();
        try {
            await client.query('CREATE EXTENSION IF NOT EXISTS vector');
            await client.query(`CREATE TABLE IF NOT EXISTS rag_chunks (id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, chunk_text TEXT NOT NULL, metadata JSONB NOT NULL, fts TSVECTOR, embedding VECTOR(1536))`);
            await client.query('CREATE INDEX IF NOT EXISTS rag_chunks_tenant_idx ON rag_chunks (tenant_id)');
            await client.query('CREATE INDEX IF NOT EXISTS rag_chunks_fts_idx ON rag_chunks USING GIN (fts)');

            for (const { chunk, embedding } of vectors) {
                await client.query(`INSERT INTO rag_chunks (tenant_id, chunk_text, metadata, fts, embedding) VALUES ($1, $2, $3::jsonb, to_tsvector('portuguese', $2), $4::vector)`, [tenantId, chunk.text, JSON.stringify(chunk.metadata), `[${embedding.join(',')}]`]);
            }
        } finally { client.release(); }

        return { indexed: vectors.length, backend: 'pgvector' };
    },

    async retrieveContext(query, user, options = {}) {
        const tenantId = user?.tenantId || options.tenantId;
        const queryEmbedding = await embeddingService.getEmbedding(query, { preferredModel: 'text-embedding-004', fallbackModel: 'text-embedding-ada-002' });

        if (!pool) {
            const queryTokens = tokenize(query);
            const scoped = memoryStore.filter((row) => row.tenantId === tenantId);

            const semantic = [...scoped]
                .map((row) => ({ ...row, semanticScore: cosine(row.embedding, queryEmbedding) }))
                .sort((a, b) => b.semanticScore - a.semanticScore)
                .slice(0, 5)
                .map((row) => ({ id: row.id, chunk_text: row.chunkText, metadata: row.metadata }));

            const lexical = [...scoped]
                .map((row) => ({ ...row, lexicalScore: lexicalScore(row.chunkText, queryTokens) }))
                .filter((row) => row.lexicalScore > 0)
                .sort((a, b) => b.lexicalScore - a.lexicalScore)
                .slice(0, 5)
                .map((row) => ({ id: row.id, chunk_text: row.chunkText, metadata: row.metadata }));

            const merged = trimContextToBudget(dedupeById(rrfMerge(semantic, lexical)));
            return {
                context: merged.map((row) => row.chunk_text).join('\n\n'),
                sources: merged.map((row) => ({ ...(row.metadata || {}), fusionScore: row.fusionScore })),
                documents: merged.map((row) => ({ text: row.chunk_text, metadata: row.metadata })),
                jurisprudence: []
            };
        }

        const client = await pool.connect();
        try {
            const semanticRows = await client.query(`SELECT id, chunk_text, metadata FROM rag_chunks WHERE tenant_id = $1 ORDER BY embedding <=> $2::vector LIMIT 5`, [tenantId, `[${queryEmbedding.join(',')}]`]);
            const lexicalRows = await client.query(`SELECT id, chunk_text, metadata FROM rag_chunks WHERE tenant_id = $1 AND fts @@ plainto_tsquery('portuguese', $2) ORDER BY ts_rank(fts, plainto_tsquery('portuguese', $2)) DESC LIMIT 5`, [tenantId, query]);

            const merged = trimContextToBudget(dedupeById(rrfMerge(semanticRows.rows, lexicalRows.rows)));
            return {
                context: merged.map((row) => row.chunk_text).join('\n\n'),
                sources: merged.map((row) => ({ ...(row.metadata || {}), fusionScore: row.fusionScore })),
                documents: merged.map((row) => ({ text: row.chunk_text, metadata: row.metadata })),
                jurisprudence: []
            };
        } finally { client.release(); }
    }
};

export { trimContextToBudget, dedupeById };
