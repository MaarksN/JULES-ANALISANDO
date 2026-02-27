import { GoogleGenAI } from '@google/genai';
import { retrieveContext } from './ragService.js';
import * as Prompts from '../data/prompts.js';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI(process.env.GEMINI_API_KEY) : null;

const AGENT_PROMPTS = {
    'PETITION': Prompts.PROMPT_PETITION_V1,
    'CONTRACT_REVIEW': Prompts.PROMPT_CONTRACT_REVIEW_V1,
    'JURISPRUDENCE': Prompts.PROMPT_JURISPRUDENCE_V1,
    'DEVIL_ADVOCATE': Prompts.PROMPT_DEVIL_ADVOCATE_V1,
    'JUDGE_ANALYST': Prompts.PROMPT_JUDGE_ANALYST_V1
};

export const sendMessage = async (user, agentId, userMessage, history = []) => {
    if (!genAI) throw new Error("AI Service Unavailable (Missing Key)");

    // 1. Retrieve Context (RAG)
    let contextData = { context: "", sources: [] };
    try {
        contextData = await retrieveContext(userMessage, user);
    } catch (e) {
        console.warn("RAG Retrieval Failed:", e);
    }

    // 2. Build System Prompt
    const basePrompt = AGENT_PROMPTS[agentId] || "Você é um assistente jurídico útil.";
    const systemPrompt = `
    ${Prompts.withFollowUp(basePrompt)}

    CONTEXTO RECUPERADO DO DOSSIÊ (RAG):
    ${contextData.context || "Nenhum documento relevante encontrado no dossiê."}
    `;

    // 3. Call LLM
    // Using Flash by default for speed/cost (Phase 7: "Redução Radical de Tokens")
    // Unless complex task
    const modelName = "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    // Format History for Gemini (User/Model)
    const chatHistory = history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
    }));

    const chatSession = model.startChat({
        history: [
            { role: 'user', parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }] },
            ...chatHistory
        ]
    });

    const result = await chatSession.sendMessage(userMessage);
    const responseText = result.response.text();

    // 4. Return Result + Sources
    return {
        text: responseText,
        sources: contextData.sources
    };
};
