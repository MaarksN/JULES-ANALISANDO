import { GoogleGenAI, Modality, Type } from '@google/genai';
import { config } from '../config';

const getClient = () => {
  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured on server');
  }
  return new GoogleGenAI({ apiKey: config.geminiApiKey });
};

export const geminiModels = {
  flash: 'gemini-2.0-flash',
  thinking: 'gemini-2.0-flash-thinking-exp-01-21',
  image: 'imagen-3.0-generate-001',
};

export const searchLeadsWithGemini = async (payload: {
  sector: string;
  location: string;
  keywords: string;
  size: string;
  quantity: number;
}) => {
  const ai = getClient();
  const prompt = `Atue como um especialista de elite em inteligência de vendas B2B.
Encontre EXATAMENTE ${payload.quantity} empresas reais e ativas no setor de "${payload.sector}" localizadas em "${payload.location}".
Filtro de precisão: Tamanho "${payload.size}", Foco estratégico em "${payload.keywords}".
Retorne JSON com companyName, location, sector, website, phone, score, techStack, tags, revenueEstimate e matchReason.`;

  const response = await ai.models.generateContent({
    model: geminiModels.flash,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            location: { type: Type.STRING },
            sector: { type: Type.STRING },
            website: { type: Type.STRING },
            phone: { type: Type.STRING },
            score: { type: Type.NUMBER },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            revenueEstimate: { type: Type.STRING },
            matchReason: { type: Type.STRING },
          },
          required: ['companyName', 'location', 'score', 'matchReason'],
        },
      },
    },
  });

  return response.text ? JSON.parse(response.text) : [];
};

export const salesKitWithGemini = async (companyName: string, sector: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: geminiModels.flash,
    contents: `Crie um Kit de Vendas B2B para ${companyName} (${sector}) em JSON com valueProposition,emailSubject,emailBody,phoneScript,cadence,objectionHandling`,
    config: {
      responseMimeType: 'application/json',
    },
  });

  return response.text ? JSON.parse(response.text) : null;
};

export const enrichWithGemini = async (companyName: string, location?: string) => {
  const ai = getClient();
  const [decisionResponse, competitorsResponse, mapsResponse] = await Promise.all([
    ai.models.generateContent({
      model: geminiModels.flash,
      contents: `Identifique 3 cargos prováveis de decisores na empresa ${companyName}. Retorne array JSON com name, role, linkedin.`,
      config: { responseMimeType: 'application/json' },
    }),
    ai.models.generateContent({
      model: geminiModels.flash,
      contents: `Liste 3 concorrentes de ${companyName} e ponto forte principal. Retorne array JSON com name, strength.`,
      config: { responseMimeType: 'application/json' },
    }),
    ai.models.generateContent({
      model: geminiModels.flash,
      contents: `Encontre endereço e avaliações recentes para ${companyName} em ${location || 'Brasil'}.`,
      config: { tools: [{ googleMaps: {} }] },
    }),
  ]);

  const warning = '⚠️ Dados inferidos por IA — podem não corresponder a pessoas reais. Não usar sem verificação.';
  const decisionMakers = decisionResponse.text ? JSON.parse(decisionResponse.text) : [];

  return {
    decisionMakers: (decisionMakers as Array<Record<string, string>>).map((dm) => ({ ...dm, warning })),
    competitors: competitorsResponse.text ? JSON.parse(competitorsResponse.text) : [],
    mapsResult: mapsResponse.text || '',
    warning,
  };
};

export const executeToolWithGemini = async (prompt: string, systemRole: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: geminiModels.flash,
    contents: [{ role: 'user', parts: [{ text: `SYSTEM ROLE: ${systemRole}\n\n${prompt}` }] }],
    config: { temperature: 0.7 },
  });
  return response.text || '';
};

export const deepReasonWithGemini = async (query: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: geminiModels.thinking,
    contents: query,
    config: { thinkingConfig: { thinkingBudget: 32768 } },
  });
  return response.text || '';
};

export const ttsWithGemini = async (text: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: geminiModels.flash,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
};

export const transcribeWithGemini = async (base64Audio: string, mimeType: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: geminiModels.flash,
    contents: { parts: [{ inlineData: { mimeType, data: base64Audio } }, { text: 'Transcribe this audio precisely.' }] },
  });
  return response.text || '';
};

export const analyzeVisualWithGemini = async (base64Data: string, mimeType: string, prompt: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: geminiModels.thinking,
    contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }] },
  });
  return response.text || '';
};
