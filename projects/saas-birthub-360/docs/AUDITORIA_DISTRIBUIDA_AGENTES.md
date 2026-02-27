# Auditoria Técnica Completa — SAAS-BIRTHUB-AGENTES-360

## Escopo e método

- Escopo auditado: apps (`api-gateway`, `agent-orchestrator`, `webhook-receiver`), todos os agentes em `agents/*`, pacotes compartilhados (`queue`, `llm-client`, `integrations`, `db`, `utils`) e testes existentes.
- Método: leitura de arquitetura + análise estática de código + revisão de fluxos assíncronos + modelagem de ameaça para agentes + simulação teórica de escala (100/1k/10k agentes concorrentes).
- Limitação objetiva: o repositório está parcialmente em modo MVP/mocks, então parte dos riscos são “latentes” (aparecerão quando os stubs forem conectados a produção).

---

## FASE 1 — Mapeamento dos agentes e plataforma

### 1) Tipos de agentes identificados

**Agentes especialista FastAPI + LangGraph**:
- `marketing`, `ldr`, `sdr`, `ae`, `pos-venda`, `analista`, `financeiro`, `juridico`.
- Base comum em `BaseAgent` com `graph.ainvoke(state)` + log no PostgreSQL (`AgentLog`).

### 2) Orquestradores

- **Orquestrador central**: `apps/agent-orchestrator/main.py` com endpoint `/run/lifecycle`.
- **Fluxo principal**: `FLOW_LEAD_LIFECYCLE_GRAPH` em `apps/agent-orchestrator/orchestrator/flows.py`.
- Estratégia atual: chamadas HTTP síncronas entre serviços (ex.: LDR `/run`, `/score`) dentro do grafo.

### 3) Workers

- Worker TS dedicado do LDR (`agents/ldr/worker.ts`) usando BullMQ.
- Worker genérico Node (`agents/shared/node_worker.js`) para ponte fila->agente.
- Workers TypeScript dedicados por agente (`agents/*/worker.ts`) usam BullMQ e despacho HTTP para `/run`.

### 4) Fila

- BullMQ + Redis em `packages/queue/src/index.ts`.
- Configuração de tentativas/prioridades/CRON em `packages/queue/src/definitions.ts`.

### 5) Cache

- Não há camada de cache semântico de LLM implementada.
- Redis é usado para fila, não para memoization de prompts/respostas.

### 6) Banco

- Logging operacional de agentes no PostgreSQL via `asyncpg` (`agents/shared/base_agent.py`).
- Camada de dados do API Gateway para leads está in-memory (`Map`), sem persistência real (`apps/api-gateway/src/repositories/lead-repository.ts`).

### 7) Ferramentas externas

- LLM: Gemini (pacote Python base e `packages/llm-client`).
- Integrações: Stripe, Resend, Pagarme, Asaas, Focus NFe, Clicksign, DocuSign, HubSpot, Pipedrive, Svix, Google Ads/Calendar, Meta APIs (`packages/integrations/src/index.ts`).

### 8) APIs integradas

- API Gateway HTTP com JWT, rate-limit básico e múltiplas rotas placeholder.
- Webhook receiver FastAPI aceita assinatura Svix apenas por presença de header (não valida criptograficamente).
- Orquestrador chama agentes por HTTP interno.

---

## FASE 2 — Análise profunda por componente

> Observação: para não gerar ruído com arquivos de build/config, a análise “arquivo a arquivo” foi consolidada por **componentes executáveis** (cada componente lista explicitamente os arquivos críticos).

### A) Núcleo de agentes (todos)

**Arquivos:** `agents/shared/base_agent.py`, `agents/*/agent.py`, `agents/*/main.py`, `agents/*/tools.py`, `agents/*/worker.ts`.

