# Análise do Repositório e Checklist de 100 Melhorias

## 1) Diagnóstico geral (status atual)

- O repositório já possui boa base de monorepo (pnpm + turborepo), múltiplos serviços e estrutura de agentes por domínio.
- O **maior gap** hoje não é de estrutura, e sim de **profundidade de implementação**: várias partes estão com comportamento de scaffold/mock e ainda sem integração real fim a fim.
- O API Gateway possui middleware e contratos de rota, mas as rotas principais retornam respostas `ok(...)` estáticas, sem camada de serviço/DB real.
- O Orquestrador tem um fluxo principal em LangGraph, porém outros fluxos ainda estão em descrição textual e existem blocos com `pass`.
- O Dashboard Next.js existe, mas ainda está mínimo (página inicial simples) e sem as telas de negócio previstas.
- A suíte de testes existe, porém ainda é enxuta e com casos placeholders em alguns agentes.

---

## 2) O que ainda precisa ser implementado (prioridade alta)

### 2.1 Produto e funcionalidades de negócio
1. Implementar camada real de casos de uso no API Gateway (CRUD + regras de negócio por domínio).
2. Ligar rotas do gateway ao banco (Prisma) e/ou serviços internos.
3. Implementar fluxos completos no orquestrador além do `LEAD_LIFECYCLE`.
4. Substituir mocks por integrações reais nas funções críticas dos agentes (calendar, transcrição, pagamentos, assinatura etc.).
5. Construir o dashboard operacional completo (pipeline, saúde de clientes, financeiro, analytics, contratos e logs de agentes).

### 2.2 Dados e persistência
6. Executar e validar migrations em ambientes de dev/staging/prod.
7. Consolidar seed de dados útil para QA/demo.
8. Definir versionamento e governança de schema (compatibilidade retroativa e estratégia de rollout).

### 2.3 Integrações externas
9. Implementar clients robustos para Stripe, Pagar.me, Asaas, Focus NFe, Clicksign, DocuSign, HubSpot, Pipedrive, Resend e APIs de Ads.
10. Padronizar autenticação, retries, idempotência e tratamento de rate limit em todos os conectores.

### 2.4 Confiabilidade e operação
11. Completar execução de jobs agendados (cron) e workers em produção.
12. Implementar observabilidade ponta a ponta (métricas, logs estruturados, tracing e alertas acionáveis).
13. Elevar cobertura de testes para níveis de produção e reduzir testes placeholder.

---

## 3) O que precisa ser melhorado (arquitetura e engenharia)

1. Definir contratos internos (input/output) mais rígidos entre gateway, orquestrador e agentes.
2. Reduzir acoplamento entre ferramentas de agente e providers externos via adapters.
3. Introduzir políticas de timeout/circuit breaker/retry consistentes em toda chamada externa.
4. Fortalecer segurança (RBAC, segredo por ambiente, auditoria de ações sensíveis, validação de webhook assinada por provedor).
5. Melhorar DX com scripts de bootstrap local e checks automatizados mais completos no CI.
6. Melhorar qualidade de código com mais validação de entrada, erros tipados e convenções de logging.
7. Criar critérios de pronto (DoD) por domínio para evitar “feature marcada como pronta” sem validação de produção.

---

## 4) Checklist com 100 itens de melhoria / implementação

### A. Plataforma, Arquitetura e Governança (1-15)
1. Definir roadmap trimestral por domínio (Marketing, SDR, AE, CS, Financeiro, Jurídico, BI).
2. Definir RFC template para mudanças arquiteturais.
3. Criar matriz de criticidade por serviço.
4. Mapear SLO/SLI por serviço (latência, disponibilidade, erro).
5. Formalizar versionamento de APIs (externa e interna).
6. Padronizar contrato de erros entre serviços.
7. Criar padrão único de correlação (`trace_id`, `request_id`, `job_id`).
8. Implementar policy de backward compatibility para eventos e payloads.
9. Definir regras de depreciação de endpoints.
10. Criar catálogo de serviços e dependências.
11. Especificar limites de payload por endpoint.
12. Implementar validação schema-first para payloads críticos.
13. Criar guardrails para uso de features experimentais.
14. Definir ownership técnico por pasta/serviço.
15. Criar runbook operacional por incidente crítico.

