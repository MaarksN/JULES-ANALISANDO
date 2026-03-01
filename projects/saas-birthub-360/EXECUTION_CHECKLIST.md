# BirtHub 360 — Execution Checklist (2026 Edition)

> Última atualização: 2026-02-22 13:00 UTC
> Progresso geral: 153/153 itens concluídos (153 🟢, 0 🟡, 0 🔴)

---

## 🎯 Planos de Execução (Jules & Codex)

> **Novo Paradigma:** O projeto agora segue a metodologia de Ondas de Execução (Jules) e Engine de Implementação (Codex).

- **[JULES Program Plan](docs/JULES_PROGRAM_PLAN.md):** Visão estratégica, Ondas (1-4), Cronograma, RACI e Governança.
- **[CODEX Task List](docs/CODEX_TASK_LIST.md):** Lista tática de execução com 100 ações (I01-I50 e M01-M50) e critérios de aceitação.

*Consultar os documentos acima para o roadmap detalhado.*

## 📜 Histórico de Planos Lógicos

- Documento operacional original em `docs/PROXIMO_PLANO_LOGICO.md`.
- Execução dos planos lógicos registrada em `docs/PLANOS_LOGICOS_*_IMPLEMENTADOS.md`.

## 🧱 Plano de Evolução — Fase 1 (Fundação Crítica)

| Status | Item | Observações |
| ------ | ---- | ----------- |
| 🟢 | 1. Índices no Prisma | Índices de Lead, Deal, Invoice, Activity e AgentLog confirmados no schema. |
| 🟢 | 2. Connection Pool compartilhado | `agents/shared/db_pool.py` com pool global + `get_pool()`/`close_pool()`; BaseAgent usa `pool.acquire()`. |
| 🟢 | 3. Limpeza de config duplicada dashboard | Mantido apenas `next.config.mjs`, com `reactStrictMode` e `output: "standalone"`. |
| 🟢 | 4. Tenant rate limit ativado | Middleware aplicado no API Gateway para `/api/v1` com `windowMs=60_000` e `max=30`. |
| 🟢 | 5. Versionamento `/api/v1` | Prefixo aplicado e redirect legado `/api/* -> /api/v1/*`; OpenAPI/Swagger alinhados. |
| 🟢 | 6. Worker BullMQ autônomo | Worker LDR TypeScript mantido via script dedicado (`dev:ldr-worker`) e script global de workers adicionado. |
| 🟢 | 7. Empacotamento shared Python | `agents/shared/pyproject.toml` presente, dependência editável incluída e workaround de `sys.path.append` removido. |
| 🟢 | 8. Terraform `main.tf` base | Provider Google e `locals` de `project/region/env` definidos. |
| 🟢 | 9. Terraform CloudSQL + Redis | Módulos base de Cloud SQL Postgres 16 e Redis standard configurados. |
| 🟢 | 10. Terraform Secrets + IAM | Secret Manager alinhado ao `.env.example` e módulo `iam.tf` com service accounts e papéis mínimos. |
| 🟢 | 11. Backend Core Foundation | I01, I07, I08, M01, M06, M27, M42 implementados (Logger, Auth, Repositories, Idempotency). |
| 🟢 | 12. Security & Observability | M11, M07 implementados (Auth RBAC, OpenTelemetry). |
| 🟢 | 13. Billing Feature | I04 implementado (Billing Repository/Service com agregação SQL). |

## 📦 FASE 1 — Infraestrutura Base

| Status | Item                                    | Observações                                                           |
| ------ | --------------------------------------- | --------------------------------------------------------------------- |
| 🟢     | Monorepo configurado (pnpm + Turborepo) | Configurado e verificado.                                             |
| 🟢     | Docker Compose funcionando localmente   | Configurado e verificado (imagens Chainguard para evitar rate limit). |
| 🟢     | PostgreSQL conectado e rodando          | Container definido e executável (Chainguard).                         |
| 🟢     | Redis conectado e rodando               | Container definido e executável (Chainguard).                         |
| 🟢     | Elasticsearch configurado               | Container definido e executável.                                      |
| 🟢     | Supabase Auth configurado               | Variáveis de ambiente e parâmetros JWT documentados no .env.example.  |
| 🟢     | Google Cloud Storage configurado        | Bucket/projeto e credenciais de serviço parametrizados no .env.example. |
| 🟢     | .env.example completo                   | Criado e validado.                                                    |

## 🗄️ FASE 2 — Banco de Dados

