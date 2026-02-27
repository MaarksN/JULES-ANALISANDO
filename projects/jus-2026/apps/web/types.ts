
export enum AgentType {
  PETITION = 'PETITION',
  CONTRACT_REVIEW = 'CONTRACT_REVIEW',
  JURISPRUDENCE = 'JURISPRUDENCE',
  COMPARISON = 'COMPARISON',
  DEVIL_ADVOCATE = 'DEVIL_ADVOCATE',
  JUDGE_ANALYST = 'JUDGE_ANALYST',
  EXPERT_WITNESS = 'EXPERT_WITNESS'
}

export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // base64
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  sources?: string[]; // For grounding (URLs)
  isThinking?: boolean;
  attachments?: Attachment[];
  suggestions?: string[]; // Sugestões de follow-up (Item 11)
}

export interface AgentConfig {
  id: AgentType;
  name: string;
  role: string;
  description: string;
  icon: string; // Lucide icon name
  systemPrompt: string;
  suggestedPrompts: string[];
}

export interface DocumentVersion {
  id: string;
  content: string;
  createdAt: string; // ISO string
  label: string; // e.g., "Versão Inicial IA", "Edição Manual 1"
  author: 'IA' | 'User';
}

export interface UserProfile {
  name: string;
  oab: string;
  firmName?: string;
  officeContext?: string; // Memória do escritório
  globalVariables?: Record<string, string>; // Variáveis padrão para documentos
  preferences?: {
      fontFamily: 'Times New Roman' | 'Arial' | 'Garamond' | 'Courier New';
      fontSize: number; // pt
      theme: 'light' | 'dark';
      hasSeenOnboarding?: boolean;
      // Configurações de IA (Item 4 e 5)
      aiModel?: 'flash' | 'pro';
      temperature?: number;
      enableCritic?: boolean; // Item: Toggle Agente Crítico
      styleSample?: string; // Item 4: Style Cloning (Texto extraído do PDF)
  }
}

export interface Session {
  id: string;
  agentId: AgentType;
  title: string;
  messages: Message[];
  dossier: Attachment[]; // Novo: Arquivos de contexto (RAG Pessoal)
  lastDocument: string | null;
  documentVersions: DocumentVersion[]; // Array of versions
  updatedAt: string; // ISO string for storage
  createdAt: string; // ISO string
  status: 'Em Aberto' | 'Concluído';

  // Analytics & BI Fields
  clientOrigin?: 'Indicação' | 'Google' | 'Instagram' | 'Linkedin' | 'Outros';
  contractValue?: number; // Honorários totais
  paidAmount?: number; // Quanto já foi pago
  paymentStatus?: 'Em Dia' | 'Inadimplente' | 'Quitado';
  area?: 'Cível' | 'Trabalhista' | 'Família' | 'Criminal' | 'Tributário' | 'Outros';
  deleted?: boolean; // Item 15: Soft Delete
}

export interface Template {
  id: string;
  userId: string;
  title: string;
  description?: string;
  content: string;
  agentId: AgentType;
  createdAt: string;
  category: 'Pessoal' | 'Sistema';
}