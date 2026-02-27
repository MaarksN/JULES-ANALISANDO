const FLASH_MODEL = 'gemini-1.5-flash';
const PRO_MODEL = 'gemini-1.5-pro';

const SIMPLE_TASKS = new Set(['SUMMARY', 'METADATA_EXTRACTION', 'CHAT_SIMPLE', 'RAG_RETRIEVAL']);
const COMPLEX_TASKS = new Set(['PETITION', 'CONTRACT_REVIEW', 'LEGAL_ANALYSIS', 'CRITIC_LOOP']);

export const routeModel = ({ taskType = 'CHAT_SIMPLE', documentPages = 0, requestedModel } = {}) => {
    if (requestedModel === PRO_MODEL || requestedModel === FLASH_MODEL) {
        return requestedModel;
    }

    if (COMPLEX_TASKS.has(taskType)) return PRO_MODEL;
    if (documentPages > 10) return PRO_MODEL;
    if (SIMPLE_TASKS.has(taskType)) return FLASH_MODEL;

    return FLASH_MODEL;
};

export const shouldRunCriticLoop = ({ taskType = 'CHAT_SIMPLE', enabled = false } = {}) => {
    if (!enabled) return false;
    return taskType === 'PETITION' || taskType === 'CONTRACT_REVIEW';
};

export const modelRouter = {
    routeModel,
    shouldRunCriticLoop,
    models: { FLASH_MODEL, PRO_MODEL }
};