| Status | Item                               | Observações                                                     |
| ------ | ---------------------------------- | --------------------------------------------------------------- |
| 🟢     | Schema Prisma completo             | Definido em packages/db/prisma/schema.prisma e verificado.      |
| 🟢     | Migration inicial rodando          | Migration SQL inicial gerada em packages/db/prisma/migrations. |
| 🟢     | Model: Organization                |                                                                 |
| 🟢     | Model: User                        |                                                                 |
| 🟢     | Model: Lead                        |                                                                 |
| 🟢     | Model: Deal                        |                                                                 |
| 🟢     | Model: Activity                    |                                                                 |
| 🟢     | Model: EmailCadence                |                                                                 |
| 🟢     | Model: Customer                    |                                                                 |
| 🟢     | Model: Contract                    |                                                                 |
| 🟢     | Model: Invoice                     |                                                                 |
| 🟢     | Model: SupportTicket               |                                                                 |
| 🟢     | Model: Commission                  |                                                                 |
| 🟢     | Model: AgentLog                    |                                                                 |
| 🟢     | Seed de dados para desenvolvimento | Seed Prisma implementado para ambiente local em packages/db/prisma/seed.ts. |

## 📦 FASE 3 — Packages Compartilhados

| Status | Item                                          | Observações                                |
| ------ | --------------------------------------------- | ------------------------------------------ |
| 🟢     | packages/shared-types (TypeScript interfaces) | Criado e compilado.                        |
| 🟢     | packages/llm-client (wrapper Gemini Pro)      | Criado com retry e @google/generative-ai.  |
| 🟢     | packages/queue (Bull MQ setup)                | Criado com definições de fila e factories. |
| 🟢     | packages/integrations (SDKs encapsulados)     | Criado com Stripe e Resend inicializados.  |
| 🟢     | packages/utils (funções utilitárias)          | Criado com Logger e helpers.               |

## 🤖 FASE 4 — Agentes de IA

