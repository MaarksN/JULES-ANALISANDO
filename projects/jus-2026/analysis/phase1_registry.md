# FASE 1: Ingestão Técnica e Classificação de Código

## Resumo da Ingestão
- **Total de Arquivos:** ~185 (estimado)
- **Estrutura:** Monorepo (Node.js Backend + React/Vite Frontend)
- **Frameworks:** Express.js, React 19, Vite, Firebase, TailwindCSS.

## Classificação de Arquivos Críticos

### 1. Backend Core (`/backend`)
| Arquivo | Função | Tipo | Dependências | Risco Inicial |
|---------|--------|------|--------------|---------------|
| `server.js` | Entry Point, Configuração de Servidor, WebSockets | Infra/API | Express, Socket.io, Multer | **Alto** (Auth não estrito, Rate Limit permissivo para demo) |
| `backend/middleware/authMiddleware.js` | Autenticação Firebase | Segurança | Firebase Admin | **Médio** (Lógica correta, mas bypass de teste pode vazar para prod se mal configurado) |
| `backend/routes/chatRoutes.js` | Endpoint de Chat IA | API | Google GenAI, ContextRanker | **Alto** (Processamento de IA, Custo, Contexto) |
| `backend/routes/sessionRoutes.js` | Gestão de Sessões | API | Sessions Service | **Baixo** (CRUD padrão) |
| `backend/services/contextRanker.js` | Ragueamento/Ranking de Contexto | IA Service | - | **Médio** (Qualidade da recuperação de informação) |

### 2. Frontend Services (`/services`)
| Arquivo | Função | Tipo | Dependências | Risco Inicial |
|---------|--------|------|--------------|---------------|
| `services/gemini.ts` | Cliente de IA, Orquestração, Fallback | Client Logic | Fetch, Zod, Cache | **Alto** (Lógica de retry/fallback complexa no cliente, expõe regras de negócio) |
| `services/validator.ts` | Validação de Citações (Alucinação) | AI Safety | Regex/Lists | **Médio** (Validação baseada em regras pode ser frágil) |
| `services/audit.ts` | Logging de Auditoria | Segurança | - | **Baixo** |

### 3. Frontend Components (`/components`)
| Arquivo | Função | Tipo | Dependências | Risco Inicial |
|---------|--------|------|--------------|---------------|
| `components/ChatInterface.tsx` | Interface de Chat Principal | UI | useChatController | **Médio** (UX complexa) |
| `components/LoginScreen.tsx` | Login e Auth | UI | Firebase Auth | **Alto** (Ponto de entrada de segurança) |

### 4. Configuração e Infra
| Arquivo | Função | Tipo | Dependências | Risco Inicial |
|---------|--------|------|--------------|---------------|
| `package.json` | Dependências | Config | - | **Baixo** |
| `.env` (não versionado) | Segredos | Config | - | **Crítico** (Gestão de chaves) |

## Observações Preliminares
1. **Autenticação Frágil:** O `server.js` menciona que a autenticação não é estritamente forçada em todas as rotas para fins de "demo". Isso é um bloqueador para produção.
2. **Lógica de IA no Cliente:** Muita lógica de orquestração de IA (fallback, critic loop) está no `gemini.ts` (frontend), o que pode ser inseguro ou difícil de manter. Deveria estar no backend.
3. **Risco de Placeholder:** Detectado possível código de placeholder ou corrompido em alguns arquivos durante a leitura (ex: comentários de overwrite).

## Próximos Passos
- Mapeamento detalhado da arquitetura (Fase 2).
- Auditoria profunda de segurança no backend (Fase 3).
