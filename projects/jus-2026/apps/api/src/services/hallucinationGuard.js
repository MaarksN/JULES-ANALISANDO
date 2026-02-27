const CITATION_REGEX = /(?:art\.?\s?\d+[\wº°-]*|artigo\s+\d+[\wº°-]*|súmula\s?\d+|lei\s?n?[ºo]?\s?\d+[\d\/.\-]*|acórdão\s?[\w\-/.]+|tema\s?\d+\s?(?:stf|stj)?)/gim;

const normalize = (value = '') => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const extractCitations = (response = '') => {
    const hits = response.match(CITATION_REGEX) || [];
    return [...new Set(hits.map((hit) => hit.trim()))];
};

const sourceToText = (source) => {
    if (typeof source === 'string') return source;
    const textPart = source?.text || source?.chunk_text || '';
    const metaPart = source?.metadata ? JSON.stringify(source.metadata) : JSON.stringify(source || {});
    return `${textPart} ${metaPart}`;
};

export const postProcessResponse = (response, sources = []) => {
    const citations = extractCitations(response);
    const corpus = normalize(sources.map(sourceToText).join(' '));

    const unverifiedCitations = citations.filter((citation) => {
        const citationNorm = normalize(citation);
        if (!citationNorm) return false;
        return !corpus.includes(citationNorm);
    });

    return {
        response,
        citations,
        unverifiedCitations,
        valid: unverifiedCitations.length === 0,
        warning: unverifiedCitations.length ? 'Citação não verificada' : undefined
    };
};

export const validateCitations = (aiResponse, ragContext) => {
    const sources = Array.isArray(ragContext) ? ragContext : [ragContext];
    return postProcessResponse(aiResponse, sources);
};
