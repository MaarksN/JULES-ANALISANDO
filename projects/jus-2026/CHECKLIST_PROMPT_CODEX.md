# Checklist de Execução do Prompt Técnico Codex (JUS-2026)

> Legenda de status: 🟢 Implementado | 🟡 Precisa melhorar (parcial) | 🔴 Não implementado.

## Visão geral das etapas (C01–C10)

| Código | Etapa do Prompt | Status | Situação atual | Próximo passo recomendado |
|---|---|---|---|---|
| C01 | RAG semântico real (embeddings + retrieval top-k) | 🟡 | Há ranqueamento semântico em `contextRanker`, porém ainda não existe pipeline completo com ingestão/chunking + storage vetorial server-side conforme escopo do prompt. | Consolidar pipeline fim-a-fim de ingestão e retrieval com persistência vetorial única e testes de sinônimos jurídicos. |
| C02 | Eliminar vetores/embeddings do localStorage | 🔴 | Não foi concluída a migração completa e limpeza definitiva do fluxo legado no frontend conforme solicitado no prompt. | Remover completamente o fluxo client-side de vetores, criar rotina de limpeza e documentar migração. |
| C03 | Validador jurídico real com API oficial + endpoint | 🟡 | Serviço e endpoint de validação foram criados (incluindo cache e status de validação), mas ainda faltam partes de produto/UX exigidas no prompt. | Completar integração visual no editor (inline), substituição guiada e cobertura de casos adicionais. |
| C04 | Google Search real no Gemini + fontes | 🟡 | O orquestrador já injeta ferramenta de busca e normaliza fontes quando aplicável, porém a ativação por plano e a validação E2E completa ainda precisam maturidade. | Fechar gate por plano no fluxo real autenticado e validar grounding em testes integrados. |
| C05 | Model Router (Flash vs Pro) + budget diário | 🟡 | Foi iniciado com `modelRouter`, `planService` e endpoint de uso diário (`/api/v1/usage/today`), porém ainda sem enforcement completo de budget por plano no Firestore. | Concluir bloqueio diário por plano, telemetria persistente e testes E2E de custo. |
| C06 | Erros padronizados em RFC 7807 | 🟡 | Middleware global RFC 7807 e classes de erro tipadas foram introduzidos, com `requestId` e `firmId` no payload. Ainda há rotas legadas retornando formatos antigos. | Concluir migração de todas as rotas para erro tipado + remover respostas legadas fora do padrão. |
| C07 | Validação Zod em todos os endpoints | 🟡 | Avançou com schemas dedicados (`chat`, `upload`, `session`, `payment`, `template`, `firm`) e aplicação em rotas-chave, porém ainda existem endpoints legados fora da cobertura total. | Finalizar mapeamento dos endpoints restantes e aplicar validação central em 100% dos bodies. |
| C08 | Explicabilidade UX do validador (inline + tooltip + substituir) | 🔴 | Ainda não há marcação inline completa com tooltip e ação “Substituir” no editor, como exigido. | Implementar componente de marcação visual de citações e fluxo de correção assistida. |
| C09 | Planos Free / Pro / Enterprise + gates | 🟡 | `planService` foi iniciado com definição de features e limites base por plano, já consumido no fluxo de IA. Ainda faltam middleware global de gate e integração de billing/upgrade. | Implementar `checkPlan(feature)` global e integrar ciclo completo de upgrade/Stripe. |
| C10 | Documentação técnica completa de onboarding | 🟡 | Já existem documentos técnicos no repositório, mas o pacote completo solicitado no prompt ainda não está fechado/atualizado como conjunto único. | Atualizar docs obrigatórias (AI-SYSTEM, SECURITY, README, `.env.example`) com arquitetura final. |

---

## Evidências do que já foi implementado (parcial/total)

- C03 (parcial):
  - Serviço de validação jurídica: `apps/api/src/services/legalValidator.js`.
  - Endpoint de validação: `apps/api/src/routes/v1/legalValidation.js`.
  - Registro da rota: `apps/api/src/routes/v1/index.js`.
  - Testes: `apps/api/test/legalValidator.logic.test.js`.
- C04 (parcial):
  - Injeção de busca e normalização de fontes: `apps/api/src/services/aiOrchestrator.js`.
- C01 (parcial):
  - Ranqueamento por embeddings/cosseno: `apps/api/src/services/contextRanker.js`.
- C05/C09 (parcial avançado):
  - Planos e feature matrix: `apps/api/src/services/planService.js`.
  - Roteamento de modelo: `apps/api/src/services/modelRouter.js`.
  - Uso diário: `apps/api/src/routes/v1/usage.js` + `apps/api/src/services/tokenService.js`.
