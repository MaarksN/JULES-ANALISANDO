# FASE 4: Auditoria de IA, RAG e Alucinação Jurídica

## Diagnóstico do Subsistema de IA

### 1. Arquitetura de IA (Client-Side Risk)
- **Problema:** O arquivo `services/gemini.ts` no frontend contém a lógica de orquestração ("Chain of Thought", "Critic Loop", "Fallback").
- **Risco:** Exposição da lógica de prompt ("System Prompts") e parâmetros de temperatura para o navegador do cliente. Um usuário avançado pode interceptar e alterar o comportamento do agente.
- **Recomendação:** Toda a orquestração deve ser movida para o backend (`chatRoutes.js` e controllers).

### 2. Qualidade do RAG (Retrieval-Augmented Generation)
- **Implementação Atual:** O arquivo `backend/services/contextRanker.js` utiliza uma busca por contagem de palavras-chave simples (`query.includes(term)`).
- **Crítica:** Isso não é RAG semântico. Palavras diferentes com mesmo sentido (ex: "Carro" vs "Veículo") não darão match.
- **Risco de Alucinação:** Sem contexto relevante, o modelo tende a alucinar mais.
- **Necessidade:** Implementar Embeddings Reais (OpenAI Ada ou Google Gecko) e busca vetorial (Pinecone, Chroma ou extensão Vector do Postgres/Firebase).

### 3. Validação de Citações (Mock)
- **Estado:** O `services/validator.ts` opera com listas estáticas e heurísticas (ex: "Lei > 20000 é suspeita").
- **Realidade:** Isso é puramente ilustrativo. Não há validação real contra bases do Planalto ou STJ.
- **Perigo Jurídico:** O sistema pode aprovar leis inexistentes que passem na regex simples, gerando peças juridicamente frágeis.

### 4. Engenharia de Prompt e Ferramentas
- **Prompts:** Os prompts em `data/prompts.ts` são de alta qualidade (Chain of Thought, Personas, Saída Estruturada).
- **Tools:** O prompt instrui o uso de "Busca do Google". Se a configuração do Gemini no Backend não injetar a ferramenta `googleSearch`, o modelo irá alucinar que pesquisou.
- **Dependência:** O sistema depende fortemente da capacidade do modelo de seguir instruções complexas.

## Conclusão da Fase
A camada de IA é um "Protótipo Avançado" mas não um produto Enterprise. O RAG é simulado e a validação é mock. Para venda B2B (Escritórios), a validação de citações precisa ser real (integração Jusbrasil/Digesto).