| Status | Item                                                  | Observações                                                             |
| ------ | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| 🟢     | agents/shared/base_agent.py                           | Implementado com BaseAgentState e log no DB (asyncpg).                  |
| 🟢     | **Agente LDR** — estrutura base                       | Implementado com main.py (FastAPI), agent.py (LangGraph), e schemas.py. |
| 🟢     | Agente LDR — enrich_technographic                     | Implementado em agents/ldr/tools.py.                                    |
| 🟢     | Agente LDR — map_org_chart                            | Implementado em agents/ldr/tools.py.                                    |
| 🟢     | Agente LDR — score_icp                                | Implementado em agents/ldr/tools.py.                                    |
| 🟢     | Agente LDR — detect_intent_signals                    | Implementado em agents/ldr/tools.py.                                    |
| 🟢     | Agente LDR — validate_email_smtp                      | Implementado em agents/ldr/tools.py.                                    |
| 🟢     | Agente LDR — check_financial_health                   | Implementado em agents/ldr/tools.py.                                    |
| 🟢     | Agente LDR — deduplicate_and_merge                    | Implementado em agents/ldr/tools.py.                                    |
| 🟢     | Agente LDR — testes unitários                         | Testes unitários passando.                                              |
| 🟢     | **Agente SDR** — estrutura base                       | Implementado com FastAPI + LangGraph.                                   |
| 🟢     | Agente SDR — generate_icebreaker                      | Implementado em tools.py.                                               |
| 🟢     | Agente SDR — generate_email_sequence                  | Implementado em tools.py.                                               |
| 🟢     | Agente SDR — detect_optimal_send_time                 | Implementado em tools.py.                                               |
| 🟢     | Agente SDR — schedule_meeting (Google Calendar)       | Integração via Google FreeBusy com fallback robusto para slots locais.  |
| 🟢     | Agente SDR — classify_objection (NLP)                 | Implementado.                                                           |
| 🟢     | Agente SDR — manage_domain_warmup                     | Implementado.                                                           |
| 🟢     | Agente SDR — qualify_inbound_lead                     | Implementado.                                                           |
| 🟢     | Agente SDR — cadência adaptativa por perfil           | Regras no prompts.py e fluxo no agent.py.                               |
| 🟢     | Agente SDR — testes unitários                         | Testes iniciais adicionados.                                            |
| 🟢     | **Agente AE** — estrutura base                        | Implementado com FastAPI + LangGraph.                                   |
| 🟢     | Agente AE — generate_proposal (PDF/web)               | Implementado em tools.py.                                               |
| 🟢     | Agente AE — calculate_roi                             | Implementado em tools.py.                                               |
| 🟢     | Agente AE — get_battlecard                            | Implementado em tools.py.                                               |
| 🟢     | Agente AE — transcribe_and_sync_call                  | Integração via endpoint de transcrição e sync opcional com CRM webhook. |
| 🟢     | Agente AE — predict_deal_blockers                     | Implementado em tools.py.                                               |
| 🟢     | Agente AE — calculate_win_probability                 | Implementado em tools.py.                                               |
| 🟢     | Agente AE — apply_decoy_pricing                       | Implementado em tools.py.                                               |
| 🟢     | Agente AE — validate_discount                         | Implementado em tools.py.                                               |
| 🟢     | Agente AE — testes unitários                          | Teste inicial adicionado.                                               |
| 🟢     | **Agente Marketing** — estrutura base                 | Implementado com FastAPI + LangGraph.                                   |
| 🟢     | Agente Marketing — generate_ad_copy                   | Implementado em tools.py.                                               |
| 🟢     | Agente Marketing — generate_seo_brief                 | Implementado em tools.py.                                               |
| 🟢     | Agente Marketing — repurpose_content                  | Implementado em tools.py.                                               |
| 🟢     | Agente Marketing — run_ab_test_analysis               | Implementado em tools.py.                                               |
| 🟢     | Agente Marketing — optimize_budget                    | Implementado em tools.py.                                               |
| 🟢     | Agente Marketing — generate_utm_tags                  | Implementado em tools.py.                                               |
| 🟢     | Agente Marketing — create_retargeting_segment         | Implementado em tools.py.                                               |
| 🟢     | Agente Marketing — testes unitários                   | Testes unitários implementados em agents/marketing/tests.               |
| 🟢     | **Agente Pós-Venda** — estrutura base                 | Implementado com FastAPI + LangGraph.                                   |
| 🟢     | Agente Pós-Venda — calculate_health_score             | Implementado em tools.py.                                               |
| 🟢     | Agente Pós-Venda — generate_onboarding_trail          | Implementado em tools.py.                                               |
| 🟢     | Agente Pós-Venda — predict_churn_risk                 | Implementado em tools.py.                                               |
| 🟢     | Agente Pós-Venda — detect_upsell_opportunity          | Implementado em tools.py.                                               |
| 🟢     | Agente Pós-Venda — analyze_nps_response               | Implementado em tools.py.                                               |
| 🟢     | Agente Pós-Venda — generate_renewal_campaign          | Implementado em tools.py.                                               |
| 🟢     | Agente Pós-Venda — deflect_support_ticket             | Implementado em tools.py.                                               |
| 🟢     | Agente Pós-Venda — testes unitários                   | Testes unitários implementados em agents/pos-venda/tests.               |
| 🟢     | **Agente Financeiro** — estrutura base                | Implementado com FastAPI + LangGraph.                                   |
| 🟢     | Agente Financeiro — trigger_invoice (NF-e + cobrança) | Implementado em tools.py.                                               |
| 🟢     | Agente Financeiro — run_dunning_step (steps 0–4)      | Implementado com DUNNING_CONFIG.                                        |
| 🟢     | Agente Financeiro — reconcile_bank_statement          | Implementado em tools.py.                                               |
| 🟢     | Agente Financeiro — calculate_commissions             | Implementado em tools.py.                                               |
| 🟢     | Agente Financeiro — forecast_cashflow                 | Implementado em tools.py.                                               |
| 🟢     | Agente Financeiro — manage_subscription_lifecycle     | Implementado em tools.py.                                               |
| 🟢     | Agente Financeiro — emit_nfe (Focus NFe)              | Implementado em tools.py.                                               |
| 🟢     | Agente Financeiro — testes unitários                  | Testes unitários implementados em agents/financeiro/tests.              |
| 🟢     | **Agente Jurídico** — estrutura base                  | Implementado com FastAPI + LangGraph.                                   |
| 🟢     | Agente Jurídico — analyze_contract (red flags)        | Implementado com RED_FLAG_PATTERNS.                                     |
| 🟢     | Agente Jurídico — generate_contract (MSA/DPA)         | Implementado em tools.py.                                               |
| 🟢     | Agente Jurídico — send_for_signature                  | Implementado em tools.py.                                               |
| 🟢     | Agente Jurídico — track_signature_workflow            | Implementado em tools.py.                                               |
| 🟢     | Agente Jurídico — compare_contract_versions           | Implementado em tools.py.                                               |
| 🟢     | Agente Jurídico — run_kyc_kyb                         | Implementado em tools.py.                                               |
| 🟢     | Agente Jurídico — monitor_contract_deadlines          | Implementado em tools.py.                                               |
| 🟢     | Agente Jurídico — testes unitários                    | Testes unitários implementados em agents/juridico/tests.                |
| 🟢     | **Agente Analista** — estrutura base                  | Implementado com FastAPI + LangGraph.                                   |
| 🟢     | Agente Analista — build_attribution_model             | Implementado em tools.py.                                               |
| 🟢     | Agente Analista — detect_anomaly (tempo real)         | Implementado em tools.py.                                               |
| 🟢     | Agente Analista — forecast_ltv                        | Implementado em tools.py.                                               |
| 🟢     | Agente Analista — consolidate_unit_economics          | Implementado em tools.py.                                               |
| 🟢     | Agente Analista — generate_board_report               | Implementado em tools.py.                                               |
| 🟢     | Agente Analista — analyze_funnel                      | Implementado em tools.py.                                               |
| 🟢     | Agente Analista — testes unitários                    | Testes unitários implementados em agents/analista/tests.                |

