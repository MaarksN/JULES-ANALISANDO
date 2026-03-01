// services/cache.ts
import { db } from "../firebase";
import { collection, query as fsQuery, where, getDocs, addDoc, Timestamp } from "firebase/firestore";

const CACHE_COLLECTION = "query_cache";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const SIMILARITY_THRESHOLD = 0.9;

class SemanticCache {
    // Mock embedding logic kept for consistency with simulated RAG
    // In production, this would call OpenAI/Gemini Embeddings API
    private async generateEmbedding(text: string): Promise<number[]> {
        return Array.from({ length: 128 }, (_, i) =>
            (text.charCodeAt(i % text.length) || 0) / 255
        );
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        if (!a || !b || a.length !== b.length) return 0;
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / ((magA * magB) || 1);
    }

    async get(textQuery: string): Promise<any | null> {
        try {
            const queryEmbedding = await this.generateEmbedding(textQuery);
            const now = Date.now();
            const cutoff = Timestamp.fromMillis(now - CACHE_TTL_MS);

            // Firestore Fetch (Optimization: fetch only recent)
            // Note: Vector search in Firestore is not native/efficient for similarity.
            // For Phase 1 (Infrastructure Real), we fetch recent cache items and do comparison in-memory.
            // For production with thousands of items, we would need Pinecone or Firestore Vector Search (Preview).
            const q = fsQuery(
                collection(db, CACHE_COLLECTION),
                where("timestamp", ">", cutoff)
            );

            const snapshot = await getDocs(q);

            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (data.embedding) {
                    const similarity = this.cosineSimilarity(queryEmbedding, data.embedding);
                    if (similarity >= SIMILARITY_THRESHOLD) {
                        console.log(`[SemanticCache] Hit! Similarity: ${similarity.toFixed(2)}`);
                        return JSON.parse(data.response);
                    }
                }
            }
        } catch (e) {
            console.error("Cache Read Error:", e);
        }
        return null;
    }

    async set(textQuery: string, response: any) {
        try {
            const embedding = await this.generateEmbedding(textQuery);
            await addDoc(collection(db, CACHE_COLLECTION), {
                query: textQuery,
                response: JSON.stringify(response),
                embedding,
                timestamp: Timestamp.now()
            });
        } catch (e) {
            console.error("Cache Write Error:", e);
        }
    }
}

export const semanticCache = new SemanticCache();