- **Responsabilidade:** execução de workflow LangGraph por domínio + ferramentas especializadas + exposição HTTP.
- **Fluxo de execução:** `main.py` recebe payload -> monta estado -> `BaseAgent.run` -> `graph.ainvoke` -> log em DB.
- **Estado do agente:** dicionário mutável (`context`, `output`, `actions_taken`, `messages`, `error`) sem versionamento de schema por etapa.
- **Persistência:** apenas trilha no `AgentLog`; não há event store/histórico de estado por transição.
- **Tratamento de erro:** captura ampla (`except Exception`) e retorno de estado com `error`; sem taxonomia de falhas.
- **Timeout:** inconsistente. Alguns tools usam `httpx.AsyncClient(timeout=10/20)`, outros não têm timeout explícito.
- **Retry:** quase inexistente em tools Python; dependente de retry da fila quando há worker BullMQ.
- **Logging:** predominância de `print` e `console.log`; sem correlação estruturada de trace-id entre serviços.
- **Risco de loop infinito:** baixo no LangGraph (grafos finitos), mas **médio** nos supervisores `while True` de worker Python (dependem de saúde externa).
- **Risco de custo explosivo LLM:** alto latente (sem budget guardrail por sessão/tenant/modelo e sem cache semântico).
- **Risco de execução arbitrária:** baixo-médio hoje (não há `eval`), mas há `subprocess.Popen` para levantar processos auxiliares.

### B) Orquestrador multi-agent

**Arquivos:** `apps/agent-orchestrator/main.py`, `apps/agent-orchestrator/orchestrator/flows.py`.

- **Responsabilidade:** coordenação lead lifecycle e roteamento por score.
- **Fluxo:** `/run/lifecycle` inicia estado -> `ldr_enrich` -> `ldr_score` -> branch condicional (AE/SDR/nurture/disqualify).
- **Estado:** único objeto com score/tier/actions/error.
- **Persistência:** inexistente no orquestrador (sem checkpoint do grafo).
- **Erro:** falhas viram string em `error` ou HTTP 500.
- **Timeout/Retry:** sem política explícita nos `httpx.AsyncClient` do orquestrador.
- **Logging:** `print` somente.
- **Loop infinito:** baixo no grafo atual.
- **Custo LLM:** baixo no arquivo em si (não chama LLM direto), porém amplifica custo ao encadear agentes sem controle de orçamento.
- **Execução arbitrária:** baixa.

### C) API Gateway

**Arquivos:** `apps/api-gateway/src/server.ts`, `apps/api-gateway/src/middleware/auth.ts`, `apps/api-gateway/src/routes/index.ts`, `apps/api-gateway/src/repositories/lead-repository.ts`.

- **Responsabilidade:** borda HTTP, JWT, rate limiting, catálogo de rotas.
- **Fluxo:** middleware globais -> autenticação condicional -> handlers.
- **Estado:** stateless no processo, mas repositório de leads em memória.
- **Persistência:** não persistente para leads (reinício perde dados).
- **Erro:** handlers têm try/catch local para alguns endpoints; padrão parcial.
- **Timeout:** não aplicável na maioria das rotas por serem stubs locais.
- **Retry:** inexistente na borda.
- **Logging:** `morgan dev`; sem padrão de auditoria de segurança por endpoint sensível.
- **Loop infinito:** baixo.
- **Custo LLM:** indireto.
- **Execução arbitrária:** baixa.

### D) Camada de fila

**Arquivos:** `packages/queue/src/index.ts`, `packages/queue/src/definitions.ts`, `agents/shared/node_worker.js`, `agents/ldr/worker.ts`.

- **Responsabilidade:** enfileirar, processar, agendar jobs recorrentes.
- **Fluxo:** produtor adiciona jobs -> worker consome -> chama HTTP do agente.
- **Estado:** estado principal em Redis/BullMQ.
- **Persistência:** Redis (depende de política de durability externa).
- **Erro:** propagação por throw e eventos `failed`.
- **Timeout:** não há timeout de job por padrão nos workers mostrados.
- **Retry:** definido por fila (`attempts/backoff`) mas sem DLQ explícita.
- **Logging:** console básico.
- **Loop infinito:** baixo no BullMQ; médio em workers supervisores Python.
- **Custo LLM:** risco de reprocessamento elevar custo em cascata sem idempotência.
- **Execução arbitrária:** média por bridge genérica HTTP (se payload malicioso atingir agente vulnerável).