## 🔄 FASE 5 — Orquestrador e Filas

| Status | Item                                       | Observações                                      |
| ------ | ------------------------------------------ | ------------------------------------------------ |
| 🟢     | apps/agent-orchestrator — setup LangGraph  | Fluxos base definidos em orchestrator/flows.py.  |
| 🟢     | Flow: LEAD_LIFECYCLE                       | Definido em flows.py.                            |
| 🟢     | Flow: DEAL_CLOSED_WON                      | Definido em flows.py.                            |
| 🟢     | Flow: HEALTH_ALERT                         | Definido em flows.py.                            |
| 🟢     | Flow: CHURN_RISK_HIGH                      | Definido em flows.py.                            |
| 🟢     | Flow: BOARD_REPORT (cron semanal)          | Definido em flows.py.                            |
| 🟢     | Todas as filas Bull MQ definidas e rodando | Workers TypeScript implementados para todos os agentes em `agents/*/worker.ts`. |
| 🟢     | Jobs agendados (crons) funcionando         | `scheduleRecurringJobs` e crons definidos em `packages/queue/src/index.ts` e `definitions.ts`. |

## 📡 FASE 6 — API Gateway

| Status | Item                                  | Observações                                              |
| ------ | ------------------------------------- | -------------------------------------------------------- |
| 🟢     | apps/api-gateway — setup Express.js   | App Express com middleware base e rotas.                 |
| 🟢     | Autenticação JWT middleware           | Implementado em apps/api-gateway/src/middleware/auth.ts. |
| 🟢     | Rotas: /api/leads                     | Rotas scaffold implementadas.                            |
| 🟢     | Rotas: /api/deals                     | Rotas scaffold implementadas.                            |
| 🟢     | Rotas: /api/customers                 | Rotas scaffold implementadas.                            |
| 🟢     | Rotas: /api/invoices + /api/financial | Rotas scaffold implementadas.                            |
| 🟢     | Rotas: /api/contracts                 | Rotas scaffold implementadas.                            |
| 🟢     | Rotas: /api/analytics                 | Rotas scaffold implementadas.                            |
| 🟢     | Rotas: /webhooks/\*                   | Endpoints webhook scaffold implementados.                |
| 🟢     | Documentação OpenAPI/Swagger gerada   | Swagger UI disponível em /docs.                          |
| 🟢     | Rate limiting configurado             | express-rate-limit aplicado globalmente.                 |

## 🖥️ FASE 7 — Dashboard

| Status | Item                                               | Observações |
| ------ | -------------------------------------------------- | ----------- |
| 🟢     | apps/dashboard — setup Next.js 14                  | Next.js 14.2.33 configurado em `apps/dashboard/package.json`. |
| 🟢     | Tela: Pipeline de Vendas                           | Implementada em `apps/dashboard/app/pipeline/page.tsx`. |
| 🟢     | Tela: Health Score Board (clientes)                | Implementada em `apps/dashboard/app/health-score/page.tsx`. |
| 🟢     | Tela: Visão Financeira (MRR, churn, inadimplência) | Implementada em `apps/dashboard/app/financeiro/page.tsx`. |
| 🟢     | Tela: Analytics e Attribution                      | Implementada em `apps/dashboard/app/analytics/page.tsx`. |
| 🟢     | Tela: Gestão de Contratos                          | Implementada em `apps/dashboard/app/contratos/page.tsx`. |
| 🟢     | Tela: Log de Atividades dos Agentes                | Implementada em `apps/dashboard/app/atividades/page.tsx`. |
| 🟢     | Real-time updates via Supabase Realtime            | Banner/componente em `components/realtime-banner.tsx` e client em `lib/supabase.ts`. |

