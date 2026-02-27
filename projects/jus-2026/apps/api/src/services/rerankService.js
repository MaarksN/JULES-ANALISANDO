/**
 * Item 6: Serviço de Re-ranking (RAG Refinement)
 * Funcionalidades:
 * 1. Simulação de Cross-Encoder (Cohere/BGE).
 * 2. Reordenação de contextos baseada em relevância semântica fina.
 */

export const rerank = async (query, documents) => {
    if (!documents || documents.length === 0) return [];

    console.log(`[RERANK] Reordenando ${documents.length} documentos para a query: "${query}"`);

    // Mock de Cross-Encoder (Score Aleatório ponderado por keyword overlap)
    // Em produção: chamar API de Re-ranker

    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);

    const scoredDocs = documents.map(doc => {
        let score = 0;
        // Boost por palavras chave exatas (Simulação de atenção)
        keywords.forEach(kw => {
            if (doc.text.toLowerCase().includes(kw)) score += 0.5;
        });

        // Penalidade por tamanho excessivo (chunks muito longos diluem contexto)
        if (doc.text.length > 2000) score -= 0.1;

        return { ...doc, rerankScore: score };
    });

    return scoredDocs.sort((a, b) => b.rerankScore - a.rerankScore);
};
