import { AgentConfig, Attachment } from "../types";
import { fetchWithRetry } from "../utils/retry";
import { z } from "zod";
import { vectorStore } from "./vectorStore";
import { semanticCache } from "./cache";
import { validateCitations } from "./validator";
import { logAction } from "./audit";

// Zod Schemas for Validation (Item 5)
const ResponseSchema = z.object({
    text: z.string(),
    sources: z.array(z.string()).optional()
});

// Item 3: Sanitização de Input
const sanitize = (input: string) => input.replace(/[{}]/g, '').trim().substring(0, 10000);

export const sendMessageToGemini = async (
  agent: AgentConfig,
  history: { role: string; content: string }[],
  userMessage: string,
  attachments: Attachment[] = [],
  dossier: Attachment[] = [], // Recebe o dossiê completo
  config: { model?: 'flash' | 'pro', temperature?: number } = {} // Nova config (Item 4 e 5)
) => {
  // Semantic Cache Check
  const cached = await semanticCache.get(userMessage);
  if (cached) return cached;

  try {
    // URL do Backend Proxy
    const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat`;

    // Item 4: Timeout Handling (30s timeout para não travar UI)
    const timeoutPromise = new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout na requisição da IA (30s)')), 30000)
    );

    // Item 6: Retry Logic (com Timeout Race)
    const fetchPromise = fetchWithRetry(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent,
        history,
        userMessage: sanitize(userMessage), // Item 3
        attachments,
        dossier, // Envia para o backend processar (RAG/OCR)
        config
      }),
    });

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
        // Item 9: Fallback de Modelo (Simulado - em prod real, tentaria reenviar com 'flash' se 'pro' falhasse)
        if (response.status === 503 && config.model === 'pro') {
             console.warn("Gemini Pro falhou (503). Tentando Fallback para Flash...");
             // Recursão simples para fallback
             return sendMessageToGemini(agent, history, userMessage, attachments, dossier, { ...config, model: 'flash' });
        }
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errData = await response.json();
            if (errData.error) errorMessage = errData.error;
        } catch (e) {
            // Ignore json parse error on error response
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();

    // Item 5: Schema Validation
    const parsedData = ResponseSchema.parse(data);

    let finalText = parsedData.text;

    // Autonomous Agent Loop (Item 4: Self-Correction)
    // Se o agente for "Redator" ou "Revisor", ativamos o "Crítico" SE habilitado nas configs
    // Note: 'config' is { model?: 'flash'|'pro', temperature?: number, enableCritic?: boolean } based on usage, though type definition might be loose here.
    if (config.model === 'pro' && (config as any).enableCritic && (agent.id === 'PETITION' || agent.id === 'CONTRACT_REVIEW')) {
        console.log("[Autonomous] Iniciando ciclo de auto-crítica...");

        const criticPrompt = `
        ATUE COMO UM REVISOR SÊNIOR (CRITIC AGENT).
        Analise o texto abaixo gerado por um advogado júnior.
        Verifique:
        1. Se citou leis inexistentes (Alucinação).
        2. Se a tese faz sentido lógico.
        3. Se há erros de português.

        TEXTO:
        ${finalText}

        Se estiver bom, responda APENAS: "APROVADO".
        Se houver erros, responda com a versão corrigida diretamente.
        `;

        // Chamada Recursiva (Limitada a 1 nível para evitar loop infinito)
        // Nota: Em produção, usaríamos uma flag 'isCritic' para evitar recursão
        const criticResponse = await fetchWithRetry(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agent: { ...agent, id: 'CRITIC' }, // Virtual Agent
                history: [],
                userMessage: sanitize(criticPrompt),
                config: { model: 'flash' } // Crítico usa flash para ser rápido
            }),
        });

        if (criticResponse.ok) {
            const criticData = await criticResponse.json();
            const criticText = criticData.text;
            if (!criticText.includes("APROVADO") && criticText.length > 50) {
                console.log("[Autonomous] Texto corrigido pelo Agente Crítico.");
                finalText = criticText; // Substitui pelo texto melhorado
            } else {
                console.log("[Autonomous] Texto aprovado sem alterações.");
            }
        }
    }

    // Hallucination Validator (Item 7)
    const validation = await validateCitations(finalText);
    if (!validation.isValid) {
        console.warn("[Validator] Citações potencialmente inválidas:", validation.invalidCitations);
        const details = validation.details
            .filter((item) => !item.valid)
            .map((item) => `• ${item.citation} — ${item.status}: ${item.explanation}`)
            .join("\n");

        finalText += `\n\n⚠️ ALERTA DE CHECAGEM JURÍDICA:\n${details}`;
    }

    const result = {
        text: finalText,
        sources: parsedData.sources || []
    };

    // Cache the result
    await semanticCache.set(userMessage, result);

    // Audit Log (IA Generation)
    // Note: Logging only metadata, not the full generated text for privacy/cost
    // Assuming 'unknown' user as this service doesn't have direct access to auth context
    // In production, userId should be passed in 'config' or similar
    logAction('system', 'GENERATE_AI', { agent: agent.id, model: config.model });

    return result;

  } catch (error: any) {
    console.error("API Proxy Error:", error);
    return {
      text: `Erro de conexão com o servidor (Backend Proxy): ${error.message}. \n\nCertifique-se de que o arquivo 'server.js' está rodando na porta 3001 e a API_KEY está configurada no .env do servidor.`,
      sources: []
    };
  }
};

// Item 1: Streaming Service
export const streamMessageToGemini = async (
  agent: AgentConfig,
  history: { role: string; content: string }[],
  userMessage: string,
  attachments: Attachment[] = [],
  dossier: Attachment[] = [],
  config: { model?: 'flash' | 'pro', temperature?: number } = {},
  onChunk: (text: string) => void
) => {
  try {
    const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/stream`;

    // Hybrid RAG (Vector + Keywords) - Ingest raw dossier first
    if (dossier && dossier.length > 0) {
        // Mock: Convert attachments to text (assuming text-based for this layer, images handled by server OCR)
        // In a real app, backend would do embedding ingestion. Here we simulate client-side pre-processing.
        const textDocs = dossier.filter(d => d.mimeType.includes('text') || d.mimeType.includes('pdf'))
            .map(d => ({ text: atob(d.data), metadata: { name: d.name } }));

        if (textDocs.length > 0) {
            await vectorStore.addDocuments(textDocs);
        }
    }

    // Retrieve context relevant to user query
    const relevantChunks = await vectorStore.search(userMessage);
    const ragContext = relevantChunks.map(c => c.text).join('\n\n');

    // Item 6: Retry Logic for Stream Start
    const response = await fetchWithRetry(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent,
        history,
        userMessage,
        attachments,
        dossier,
        config
      }),
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    if (!response.body) throw new Error("ReadableStream not supported");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
           const dataStr = line.replace('data: ', '');
           if (dataStr === '[DONE]') break;

           try {
             const data = JSON.parse(dataStr);
             if (data.text) {
                fullText += data.text;
                onChunk(fullText);
             }
             if (data.error) throw new Error(data.error);
           } catch (e) {
             // Ignore partial json or parse errors
           }
        }
      }
    }

    return { text: fullText, sources: [] }; // Stream ainda não retorna sources separado facilmente, precisa adaptar backend se necessário

  } catch (error: any) {
    console.error("Stream Error:", error);
    return { text: `Erro no stream: ${error.message}`, sources: [] };
  }
};
