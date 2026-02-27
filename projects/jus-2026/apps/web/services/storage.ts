import { Session, Template, AgentType } from '../types';
import { fetchWithRetry } from '../utils/retry';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// --- SESSIONS ---

export const getSessions = async (userId: string): Promise<Session[]> => {
  try {
    const res = await fetchWithRetry(`${API_URL}/api/sessions/${userId}`);
    if (!res.ok) throw new Error("Falha ao buscar sessões");
    const sessions = await res.json();
    return sessions;
  } catch (error) {
    console.error("Erro ao buscar sessões:", error);
    // Fallback to localStorage logic if API fails is tricky here as structure changed.
    // For now we return empty array on failure.
    return [];
  }
};

export const saveSession = async (session: Session, userId: string) => {
  try {
    const res = await fetchWithRetry(`${API_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...session, userId })
    });
    if (!res.ok) throw new Error("Falha ao salvar sessão");
    return await res.json();
  } catch (error) {
    console.error("Erro ao salvar sessão:", error);
    throw error;
  }
};

export const createNewSession = (agentId: AgentType, userId: string): Session => {
  const newId = Date.now().toString(); // Temporary ID, backend generates real one but we use optimistic UI

  const origins = ['Indicação', 'Google', 'Instagram', 'Linkedin', 'Outros'];
  const randomOrigin = origins[Math.floor(Math.random() * origins.length)] as any;
  const areas = ['Cível', 'Trabalhista', 'Família', 'Criminal', 'Tributário'];
  const randomArea = areas[Math.floor(Math.random() * areas.length)] as any;
  const contractValue = Math.floor(Math.random() * 5000) + 1500;

  return {
    id: newId,
    agentId: agentId,
    title: `Nova Tarefa`,
    messages: [],
    dossier: [],
    lastDocument: null,
    documentVersions: [],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    status: 'Em Aberto',
    clientOrigin: randomOrigin,
    contractValue: contractValue,
    paidAmount: 0,
    paymentStatus: 'Em Dia',
    area: randomArea
  };
};

export const deleteSession = async (sessionId: string) => {
  try {
    const res = await fetchWithRetry(`${API_URL}/api/sessions/${sessionId}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (error) {
    console.error("Erro ao deletar sessão:", error);
    return false;
  }
};

// --- TEMPLATES ---

export const saveTemplate = async (template: Omit<Template, 'id' | 'createdAt'>): Promise<string> => {
    try {
        const res = await fetchWithRetry(`${API_URL}/api/templates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(template)
        });
        if (!res.ok) throw new Error("Falha ao salvar template");
        const data = await res.json();
        return data.id;
    } catch (error) {
        console.error("Erro ao salvar template:", error);
        throw error;
    }
};

export const getTemplates = async (userId: string): Promise<Template[]> => {
    try {
        const res = await fetchWithRetry(`${API_URL}/api/templates/${userId}`);
        if (!res.ok) throw new Error("Falha ao buscar templates");
        return await res.json();
    } catch (error) {
        console.error("Erro ao buscar templates:", error);
        return [];
    }
};

export const deleteTemplate = async (templateId: string) => {
   try {
        const res = await fetchWithRetry(`${API_URL}/api/templates/${templateId}`, {
          method: 'DELETE'
        });
        return res.ok;
   } catch (error) {
       console.error("Erro ao deletar template:", error);
       return false;
   }
};