### E) Webhook receiver

**Arquivos:** `apps/webhook-receiver/main.py`, `apps/webhook-receiver/src/server.ts`.

- **Responsabilidade:** ingestão de eventos externos.
- **Risco crítico:** validação Svix incompleta (apenas checa se header existe).
- **Persistência / reprocessamento / idempotência:** ausentes.
- **Rate limit / anti-replay:** ausentes.

### F) Clientes LLM e integrações

**Arquivos:** `packages/llm-client/src/index.ts`, `packages/integrations/src/index.ts`, `packages/integrations/src/clients/*`.

- **Responsabilidade:** abstração de provedores externos.
- **Ponto positivo:** `GeminiClient` com retry exponencial simples.
- **Gap:** sem circuit breaker, sem limites de custo/token por tenant, sem cache e sem fallback de modelo por SLA/custo.

---

## FASE 3 — Segurança de agentes (classificação)

## Matriz de risco (severidade)

1. **CRÍTICO — Autenticação de webhook fraca / spoofing de eventos**
   - Evidência: endpoint aceita webhook apenas com presença de header `svix_signature`, sem verificação criptográfica.
   - Impacto: injeção de eventos falsos, execução indevida de fluxos financeiros/jurídicos, fraude operacional.

2. **ALTO — Ausência de guardrails contra prompt/tool injection**
   - Evidência: não há camada explícita de sanitização/allowlist de instruções por ferramenta no runtime dos agentes.
   - Impacto: desvio de comportamento do agente, chamadas indevidas a integrações externas.

3. **ALTO — Falta de limites de custo de IA**
   - Evidência: ausência de budget por execução/tenant/modelo, sem kill-switch de token.
   - Impacto: custo explosivo e indisponibilidade financeira.

4. **ALTO — Ausência de validação forte de autorização entre serviços internos**
   - Evidência: chamadas internas HTTP entre orquestrador/workers/agentes sem mTLS ou assinatura de serviço demonstrada.
   - Impacto: movimento lateral interno e acionamento indevido de agente.

5. **MÉDIO — Subprocess supervision loops sem hardening**
   - Evidência: `subprocess.Popen` + `while True` em workers Python.
   - Impacto: processos órfãos, restart storm, consumo de recursos.

6. **MÉDIO — Observabilidade insuficiente para forense**
   - Evidência: logs não estruturados e sem correlation-id padronizado ponta-a-ponta.
   - Impacto: investigação lenta em incidente.

7. **MÉDIO — Exfiltração de dados via integrações externas**
   - Evidência: múltiplos conectores habilitáveis por env sem política de classificação/mascaração no ponto de envio.
   - Impacto: vazamento de dados sensíveis.

---

## FASE 4 — Escalabilidade e custo (100 / 1k / 10k agentes)

## Cenário A: 100 agentes concorrentes
- **Provável comportamento:** sistema funciona com degradação leve.
- **Gargalos:** DB log por execução (conexão por chamada no `asyncpg.connect`), ausência de pooling explícito no `BaseAgent`.
- **Custo IA:** já sensível sem cache de prompts repetidos.

## Cenário B: 1.000 agentes concorrentes
- **Provável comportamento:** filas crescem; latência de ponta aumenta muito.
- **Gargalos principais:**
  - saturação Redis/BullMQ sem particionamento por domínio;
  - contenção de conexões DB por logging síncrono por execução;
  - fan-out HTTP no orquestrador sem bulkhead.
- **Risco de overload API externa:** alto (CRM, transcrição, pagamentos).

