let GoogleGenerativeAI;
let OpenAI;

try {
    ({ GoogleGenerativeAI } = await import('google-generativeai'));
} catch {}

try {
    ({ default: OpenAI } = await import('openai'));
} catch {}

const SYSTEM_INSTRUCTION = `Você é um assistente jurídico especializado em Direito Brasileiro.
Cite sempre a fonte quando basear-se em jurisprudência. Nunca invente normas ou artigos.`;

const estimateTokens = (text = '') => Math.ceil((text || '').length / 4);
const withTimeout = async (promise, ms) => Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout de IA (${ms}ms)`)), ms))
]);

const ensureContextShape = (context = {}) => {
    if (typeof context === 'string') {
        return {
            documents: context ? [{ text: context, metadata: { type: 'legacy-context' } }] : [],
            jurisprudence: []
        };
    }

    return {
        documents: Array.isArray(context.documents) ? context.documents : [],
        jurisprudence: Array.isArray(context.jurisprudence) ? context.jurisprudence : []
    };
};

const buildPrompt = (prompt, rawContext = {}, systemPrompt) => {
    const context = ensureContextShape(rawContext);
    const sections = [systemPrompt || SYSTEM_INSTRUCTION];

    if (context.documents.length) {
        const docs = context.documents
            .map((doc, i) => `Documento ${i + 1}:\n${typeof doc === 'string' ? doc : doc.text || ''}`)
            .join('\n\n');
        sections.push(`CONTEXTO JURÍDICO RELEVANTE:\n${docs}`);
    }

    if (context.jurisprudence.length) {
        const jur = context.jurisprudence
            .map((j, i) => `[${i + 1}] ${typeof j === 'string' ? j : j.citation || j.text || ''}`)
            .join('\n');
        sections.push(`JURISPRUDÊNCIA RELACIONADA:\n${jur}`);
    }

    sections.push(`PERGUNTA DO USUÁRIO:\n${prompt}`);
    return { promptText: sections.join('\n\n'), context };
};

const normalizeSources = (context = {}) => ([
    ...(context.documents || []).map((d) => d.metadata || d),
    ...(context.jurisprudence || []).map((j) => j.metadata || j)
]);

const truncateToTokenBudget = (text = '', maxTokens = 120000) => {
    if (!text) return text;
    const maxChars = maxTokens * 4;
    if (text.length <= maxChars) return text;
    return `${text.slice(0, maxChars)}\n\n[Contexto truncado automaticamente para evitar overflow de tokens.]`;
};

class AIOrchestrator {
    constructor() {
        this.gemini = GoogleGenerativeAI && process.env.GEMINI_API_KEY
            ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
            : null;
        this.openai = OpenAI && process.env.OPENAI_API_KEY
            ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
            : null;
        this.maxInputTokens = Number(process.env.AI_MAX_INPUT_TOKENS || 120000);
        this.defaultModel = process.env.AI_PRIMARY_MODEL || 'gemini-1.5-pro';
        this.fallbackModel = process.env.AI_FALLBACK_MODEL || 'gpt-4o';
        this.timeoutMs = Number(process.env.AI_TIMEOUT_MS || 45000);
    }

    async generate(prompt, rawContext = {}, options = {}) {
        const { promptText, context } = buildPrompt(prompt, rawContext, options.systemPrompt);
        const safePrompt = truncateToTokenBudget(promptText, this.maxInputTokens);

        let text = '';
        let model = 'service-unavailable';

        try {
            if (!this.gemini) throw new Error('Gemini indisponível');
            const geminiModel = this.gemini.getGenerativeModel({ model: options.model || this.defaultModel });
            const result = await withTimeout(geminiModel.generateContent(safePrompt), this.timeoutMs);
            text = result.response.text();
            model = options.model || this.defaultModel;
        } catch {
            if (this.openai) {
                const completion = await withTimeout(this.openai.chat.completions.create({
                    model: options.fallbackModel || this.fallbackModel,
                    temperature: options.temperature ?? 0.2,
                    messages: [
                        { role: 'system', content: options.systemPrompt || SYSTEM_INSTRUCTION },
                        { role: 'user', content: safePrompt }
                    ]
                }), this.timeoutMs);
                text = completion.choices?.[0]?.message?.content || '';
                model = options.fallbackModel || this.fallbackModel;
            } else {
                text = 'Serviço de IA indisponível no ambiente atual.';
            }
        }

        const tokensUsed = estimateTokens(safePrompt) + estimateTokens(text);
        return { text, model, tokensUsed, sources: normalizeSources(context) };
    }

    async generateStream(prompt, rawContext = {}, options = {}) {
        const { promptText, context } = buildPrompt(prompt, rawContext, options.systemPrompt);
        const safePrompt = truncateToTokenBudget(promptText, this.maxInputTokens);

        if (!this.gemini) {
            return {
                model: 'service-unavailable',
                sources: normalizeSources(context),
                stream: (async function* () {
                    yield { text: () => 'Streaming indisponível: GEMINI_API_KEY/SDK não configurados.' };
                }())
            };
        }

        const geminiModel = this.gemini.getGenerativeModel({ model: options.model || this.defaultModel });
        const stream = await withTimeout(geminiModel.generateContentStream(safePrompt), this.timeoutMs);
        return {
            model: options.model || this.defaultModel,
            sources: normalizeSources(context),
            stream: stream.stream
        };
    }
}

export const aiOrchestrator = new AIOrchestrator();
export { ensureContextShape, truncateToTokenBudget, estimateTokens };