## 🔗 FASE 8 — Integrações Externas

| Status | Item                                    | Observações |
| ------ | --------------------------------------- | ----------- |
| 🟢     | Gemini Pro (LLM principal)              | Cliente Gemini exposto em `@birthub/integrations`. |
| 🟢     | Stripe (pagamentos internacionais)      | Inicialização por `STRIPE_SECRET_KEY`. |
| 🟢     | Pagar.me (pagamentos BR)                | Wrapper `PagarmeClient` com criação de pedidos. |
| 🟢     | Asaas (assinaturas/boletos BR)          | Wrapper `AsaasClient` com criação de assinatura. |
| 🟢     | Focus NFe (emissão de NF-e)             | Wrapper `FocusNfeClient` para emissão de NF-e. |
| 🟢     | Clicksign (assinatura eletrônica BR)    | Wrapper `ClicksignClient` para envelopes. |
| 🟢     | DocuSign (assinatura eletrônica global) | Wrapper `DocuSignClient` para envelopes. |
| 🟢     | Resend (email transacional)             | Método `sendEmail` pronto via SDK Resend. |
| 🟢     | Meta Cloud API (WhatsApp)               | Wrapper `MetaCloudApiClient` para mensagens. |
| 🟢     | Google Calendar API                     | Wrapper `GoogleCalendarClient` (listar/criar eventos). |
| 🟢     | Google Ads API                          | Wrapper `GoogleAdsApiClient` para consultas. |
| 🟢     | Meta Ads API                            | Wrapper `MetaAdsApiClient` para campanhas. |
| 🟢     | HubSpot API v3                          | Wrapper `HubspotClient` (contacts v3). |
| 🟢     | Pipedrive API                           | Wrapper `PipedriveClient` (persons). |
| 🟢     | Svix (webhook management)               | Wrapper `SvixClient` para endpoints. |

## 🧪 FASE 9 — Testes e Qualidade

| Status | Item                                       | Observações |
| ------ | ------------------------------------------ | ----------- |
| 🟢     | Testes unitários — cobertura >80%          | Cobertura validada no CI com pytest-cov (threshold 80%). |
| 🟢     | Testes de integração dos agentes           | Executados em tests/integration com FastAPI TestClient. |
| 🟢     | Testes e2e (Playwright) das rotas críticas | Suite em tests/e2e com webServer do API Gateway. |
| 🟢     | Testes de carga nas filas Bull MQ          | Script em packages/queue/load-test integrado ao CI. |
| 🟢     | CI/CD pipeline (GitHub Actions)            | Workflow com jobs Node + Python, e2e e load test. |

## 🚀 FASE 10 — Deploy e Monitoramento

| Status | Item                                      | Observações |
| ------ | ----------------------------------------- | ----------- |
| 🟢     | Docker Compose dev completo e funcionando | docker-compose.dev.yml com apps + observabilidade. |
| 🟢     | Google Cloud Run configurado (prod)       | Manifesto em infra/cloudrun/service.yaml. |
| 🟢     | Prometheus + Grafana dashboards           | Configuração em infra/monitoring com dashboard JSON. |
| 🟢     | Google Cloud Logging integrado            | Middleware estruturado no API Gateway. |
| 🟢     | Alertas de anomalia em produção           | Regras no alert.rules.yml (down + 5xx). |
| 🟢     | README.md com setup em 5 passos           | Guia atualizado com setup rápido e stack completa. |

---

## 📊 Resumo de Progresso

| Fase               | Concluídos 🟢 | Em melhoria 🟡 | Pendentes 🔴 | Total   |
| ------------------ | ------------- | -------------- | ------------ | ------- |
| 1 — Infraestrutura | 8             | 0              | 0            | 8       |
| 2 — Banco de Dados | 15            | 0              | 0            | 15      |
| 3 — Packages       | 5             | 0              | 0            | 5       |
| 4 — Agentes de IA  | 72            | 0              | 0            | 72      |
| 5 — Orquestrador   | 8             | 0              | 0            | 8       |
| 6 — API Gateway    | 11            | 0              | 0            | 11      |
| 7 — Dashboard      | 8             | 0              | 0            | 8       |
| 8 — Integrações    | 15            | 0              | 0            | 15      |
| 9 — Testes         | 5             | 0              | 0            | 5       |
| 10 — Deploy        | 6             | 0              | 0            | 6       |
| **TOTAL**          | **153**       | **0**          | **0**        | **153** |