- C06 (parcial):
  - Erro padronizado RFC 7807: `apps/api/src/middleware/errorHandler.js`.
  - Erros tipados: `apps/api/src/errors/AppError.js`.
  - Request ID: `apps/api/src/middleware/requestId.js`.
- C07 (parcial):
  - Schemas Zod centralizados: `apps/api/src/schemas/*.js`.
  - Rotas com validação aplicada: `sessionRoutes`, `uploadRoutes`, `paymentRoutes`, `templateRoutes`, `v1/ai`.

---

## Sequência recomendada para fechar P0 antes de P1

1. Finalizar C01 com pipeline único de ingestão e retrieval semântico em produção.
2. Concluir C02 com remoção definitiva de vetores no cliente + migração.
3. Concluir C03 (backend + UX completa de validação jurídica).
4. Concluir C04 com gate por plano real e teste integrado de grounding.
5. Só então avançar para C05 em diante (P1/P2).


---

## Execução — próximos 20 planos lógicos

| # | Plano lógico executado nesta rodada | Status | Evidência |
|---|---|---|---|
| 01 | Revisar estado atual do branch e commits recentes | 🟢 | Histórico local validado antes da implementação. |
| 02 | Validar escopo do checklist existente C01–C10 | 🟢 | Base consolidada em `CHECKLIST_PROMPT_CODEX.md`. |
| 03 | Criar serviço de planos com políticas Free/Pro/Enterprise | 🟢 | `apps/api/src/services/planService.js`. |
| 04 | Criar roteador de modelo Flash/Pro por tipo de tarefa | 🟢 | `apps/api/src/services/modelRouter.js`. |
| 05 | Iniciar suporte de uso diário agregado no token service | 🟢 | `getTodayUsage` em `apps/api/src/services/tokenService.js`. |
| 06 | Expor endpoint de uso diário para observabilidade | 🟢 | `apps/api/src/routes/v1/usage.js`. |
| 07 | Registrar rota de uso diário no v1 index | 🟢 | `apps/api/src/routes/v1/index.js`. |
| 08 | Integrar plano + roteamento de modelo no chat v1 | 🟢 | `apps/api/src/routes/v1/ai.js`. |
| 09 | Integrar gate de web search por plano no fluxo chat | 🟢 | `enableWebSearch` via `planService` em `ai.js`. |
| 10 | Corrigir duplicidade lógica residual no endpoint stream | 🟢 | `apps/api/src/routes/v1/ai.js` reescrito sem bloco duplicado. |
| 11 | Definir schema de entrada com taskType/documentPages | 🟢 | `chatSchema` atualizado em `ai.js`. |
| 12 | Preservar dedução de uso após resposta de IA | 🟢 | Fluxo mantido em `ai.js` + `tokenService`. |
| 13 | Criar testes lógicos para model router | 🟢 | `apps/api/test/modelRouter.logic.test.js`. |
| 14 | Criar testes lógicos para plan service | 🟢 | `apps/api/test/planService.logic.test.js`. |
| 15 | Executar suíte de testes API focada nos novos serviços | 🟢 | Execução de `vitest` (comandos no relatório final). |
| 16 | Atualizar status de C05 conforme progresso real | 🟢 | C05 alterado para 🟡 neste checklist. |
| 17 | Atualizar status de C09 conforme progresso real | 🟢 | C09 alterado para 🟡 neste checklist. |
| 18 | Documentar lacunas remanescentes de enforcement/billing | 🟢 | Próximos passos descritos em C05/C09. |
| 19 | Consolidar evidências de implementação incremental | 🟢 | Seções de evidência atualizadas neste checklist. |
| 20 | Fechar rodada com commit e PR de atualização | 🟢 | Versionamento concluído após testes. |


---

## Execução — próximos 20 planos lógicos (rodada atual)