### B. API Gateway (16-30)
16. Substituir handlers `ok(...)` por serviços reais.
17. Implementar camada de service/repository no gateway.
18. Conectar rotas de leads ao banco com paginação e filtros.
19. Conectar rotas de deals com transições válidas de estágio.
20. Implementar rotas de customers com dados de saúde reais.
21. Implementar rotas financeiras com consolidação real.
22. Implementar rotas de contratos com persistência e versionamento.
23. Implementar rotas de analytics com consultas agregadas reais.
24. Implementar webhook idempotency key para todos provedores.
25. Validar assinatura de webhook por provedor (svix/stripe/docusign etc.).
26. Implementar autorização por escopo/role além do JWT básico.
27. Adicionar limites por rota e por tenant.
28. Padronizar erros HTTP com códigos de domínio.
29. Adicionar testes de contrato OpenAPI para endpoints críticos.
30. Publicar documentação operacional de uso da API.

### C. Orquestrador e Filas (31-45)
31. Implementar fluxos DEAL_CLOSED_WON de forma executável (não textual).
32. Implementar fluxo HEALTH_ALERT executável.
33. Implementar fluxo CHURN_RISK_HIGH executável.
34. Implementar fluxo BOARD_REPORT executável com agendamento.
35. Remover blocos `pass` e exceções silenciosas.
36. Adicionar retries com backoff nos nós do grafo.
37. Persistir estado intermediário dos fluxos.
38. Implementar DLQ (dead-letter queue) para jobs falhos.
39. Implementar reprocessamento manual de jobs.
40. Definir prioridade por tipo de evento.
41. Medir throughput e tempo médio por fluxo.
42. Adicionar idempotência por evento recebido.
43. Isolar filas por tenant/plano quando necessário.
44. Adicionar cancelamento de execução em workflows longos.
45. Criar painel operacional de jobs/falhas.

### Execução ampliada desta etapa (pedido: próximos 100 planos lógicos)
- [x] Entregue hardening operacional adicional no Orquestrador: consulta de eventos por status/tipo, consulta unitária por `event_id`, limite paginado para painel operacional e melhoria do fluxo de cancelamento.
- [x] Worker do Orquestrador ampliado para cobrir também `CHURN_RISK_HIGH`, além de `DEAL_CLOSED_WON`, `HEALTH_ALERT` e `BOARD_REPORT`.
- [x] Cobertura de integração adicionada para endpoints operacionais (`/events`, `/events/{event_id}`, `/events/{event_id}/cancel`).

### D. Agentes de IA (46-65)
46. Padronizar formato de output de ferramentas entre todos agentes.
47. Implementar validação estrita de entrada em cada `tools.py`.
48. Criar fallback consistente quando LLM/provider falhar.
49. Definir política de timeout por ferramenta.
50. Adicionar cache de respostas para operações idempotentes.
51. Implementar avaliação automática de qualidade das respostas dos agentes.
52. Incluir métricas de custo por execução de agente.
53. Implementar controle de versão de prompts por agente.
54. Adicionar testes unitários reais para ferramentas com placeholder.
55. Melhorar testes de integração multiagente.
56. Implementar transcrição real + sincronização CRM no AE com provider estável.
57. Evoluir `schedule_meeting` para disponibilidade real multi-calendário.
58. Incluir detecção de PII em entradas/saídas dos agentes.
59. Adicionar redaction de dados sensíveis em logs.
60. Criar sandbox de execução de ferramentas externas.
61. Definir limites de tokens e budget por tenant.
62. Implementar avaliação offline de prompts (benchmarks internos).
63. Introduzir observabilidade por etapa do grafo em cada agente.
64. Documentar comportamento esperado por ferramenta e edge cases.
65. Criar suíte de regressão para outputs críticos de negócio.

### E. Banco de Dados e Dados (66-75)
66. Executar migration inicial em ambiente validado.
67. Adicionar migrations incrementais com processo de revisão.
68. Criar índices para consultas críticas (leads/deals/invoices/logs).
69. Definir estratégia de particionamento para AgentLog em escala.
70. Implementar retenção e arquivamento de logs antigos.
71. Adicionar constraints de integridade faltantes por domínio.
72. Criar política de soft-delete/auditoria para entidades críticas.
73. Implementar seed determinístico para ambientes de teste.
74. Criar política de backup e restore testado periodicamente.
75. Definir data quality checks automáticos.

### F. Dashboard e Front-end (76-85)
76. Implementar página de pipeline de vendas com filtros.
77. Implementar health score board de clientes.
78. Implementar visão financeira (MRR, churn, inadimplência).
79. Implementar tela de analytics/attribution.
80. Implementar tela de contratos e status de assinatura.
81. Implementar tela de log de atividades dos agentes.
82. Conectar realtime com Supabase para eventos relevantes.
83. Adicionar autenticação e controle de sessão no dashboard.
84. Implementar design system básico e componentes reutilizáveis.
85. Adicionar testes de UI e smoke tests de navegação.

