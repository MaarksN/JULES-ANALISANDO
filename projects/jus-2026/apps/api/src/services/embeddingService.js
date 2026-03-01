let GoogleGenerativeAI;
let OpenAI;
try { ({ GoogleGenerativeAI } = await import('google-generativeai')); } catch {}
try { ({ default: OpenAI } = await import('openai')); } catch {}

class EmbeddingService {
    constructor() {
        this.gemini = GoogleGenerativeAI && process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
        this.openai = OpenAI && process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
        this.cache = new Map();
    }

    async getEmbedding(text, options = {}) {
        if (!text) return [];
        const hash = `${options.preferredModel || 'default'}:${Buffer.from(text).toString('base64')}`;
        if (this.cache.has(hash)) return this.cache.get(hash);

        let embedding;
        try {
            if (!this.gemini) throw new Error('gemini indisponível');
            const model = this.gemini.getGenerativeModel({ model: options.preferredModel || 'text-embedding-004' });
            const response = await model.embedContent(text);
            embedding = response.embedding.values;
        } catch {
            if (this.openai) {
                const fallback = await this.openai.embeddings.create({ model: options.fallbackModel || 'text-embedding-ada-002', input: text });
                embedding = fallback.data?.[0]?.embedding || [];
            } else {
                embedding = Array.from({ length: 1536 }, (_, i) => (text.charCodeAt(i % text.length) || 0) / 255);
            }
        }

        this.cache.set(hash, embedding);
        return embedding;
    }

    async getEmbeddingsBatch(texts = [], options = {}) {
        const out = [];
        for (const text of texts) out.push(await this.getEmbedding(text, options));
        return out;
    }
}

export const embeddingService = new EmbeddingService();
