# FASE 2: Mapeamento Arquitetural Sistêmico

## Visão Geral
O JusArtificial opera como uma aplicação SaaS Monolítica (Modular Monolith) com Frontend desacoplado (SPA) e Backend em Node.js.

## Diagrama de Fluxo de Dados

```mermaid
graph TD
    User[Usuário Advogado] -->|HTTPS| Frontend[React SPA / Vite]
    User -->|WSS| WebSocket[Socket.io Server]

    subgraph Client Side
        Frontend --> Auth[Firebase Auth SDK]
        Frontend --> State[Zustand Store]
        Frontend --> AIService[gemini.ts (Client Orchestrator)]
    end

    subgraph Backend Infra
        Frontend -->|REST API| API[Express API Gateway]
        WebSocket --> Collab[Collaboration Service (Yjs)]

        API --> AuthMw[Auth Middleware (Firebase Admin)]
        API --> Routing[Routes Layer]

        Routing --> ChatCtrl[Chat Controller]
        Routing --> DocCtrl[Document Controller]

        ChatCtrl --> Context[Context Ranker (RAG)]
        ChatCtrl --> Gemini[Google Gemini API]

        DocCtrl --> OCR[OCR Service (pdf-parse/Tesseract)]
        DocCtrl --> DB[Firestore Database]
    end

    subgraph External Services
        Gemini -->|LLM Response| ChatCtrl
        Auth -->|Token| API
    end
```

## Fluxos Críticos

### 1. Fluxo de Inteligência Artificial (RAG + Generation)
1. **Input:** Usuário envia mensagem + Anexos (PDFs).
2. **Processamento Local (Client):** `gemini.ts` sanitiza e estrutura o payload.
3. **Ingestão/OCR (Backend):** Arquivos são processados via OCR no upload (`/api/upload`) ou processados on-the-fly.
4. **Contexto:** Backend (`contextRanker.js`) seleciona trechos relevantes.
5. **Geração:** Chamada à API do Gemini via SDK `@google/genai`.
6. **Validação:** Retorno passa por validação de alucinação (client-side `validator.ts` - **Ponto de Atenção: validação deveria ser server-side**).

### 2. Fluxo de Colaboração em Tempo Real
1. **Conexão:** Usuário conecta via Socket.io no namespace do documento.
2. **Sincronização:** Utiliza Yjs (CRDT) para resolução de conflitos automática.
3. **Persistência:** Dados são salvos periodicamente no Firestore.

### 3. Fluxo de Autenticação e Segurança
1. **Login:** Firebase Auth no Frontend.
2. **Sessão:** Token JWT enviado em cada requisição.
3. **Validação:** Middleware `authenticate` verifica assinatura do token.
4. **Dados:** Firestore usa regras de segurança (supostamente) ou o backend atua como gatekeeper total.

## Pontos de Fragilidade Arquitetural

1. **Client-Side Orchestration:** O arquivo `gemini.ts` no frontend contém lógica de negócio crítica (tentativas de retry, fallback de modelo, validação de alucinação). Isso expõe a lógica a manipulação e duplica responsabilidades.
2. **Auth Permissiva:** O backend não reforça autenticação em todas as rotas (comentários explícitos sobre "demo mode"), o que viola princípios de Zero Trust.
3. **Estado em Memória:** Uso de `multer.memoryStorage()` e variáveis globais para jobs pode causar estouro de memória sob carga (Memory Leak risk).
4. **Acoplamento:** O Backend mistura responsabilidades de API Gateway, Processador de IA e Servidor de WebSocket. Para escala enterprise, o serviço de WebSocket e Workers de OCR deveriam ser separados.

## Conclusão da Fase
A arquitetura é funcional para um MVP robusto, mas carece de separação de responsabilidades para escala massiva (Enterprise). A segurança precisa sair do modo "demo" para "enforced".