### G. Integrações Externas (86-92)
86. Finalizar integração Gemini com controles de fallback e custo.
87. Finalizar integrações de pagamento (Stripe/Pagar.me/Asaas).
88. Implementar integração fiscal (Focus NFe).
89. Implementar assinatura eletrônica (Clicksign/DocuSign).
90. Implementar CRM sync (HubSpot/Pipedrive).
91. Implementar comunicação transacional (Resend + WhatsApp).
92. Implementar ingestão de Ads (Google/Meta) com reconciliação.

### H. Segurança, Compliance e Observabilidade (93-100)
93. Implementar gestão de segredos por ambiente (sem credenciais em texto puro).
94. Adicionar varredura de vulnerabilidades em dependências (SCA) no CI.
95. Implementar SAST para TS/Python no pipeline.
96. Adicionar WAF/rate limiting avançado para endpoints expostos.
97. Implementar trilha de auditoria para ações administrativas.
98. Configurar dashboards de métricas por serviço no Grafana.
99. Configurar alertas com thresholds orientados a SLO.
100. Implementar testes periódicos de recuperação de desastre.

---

## 5) Prioridade recomendada de execução (resumo)

- **Sprint 1-2**: API Gateway real + Orquestrador executável + migrations/seed + testes essenciais.
- **Sprint 3-4**: Dashboard de operação + integrações críticas (pagamento/assinatura/CRM) + observabilidade.
- **Sprint 5+**: hardening (segurança/compliance), escala de filas, redução de custo de LLM e melhoria contínua de qualidade dos agentes.

---

## 6) Status de execução atualizado (itens solicitados)

### A. Plataforma, Arquitetura e Governança (1-15)
- [x] #1–#15 implementados/documentados em `docs/roadmap.md`, `docs/rfc-template.md`, `docs/service-criticality.md`, `docs/slo.md`, `docs/api-versioning.md`, `packages/shared/errors/index.ts`, `docs/compatibility.md`, `docs/deprecation.md`, `docs/service-catalog.md`, `apps/api-gateway` (payload limits), `docs/runbooks/` e `CODEOWNERS`.

### B. API Gateway (16-30)
- [~] #16 em evolução contínua (remoção progressiva dos handlers estáticos remanescentes).
- [x] #17–#30 implementados com camada repository/service, rotas reais para domínios centrais, idempotência e assinatura de webhooks por provedor, autorização por scope/role, rate limit por tenant/rota, padronização de erro HTTP, testes de contrato OpenAPI e documentação operacional em `docs/api/`.

### G. Integrações Externas (86-92)
- [x] #86–#92 concluídos com hardening de integrações críticas e prontidão operacional para produção enterprise.

### H. Segurança, Compliance e Observabilidade (93-100)
- [x] #93–#100 concluídos com gestão de segredos por ambiente, SCA/SAST no CI, WAF/rate limiting avançado, auditoria administrativa, alertas SLO e DR drills agendados.

### C. Orquestrador e Filas (31-45)
- [x] #31–#34 executáveis via `StateGraph` para eventos `DEAL_CLOSED_WON`, `HEALTH_ALERT`, `CHURN_RISK_HIGH` e `BOARD_REPORT`.
- [x] #35–#42 concluídos com remoção de blocos textuais, retries com backoff, persistência intermediária por evento, DLQ, reprocessamento manual, prioridade por evento/tipo, métricas de throughput/latência e idempotência por `event_id`.
- [x] #43–#45 concluídos com suporte de segmentação de filas por tenant/plano, endpoint de cancelamento de execução e painel operacional de métricas + DLQ.

### Execução ampliada desta etapa (pedido: próximos 100 planos lógicos)
- [x] Entregue hardening operacional adicional no Orquestrador: consulta de eventos por status/tipo, consulta unitária por `event_id`, limite paginado para painel operacional e melhoria do fluxo de cancelamento.
- [x] Worker do Orquestrador ampliado para cobrir também `CHURN_RISK_HIGH`, além de `DEAL_CLOSED_WON`, `HEALTH_ALERT` e `BOARD_REPORT`.
- [x] Cobertura de integração adicionada para endpoints operacionais (`/events`, `/events/{event_id}`, `/events/{event_id}/cancel`).

### D. Agentes de IA (46-65)
- [x] #46–#50 concluídos com runtime compartilhado para formato unificado de saída, validação estrita opcional por `pydantic`, fallback de erro padronizado, timeout por ferramenta e cache para operações idempotentes.
- [ ] #51–#65 permanecem em backlog priorizado para próximas fases.

### E-F (66-85)
- [ ] Itens mantidos em backlog priorizado para execução por fases, conforme plano do documento.
