# FASE 5: Escala, Performance e Custo

## Gargalos de Escala

### 1. Vector Store em LocalStorage (Client-Side)
- **Implementação:** O `services/vectorStore.ts` salva embeddings no `localStorage` do navegador.
- **Limite:** Navegadores limitam o storage a ~5MB.
- **Consequência:** Após poucos uploads de PDFs (convertidos em texto), o armazenamento estourará. A aplicação quebrará para usuários pesados ("Power Users").
- **Solução:** Migrar para Vector Database Server-Side (Pinecone, Weaviate ou pgvector).

### 2. Processamento de Upload em Memória
- **Implementação:** `server.js` usa `multer.memoryStorage()`.
- **Cenário de Crise:** Se 100 usuários fizerem upload de arquivos de 10MB simultaneamente, o servidor consumirá ~1GB de RAM instantaneamente apenas para buffer, fora o overhead do Node.js e OCR.
- **Risco:** OOM (Out of Memory) e Crash do servidor backend.
- **Solução:** Stream direto para Firebase Storage ou S3, processando via Worker assíncrono.

### 3. WebSockets (Socket.io)
- **Estado:** O servidor roda WebSocket na mesma instância da API (`server.js`).
- **Escala Horizontal:** Sem um adaptador Redis (Redis Adapter), não é possível escalar o backend horizontalmente (adicionar mais instâncias). Usuários conectados em instâncias diferentes não se comunicarão.
- **Solução:** Extrair serviço de Colaboração para microserviço separado ou adicionar Redis.

## Análise de Custos (Estimativa)

### 1. Modelo de IA (Gemini)
- **Atual:** `gemini.ts` suporta Flash e Pro.
- **Custo:** Gemini 1.5 Pro é significativamente mais caro que o Flash.
- **Estratégia:** O sistema usa "Critic Loop" (Auto-reflexão) que pode dobrar ou triplicar o número de chamadas por interação.
- **Previsão:** Um contrato complexo (50 páginas) processado com "Critic" pode custar > $0.50 USD por execução. Para SaaS BRL, isso corrói a margem.
- **Recomendação:** Usar Gemini Flash para tarefas de rotina e RAG, reservando Pro apenas para geração final de peças complexas.

### 2. Banco de Dados (Firestore)
- **Leituras:** O `contextRanker` atual não bate no banco (usa memória/input), mas se migrar para busca vetorial real, cada mensagem custará leituras ou queries.
- **Audit Logs:** Logs gravados a cada ação (`audit.js`) podem gerar custos de escrita altos no Firestore.

## Conclusão da Fase
O sistema não é escalável em sua forma atual. O uso de `localStorage` para vetores e `memoryStorage` para uploads impõe um teto rígido de usuários e tamanho de arquivos. A arquitetura Monolítica impede escala horizontal dos WebSockets.
