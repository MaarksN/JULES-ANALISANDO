export type CitationValidationItem = {
    citation: string;
    valid: boolean;
    status: 'vigente' | 'revogada' | 'not_found' | 'não_verificada';
    explanation: string;
    suggestedReplacement?: string | null;
};

export type CitationValidationResult = {
    isValid: boolean;
    invalidCitations: string[];
    details: CitationValidationItem[];
};

const extractCitations = (text: string): string[] => {
    const citationRegex = /Lei\s*(?:n[ºo]\s*)?\d{1,5}(?:\.\d{3})?\s*[\/.-]\s*\d{2,4}/gi;
    return [...new Set(text.match(citationRegex) || [])];
};

export const validateCitations = async (text: string): Promise<CitationValidationResult> => {
    const citations = extractCitations(text);

    if (!citations.length) {
        return {
            isValid: true,
            invalidCitations: [],
            details: []
        };
    }

    const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/v1/validate/citations`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ citations })
        });

        if (!response.ok) {
            throw new Error(`Falha na validação jurídica (${response.status})`);
        }

        const payload = await response.json();
        const details: CitationValidationItem[] = payload.results || [];
        const invalidCitations = details.filter((item) => !item.valid).map((item) => item.citation);

        return {
            isValid: invalidCitations.length === 0,
            invalidCitations,
            details
        };
    } catch {
        return {
            isValid: false,
            invalidCitations: citations,
            details: citations.map((citation) => ({
                citation,
                valid: false,
                status: 'não_verificada',
                explanation: 'Não foi possível validar as citações na base oficial no momento.'
            }))
        };
    }
};