## Cenário C: 10.000 agentes concorrentes
- **Provável comportamento:** colapso parcial sem redesign.
- **Falhas esperadas:** timeout em cascata, retry storm, backlog infinito, custo de IA não previsível.

## Estratégias recomendadas

1. **Batching**
   - Agrupar tarefas homogêneas por tenant/campanha (ex.: enriquecimento LDR em lotes de 20-100).
   - Batch API calls externas com janela temporal curta.

2. **Memoization / cache semântico**
   - Chavear por `(tenant, tool_name, normalized_input_hash, model)` com TTL.
   - Cache de embeddings e respostas deterministicamente reaproveitáveis.

3. **Streaming e controle de custo**
   - Streaming token para UX e cancelamento precoce.
   - Circuit breaker por orçamento diário, limite por execução e fallback de modelo barato.

4. **Arquitetura de escala**
   - Sharding de filas por domínio + prioridade.
   - Worker autoscaling baseado em lag de fila e p95 de job.
   - DLQ obrigatória + deduplicação/idempotência por job key.

---

## FASE 5 — Testes e confiabilidade

## Estado atual
- Testes existentes cobrem health checks e parte do repositório de leads.
- Lacuna: ausência de testes de segurança de agentes, caos, carga sistêmica e contratos entre serviços.

## Plano de teste recomendado

1. **Teste de contrato (consumer-driven) entre gateway/orquestrador/agentes**
2. **Teste de idempotência de jobs BullMQ**
3. **Teste de falha parcial de integrações externas (timeouts 429/500)**
4. **Teste de injeção (prompt/tool/webhook payload)**
5. **Teste de budget LLM (limite por execução + limite diário)**
6. **Teste de recuperação (worker crash + replay controlado)**

## Testes de caos sugeridos
- Derrubar Redis por 60s durante pico.
- Injetar latência de 3-5s em provedores de transcrição/CRM.
- Invalidar 10% de tokens de integração e medir isolamento de falha.

## Testes de carga sugeridos
- Perfis: 100, 1k, 10k jobs concorrentes por domínio.
- KPIs: lag da fila, p95 end-to-end, erro por tipo, custo token/min, taxa de retry e uso de memória por worker.

---

## FASE 6 — Integração com SAAS-BIRTHUB-360

## Contrato de API
- Precisa formalizar versionamento semântico (`/v1`) para endpoints críticos de agentes/orquestrador.
- Definir contratos de evento (JSON Schema/Avro) para filas e webhooks.

## Autenticação entre serviços
- Recomendado: JWT de serviço curto + mTLS interno (ou assinatura HMAC por chamada interna).
- Toda chamada agente<->orquestrador deve carregar identidade de serviço e escopo.

## Modelo de comunicação ideal
- **Síncrono** apenas para comandos de baixa latência.
- **Assíncrono** para tarefas de IA e integrações externas (padrão recomendado).
- Outbox/inbox pattern para consistência e replay seguro.

## Arquitetura alvo recomendada
- API Gateway -> Orchestrator (comando)
- Orchestrator -> Event Bus/Fila (eventos)
- Workers por domínio (LDR/SDR/AE/...) com idempotência
- State store de workflow (checkpoint)
- Observabilidade unificada (traces + métricas + logs estruturados)

---

## FASE 7 — Checklist master

## Segurança de Agentes

- [ ] Validar assinatura Svix criptograficamente em todos webhooks.
  - Prioridade: Alta
  - Risco: Crítico
  - Impacto financeiro: Alto
  - Arquivos: `apps/webhook-receiver/main.py`, `apps/webhook-receiver/src/server.ts`
  - Status: Pendente

- [ ] Implementar policy engine anti prompt/tool injection (allowlist por tool + validação de argumentos).
  - Prioridade: Alta
  - Risco: Alto
  - Impacto financeiro: Alto
  - Arquivos: `agents/shared/base_agent.py`, `agents/*/agent.py`, `agents/*/tools.py`
  - Status: Pendente

