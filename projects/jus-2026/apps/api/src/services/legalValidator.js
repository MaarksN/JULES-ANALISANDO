const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const cache = new Map();

const KNOWN_LAWS = {
    '8.666/1993': {
        valid: false,
        status: 'revogada',
        explanation: 'A Lei 8.666/1993 foi revogada pela Lei 14.133/2021 (Nova Lei de Licitações).',
        suggestedReplacement: 'Lei 14.133/2021'
    },
    '14.133/2021': {
        valid: true,
        status: 'vigente',
        explanation: 'A Lei 14.133/2021 está vigente e disciplina licitações e contratos administrativos.',
        suggestedReplacement: null
    }
};

const normalizeLawId = (citation = '') => {
    const match = String(citation)
        .replace(/\s+/g, ' ')
        .match(/lei\s*(?:n[ºo]\s*)?(\d{1,5}(?:\.\d{3})*)\s*[\/.-]\s*(\d{2,4})/i);

    if (!match) return null;

    const rawNumber = match[1].replace(/\./g, '');
    const year = match[2].length === 2 ? `19${match[2]}` : match[2];
    const formattedNumber = Number(rawNumber).toLocaleString('pt-BR');

    return {
        number: rawNumber,
        year,
        key: `${formattedNumber}/${year}`
    };
};

const normalizeLexmlResponse = (json) => {
    if (!json || typeof json !== 'object') return null;
    const revoked = json.revogadaEm || json.dataRevogacao || json.revogacao || null;
    const ementa = json.ementa || json.descricao || 'Norma localizada na base oficial.';
    return {
        valid: !revoked,
        status: revoked ? 'revogada' : 'vigente',
        explanation: revoked
            ? `A norma consta como revogada na base oficial (revogação em ${revoked}).`
            : ementa,
        suggestedReplacement: null
    };
};

const fetchFromLexml = async ({ number, year }, signal) => {
    const endpoint = `https://www.lexml.gov.br/urn/urn:lex:br:federal:lei:${year};${number}`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal
    });

    if (response.status === 404) {
        return {
            valid: false,
            status: 'not_found',
            explanation: 'A citação não foi encontrada na base oficial consultada.',
            suggestedReplacement: null
        };
    }

    if (!response.ok) {
        throw new Error(`Falha na consulta LexML (${response.status})`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        const text = await response.text();
        if (!text.trim()) throw new Error('Resposta vazia na consulta LexML');
        return {
            valid: true,
            status: 'vigente',
            explanation: 'Norma encontrada na base oficial.',
            suggestedReplacement: null
        };
    }

    const data = await response.json();
    const normalized = normalizeLexmlResponse(data);
    if (!normalized) {
        throw new Error('Não foi possível interpretar a resposta da base oficial');
    }

    return normalized;
};

const withTimeout = async (promiseFactory, timeoutMs = 2800) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await promiseFactory(controller.signal);
    } finally {
        clearTimeout(timer);
    }
};

export const validateCitation = async (citation) => {
    const law = normalizeLawId(citation);

    if (!law) {
        return {
            citation,
            valid: false,
            status: 'not_found',
            explanation: 'Formato de citação não reconhecido para validação automática.',
            suggestedReplacement: null
        };
    }

    const cached = cache.get(law.key);
    if (cached && cached.expiresAt > Date.now()) {
        return { citation, ...cached.result };
    }

    const known = KNOWN_LAWS[law.key];
    if (known) {
        cache.set(law.key, { result: known, expiresAt: Date.now() + TWENTY_FOUR_HOURS_MS });
        return { citation, ...known };
    }

    try {
        const result = await withTimeout((signal) => fetchFromLexml(law, signal));
        cache.set(law.key, { result, expiresAt: Date.now() + TWENTY_FOUR_HOURS_MS });
        return { citation, ...result };
    } catch {
        return {
            citation,
            valid: false,
            status: 'não_verificada',
            explanation: 'Não foi possível confirmar a vigência na base oficial no momento. Tente novamente em instantes.',
            suggestedReplacement: null
        };
    }
};

export const validateCitationsBatch = async (citations = []) => {
    const unique = [...new Set(citations.filter(Boolean))];
    const results = await Promise.all(unique.map((citation) => validateCitation(citation)));

    return {
        results,
        summary: {
            total: results.length,
            valid: results.filter((item) => item.valid).length,
            invalid: results.filter((item) => !item.valid).length
        }
    };
};
