import { Lead, SalesKit, Competitor, DecisionMaker } from './types';

const postAI = async <T>(endpoint: string, body: unknown, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(`/api/ai/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error || 'Erro na API de IA');
  }
  return json.data as T;
};

export const searchNewLeads = async (
  sector: string,
  location: string,
  keywords: string,
  size: string,
  quantity: number,
  signal?: AbortSignal,
): Promise<Partial<Lead>[]> => postAI('search-leads', { sector, location, keywords, size, quantity }, signal);

export const enrichDecisionMakers = async (companyName: string, location?: string, signal?: AbortSignal): Promise<DecisionMaker[]> => {
  const result = await postAI<{ decisionMakers: DecisionMaker[] }>('enrich', { companyName, location }, signal);
  return result.decisionMakers || [];
};

export const generateSalesKit = async (companyName: string, sector: string, signal?: AbortSignal): Promise<SalesKit | null> => postAI('sales-kit', { companyName, sector }, signal);

export const analyzeCompetitors = async (companyName: string, location?: string, signal?: AbortSignal): Promise<Competitor[]> => {
  const result = await postAI<{ competitors: Competitor[] }>('enrich', { companyName, location }, signal);
  return result.competitors || [];
};

export const checkLocationData = async (companyName: string, city: string, signal?: AbortSignal): Promise<string> => {
  const result = await postAI<{ mapsResult: string }>('enrich', { companyName, location: city }, signal);
  return result.mapsResult || 'Não foi possível validar a localização.';
};

export const generateMarketingImage = async (): Promise<null> => {
  throw new Error('Geração de imagem agora requer integração segura via Vertex AI no backend.');
};

export const generateVideoAsset = async (): Promise<null> => {
  throw new Error('Geração de vídeo Veo removida: modelo público indisponível.');
};

export const generateSpeech = async (text: string, signal?: AbortSignal) => {
  const base64Audio = await postAI<string | null>('tts', { text }, signal);
  return base64Audio ? `data:audio/mp3;base64,${base64Audio}` : null;
};

export const deepReasoning = async (query: string, signal?: AbortSignal) => postAI<string>('thinking', { query }, signal);

export const transcribeAudio = async (base64Audio: string, mimeType: string, signal?: AbortSignal) => postAI<string>('transcribe', { base64Audio, mimeType }, signal);

export const analyzeVisualContent = async (base64Data: string, mimeType: string, prompt: string, signal?: AbortSignal) => postAI<string>('analyze-visual', { base64Data, mimeType, prompt }, signal);

export const executeAITool = async (
  promptTemplate: string,
  inputs: Record<string, string>,
  systemRole: string = 'Assistente de Vendas de Alta Performance',
  signal?: AbortSignal,
): Promise<string | null> => {
  let finalPrompt = promptTemplate;
  Object.keys(inputs).forEach((key) => {
    finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), inputs[key] || '');
  });
  return postAI<string>('execute-tool', { prompt: finalPrompt, systemRole }, signal);
};