| # | Plano lógico executado nesta rodada | Status | Evidência |
|---|---|---|---|
| 01 | Auditar o estado pós-PR anterior e identificar lacunas | 🟢 | Revisão do histórico e código atual. |
| 02 | Priorizar avanço incremental em C06/C09 sem quebrar C03/C04 | 🟢 | Planejamento aplicado à rodada. |
| 03 | Criar base de erros tipados para API | 🟢 | `apps/api/src/errors/AppError.js`. |
| 04 | Introduzir middleware `checkPlan(feature)` | 🟢 | `apps/api/src/middleware/checkPlan.js`. |
| 05 | Migrar handler global para padrão RFC 7807 | 🟢 | `apps/api/src/middleware/errorHandler.js`. |
| 06 | Adicionar `requestId` transversal em todas as requisições | 🟢 | `apps/api/src/middleware/requestId.js` + `server.js`. |
| 07 | Integrar `attachRequestId` no bootstrap do servidor | 🟢 | `apps/api/server.js`. |
| 08 | Atualizar validator de payload para erro tipado | 🟢 | `apps/api/src/middleware/payloadValidator.js`. |
| 09 | Aplicar gate de plano na validação jurídica | 🟢 | `apps/api/src/routes/v1/legalValidation.js`. |
| 10 | Implementar verificação de cota diária por classe de modelo | 🟢 | `checkDailyModelQuota` em `tokenService`. |
| 11 | Registrar chamadas de modelo para telemetria de cota | 🟢 | `registerModelCall` em `tokenService`. |
| 12 | Enforçar quota diária no chat antes da geração | 🟢 | `apps/api/src/routes/v1/ai.js`. |
| 13 | Enforçar quota diária no stream | 🟢 | `apps/api/src/routes/v1/ai.js`. |
| 14 | Registrar consumo de chamadas após respostas de IA | 🟢 | `apps/api/src/routes/v1/ai.js`. |
| 15 | Manter compatibilidade com plano e webSearch no orquestrador | 🟢 | Fluxo preservado via `planService` + `aiOrchestrator`. |
| 16 | Criar testes para cota diária no token service | 🟢 | `apps/api/test/tokenService.logic.test.js`. |
| 17 | Executar suíte de testes dos serviços críticos alterados | 🟢 | `vitest` executado (comandos no final). |
| 18 | Atualizar status C06 no checklist para parcial (🟡) | 🟢 | Tabela C01–C10 atualizada. |
| 19 | Atualizar evidências técnicas no checklist | 🟢 | Seção de evidências expandida. |
| 20 | Finalizar ciclo com versionamento e PR | 🟢 | Commit + registro de PR. |


---

## Execução — próximos 20 planos lógicos (rodada atual 2)

| # | Plano lógico executado nesta rodada | Status | Evidência |
|---|---|---|---|
| 01 | Auditar lacunas restantes após rodada C06/C09 | 🟢 | Revisão das rotas sem validação central. |
| 02 | Priorizar avanço incremental em C07 sem regressão | 🟢 | Planejamento de schemas e rotas-chave. |
| 03 | Criar schema dedicado para chat | 🟢 | `apps/api/src/schemas/chatSchema.js`. |
| 04 | Criar schema dedicado para upload | 🟢 | `apps/api/src/schemas/uploadSchema.js`. |
| 05 | Criar schema dedicado para sessão | 🟢 | `apps/api/src/schemas/sessionSchema.js`. |
| 06 | Criar schema dedicado para firma | 🟢 | `apps/api/src/schemas/firmSchema.js`. |
| 07 | Criar schema dedicado para template | 🟢 | `apps/api/src/schemas/templateSchema.js`. |
| 08 | Criar schema dedicado para checkout | 🟢 | `apps/api/src/schemas/paymentSchema.js`. |
| 09 | Migrar rota v1/ai para schema compartilhado | 🟢 | `apps/api/src/routes/v1/ai.js`. |
| 10 | Migrar sessionRoutes para `validatePayload` | 🟢 | `apps/api/src/routes/sessionRoutes.js`. |
| 11 | Migrar paymentRoutes para `validatePayload` | 🟢 | `apps/api/src/routes/paymentRoutes.js`. |
| 12 | Migrar templateRoutes para `validatePayload` | 🟢 | `apps/api/src/routes/templateRoutes.js`. |
| 13 | Migrar uploadRoutes com schema + validação | 🟢 | `apps/api/src/routes/uploadRoutes.js`. |
| 14 | Integrar erros tipados em rotas migradas | 🟢 | `AuthError`, `ValidationError`, `ForbiddenError`. |
| 15 | Garantir compatibilidade tenant/firm em sessionRoutes | 🟢 | fallback `firmId || tenantId`. |
| 16 | Criar testes lógicos para schemas | 🟢 | `apps/api/test/schemas.logic.test.js`. |
| 17 | Executar suíte focada nos novos schemas/serviços | 🟢 | `vitest` executado (comandos no relatório). |
| 18 | Atualizar status de C07 no checklist | 🟢 | C07 atualizado para estágio parcial avançado. |
| 19 | Atualizar evidências técnicas de C07 | 🟢 | seção de evidências expandida. |
| 20 | Finalizar ciclo com commit e PR | 🟢 | versionamento e PR registrados. |