- [ ] Adicionar autenticação mútua entre orquestrador/workers/agentes.
  - Prioridade: Alta
  - Risco: Alto
  - Impacto financeiro: Médio-Alto
  - Arquivos: `apps/agent-orchestrator/orchestrator/flows.py`, `agents/shared/node_worker.js`, `agents/ldr/worker.ts`
  - Status: Pendente

## Performance

- [ ] Introduzir connection pooling e escrita assíncrona em lote para `AgentLog`.
  - Prioridade: Alta
  - Risco: Alto
  - Impacto financeiro: Médio
  - Arquivos: `agents/shared/base_agent.py`
  - Status: Pendente

- [ ] Sharding de filas por domínio e prioridade + DLQ.
  - Prioridade: Alta
  - Risco: Alto
  - Impacto financeiro: Médio
  - Arquivos: `packages/queue/src/index.ts`, `packages/queue/src/definitions.ts`
  - Status: Pendente

- [ ] Timeouts e bulkheads por integração externa.
  - Prioridade: Alta
  - Risco: Alto
  - Impacto financeiro: Médio
  - Arquivos: `agents/*/tools.py`, `packages/integrations/src/clients/*`
  - Status: Pendente

## Custo de IA

- [ ] Budget guardrails (por execução/usuário/tenant/dia).
  - Prioridade: Alta
  - Risco: Alto
  - Impacto financeiro: Crítico
  - Arquivos: `agents/shared/base_agent.py`, `packages/llm-client/src/index.ts`, `apps/agent-orchestrator/*`
  - Status: Pendente

- [ ] Cache semântico + deduplicação de prompts.
  - Prioridade: Alta
  - Risco: Alto
  - Impacto financeiro: Alto
  - Arquivos: `packages/llm-client/src/index.ts`, `packages/queue/src/index.ts`
  - Status: Pendente

## Arquitetura

- [ ] Checkpoint de estado de workflow + replay controlado.
  - Prioridade: Média-Alta
  - Risco: Médio-Alto
  - Impacto financeiro: Médio
  - Arquivos: `apps/agent-orchestrator/orchestrator/flows.py`
  - Status: Pendente

- [ ] Contratos de eventos versionados e testes CDC.
  - Prioridade: Média-Alta
  - Risco: Médio
  - Impacto financeiro: Médio
  - Arquivos: `packages/shared-types/src/index.ts`, `apps/api-gateway/src/docs/openapi.ts`
  - Status: Pendente

---

## FASE 8 — Relatório executivo

1. **Nota técnica geral (0–10): 5.8**
   - Pontos fortes: separação por domínios, uso de LangGraph/BullMQ, começo de observabilidade.
   - Pontos fracos: segurança de webhook, ausência de controle de custo de IA, confiabilidade distribuída incompleta.

2. **Risco de custo descontrolado: ALTO**
   - Sem guardrails de token/custo, sem cache, sem limitação por tenant.

3. **Risco de exploração de agentes: ALTO (com vetor crítico em webhooks)**
   - Falsificação de evento e ausência de policy engine contra injection.

4. **Maturidade da arquitetura: MÉDIA-BAIXA para produção crítica**
   - Boa direção arquitetural, porém com componentes ainda em mock e hardening incompleto.

5. **Plano estratégico de evolução (90 dias)**
   - **0-30 dias:** corrigir segurança crítica (Svix verify real, auth service-to-service, rate limit por origem, auditoria de payload).
   - **31-60 dias:** implantar budget guardrail IA + cache semântico + idempotência/DLQ.
   - **61-90 dias:** observabilidade distribuída completa (OpenTelemetry), testes de caos/carga e autoscaling por SLO.

## Veredito final (brutalmente honesto)

A base é promissora, mas **não está pronta para operação de alto risco/custo em produção**. O projeto precisa de um sprint focado em **segurança de execução de agentes**, **governança de custo de LLM** e **resiliência distribuída** antes de escalar tráfego real.
