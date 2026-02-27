# Checklist CODEX Execution Engine (I/M)

Fonte: `CODEX_Execution_Engine.html` (master checklist operacional).

Legenda: `[ ]` pendente · `[~]` em andamento · `[x]` concluído.

Atualizado em: 2026-02-25

## BACKEND
- [ ] **I01** (P0) — Criar camada service/repository no gateway para leads
  - Evidência esperada: PR com testes unitários e integração
  - Métrica: CRUD real em produção
- [ ] **I02** (P0) — Implementar rotas de deals com transições válidas (state machine)
  - Evidência esperada: state machine + testes
  - Métrica: zero transição inválida
- [ ] **I03** (P1) — Implementar customers health com cálculo real e jobs de atualização
  - Evidência esperada: endpoint + jobs atualização
  - Métrica: health score confiável
- [ ] **I04** (P0) — Implementar billing summary via agregações SQL otimizadas
  - Evidência esperada: query otimizada + teste
  - Métrica: p95 endpoint < 300ms
- [ ] **I05** (P0) — Implementar contratos com versionamento e trilha de auditoria
  - Evidência esperada: tabelas + API + auditoria
  - Métrica: rastreabilidade jurídica completa
- [ ] **I06** (P1) — Implementar API de analytics com filtros por tenant e índices
  - Evidência esperada: endpoints + índice
  - Métrica: consultas previsíveis em escala
- [ ] **I07** (P0) — Adicionar validação Zod/Pydantic em todos os payloads críticos
  - Evidência esperada: schemas + testes negativos
  - Métrica: rejeição consistente de payload inválido
- [ ] **I08** (P0) — Centralizar middleware de idempotência e rate limit reutilizável
  - Evidência esperada: middleware reutilizável
  - Métrica: proteção uniforme em APIs
- [ ] **I09** (P1) — Publicar OpenAPI assinado, versionado e consumível por clientes
  - Evidência esperada: pipeline geração docs
  - Métrica: contrato consumível por clientes
- [ ] **I10** (P0) — Implementar webhook receiver robusto com assinatura, retries e DLQ
  - Evidência esperada: assinatura + retries + DLQ
  - Métrica: perda de evento = 0
## ORQUESTRAÇÃO
- [ ] **I11** (P0) — Completar fluxo DEAL_CLOSED_WON executável ponta a ponta
  - Evidência esperada: grafo + persistência de estado
  - Métrica: fluxo automatizado ponta a ponta
- [ ] **I12** (P0) — Completar fluxo HEALTH_ALERT com ações CS e workers ativos
  - Evidência esperada: workers + regras
  - Métrica: resposta proativa a risco
- [ ] **I13** (P0) — Completar fluxo CHURN_RISK_HIGH com playbook CRM integrado
  - Evidência esperada: grafo + integração CRM
  - Métrica: churn evitável reduzido
- [ ] **I14** (P1) — Completar fluxo BOARD_REPORT agendado com geração automática
  - Evidência esperada: cron + geração relatório
  - Métrica: reporte executivo automático
- [ ] **I15** (P0) — Persistir estado intermediário do orquestrador para reprocessamento
  - Evidência esperada: tabela state + APIs consulta
  - Métrica: reprocessamento determinístico
- [~] **I16** (P0) — Implementar DLQ e endpoint de reprocessamento manual de eventos
  - Evidência esperada: filas + endpoint retry
  - Métrica: incidentes recuperáveis sem engenharia
  - Status atual: APIs admin para listar falhas e retry granular por job (`/failed`, `/:jobId/retry`) implementadas.
- [~] **I17** (P1) — Priorização de fila por evento/plano para SLA premium
  - Evidência esperada: políticas de prioridade
  - Métrica: SLA premium sustentado
  - Status atual: Métricas e operações administrativas por fila habilitadas para gestão operacional de priorização.
- [~] **I18** (P1) — Isolamento de fila por tenant enterprise com namespaces e quotas
  - Evidência esperada: namespaces + quotas
  - Métrica: ruído entre tenants eliminado
  - Status atual: Endpoint de resolução de fila escopada por tenant/plano implementado (`/admin/queues/:queue/scope`).
- [x] **I19** (P2) — Implementar endpoint de cancelamento de execução de jobs
  - Evidência esperada: API cancel + teste
  - Métrica: jobs órfãos reduzidos
  - Status atual: Implementado no API Gateway com endpoint admin de cancelamento idempotente + testes unitários dedicados.
- [~] **I20** (P0) — Implementar métricas de throughput/latência por fluxo em tempo real
  - Evidência esperada: exportadores + dashboards
  - Métrica: gargalos visíveis em tempo real
  - Status atual: Endpoint de métricas por fila implementado (`/admin/jobs/:queue/metrics`) com throughput e failedRate.
## INTEGRAÇÕES
- [ ] **I21** (P0) — Integrar Stripe com eventos de cobrança completos e reconciliação
  - Evidência esperada: client + webhooks + reconciliação
  - Métrica: faturamento automatizado confiável
- [ ] **I22** (P1) — Integrar Pagar.me/Asaas com fallback de adquirência automático
  - Evidência esperada: adapters + failover
  - Métrica: continuidade de cobrança
- [ ] **I23** (P0) — Integrar Focus NFe para emissão e consulta de status fiscal
  - Evidência esperada: emissão + consulta status
  - Métrica: compliance fiscal operacional
- [ ] **I24** (P0) — Integrar Clicksign/DocuSign para contratos com callbacks
  - Evidência esperada: assinatura + callbacks
  - Métrica: ciclo contratual digitalizado
- [ ] **I25** (P1) — Integrar HubSpot/Pipedrive com sync incremental e reconciliação
  - Evidência esperada: jobs sync + reconciliação
  - Métrica: CRM sem divergência crítica
- [ ] **I26** (P1) — Integrar Resend/WhatsApp para comunicações transacionais com tracking
  - Evidência esperada: templates + tracking
  - Métrica: entregabilidade monitorada
- [ ] **I27** (P2) — Integrar Google/Meta Ads para attribution e CAC por canal
  - Evidência esperada: ingestão + modelo atribuição
  - Métrica: CAC por canal confiável
- [ ] **I28** (P1) — Implementar conector Calendar para agendamento SDR sem conflitos
  - Evidência esperada: booking + conflitos
  - Métrica: aumento de reuniões válidas
- [ ] **I29** (P2) — Implementar conector Drive/Storage para anexos com ACL auditável
  - Evidência esperada: upload seguro + ACL
  - Métrica: gestão documental auditável
## IA/LLM
- [ ] **I30** (P1) — Implementar fallback de LLM (Gemini + modelo secundário)
  - Evidência esperada: roteador + health check
  - Métrica: disponibilidade IA elevada
- [ ] **I31** (P1) — Implementar orçamento de tokens por tenant com alertas
  - Evidência esperada: quotas + alertas
  - Métrica: custo de IA previsível
- [ ] **I32** (P1) — Implementar avaliação offline de prompts com scorecards
  - Evidência esperada: benchmark + scorecards
  - Métrica: melhora contínua de qualidade
- [ ] **I33** (P0) — Implementar sandbox de tools de agentes com isolamento e políticas
  - Evidência esperada: isolamento + políticas
  - Métrica: redução de risco operacional
- [ ] **I34** (P2) — Implementar cache semântico para tarefas repetidas (custo/latência)
  - Evidência esperada: cache + invalidação
  - Métrica: custo/latência de IA reduzidos
## FRONT-END
- [ ] **I35** (P1) — Implementar dashboards operacionais em tempo real (SRE + negócio)
  - Evidência esperada: painéis SRE + negócio
  - Métrica: decisão assistida por dados ao vivo
- [ ] **I36** (P1) — Implementar tela pipeline com drag/drop e SLAs comerciais
  - Evidência esperada: página + API + testes
  - Métrica: operação comercial centralizada
- [ ] **I37** (P1) — Implementar tela financeiro com MRR/churn/inadimplência
  - Evidência esperada: página + consultas
  - Métrica: visibilidade financeira diária
- [ ] **I38** (P1) — Implementar tela contratos com status de assinatura em tempo real
  - Evidência esperada: página + webhook status
  - Métrica: fechamento jurídico acelerado
- [ ] **I39** (P1) — Implementar tela logs de agentes com filtros avançados e busca
  - Evidência esperada: página + busca
  - Métrica: troubleshooting rápido
- [ ] **I40** (P1) — Implementar tela health score com alertas acionáveis e regras
  - Evidência esperada: página + regras
  - Métrica: churn preventivo operacional
## SEGURANÇA
- [ ] **I41** (P0) — Implementar autenticação robusta dashboard com MFA opcional
  - Evidência esperada: fluxos auth + sessão
  - Métrica: risco de takeover reduzido
- [ ] **I42** (P0) — Implementar controle de acesso granular por módulo (RBAC frontend/backend)
  - Evidência esperada: RBAC frontend/backend
  - Métrica: segregação de função real
## QA/CI
- [ ] **I43** (P0) — Implementar testes E2E dos fluxos críticos com Playwright
  - Evidência esperada: suíte Playwright
  - Métrica: regressão crítica bloqueada
- [ ] **I44** (P0) — Implementar testes de contrato OpenAPI no CI com gates
  - Evidência esperada: pipeline com gates
  - Métrica: quebra de API detectada cedo
- [ ] **I45** (P1) — Implementar testes de carga BullMQ e API Gateway (k6/artillery)
  - Evidência esperada: cenários k6/artillery
  - Métrica: baseline de escala validado
## SEGURANÇA
- [ ] **I46** (P0) — Implementar cobertura mínima de segurança no CI (SAST/SCA/secrets)
  - Evidência esperada: SAST/SCA/secret scanning
  - Métrica: vulnerabilidade crítica bloqueada
## INFRA
- [ ] **I47** (P0) — Implementar política de backup/restore automatizada com drill
  - Evidência esperada: jobs + restore drill
  - Métrica: resiliência comprovada
- [ ] **I48** (P0) — Implementar runbook de incidentes P0/P1 com game days
  - Evidência esperada: runbooks + game days
  - Métrica: resposta padronizada e rápida
## CI/CD
- [ ] **I49** (P1) — Implementar deploy canary para serviços críticos com health gates
  - Evidência esperada: pipeline + health gates
  - Métrica: risco de release reduzido
## INFRA
- [ ] **I50** (P1) — Implementar DR drill trimestral multi-serviço documentado
  - Evidência esperada: relatório drill
  - Métrica: continuidade de negócio garantida
## CONTRATOS
- [ ] **M03** (P0) — Contratos internos versionados: schema registry + changelog de eventos e APIs
  - Evidência esperada: schema registry + changelog
  - Métrica: 100% eventos versionados
## RESILIÊNCIA
- [ ] **M05** (P0) — Estratégia de resiliência: lib comum de timeout/retry/circuit breaker com testes caos
  - Evidência esperada: lib comum + testes caos
  - Métrica: falhas transitórias recuperadas > 95%
- [~] **M06** (P0) — Idempotência de ponta a ponta via middleware com request/event id universal
  - Evidência esperada: middleware + testes
  - Métrica: duplicidade operacional = 0
  - Status atual: Fluxos admin de retry/cancel/status suportam comportamento idempotente (`not_found`, `not_failed`, etc.).
## OBSERVABILIDADE
- [~] **M07** (P0) — Observabilidade full-stack: logs estruturados, métricas Prometheus, traces OTEL
  - Evidência esperada: dashboards + alertas
  - Métrica: cobertura de tracing > 90%
  - Status atual: Logs estruturados para ações administrativas de job (cancel/retry) com `trace_id` e estado do job.
- [ ] **M08** (P0) — SLO/SLI por domínio e serviço com error budget monitorado semanalmente
  - Evidência esperada: docs/slo + alert rules
  - Métrica: erro budget monitorado semanalmente
## SEGURANÇA
- [ ] **M10** (P0) — Governança de segredos com rotação automática (Vault/Secret Manager)
  - Evidência esperada: policy + jobs rotação
  - Métrica: 100% segredos com rotação
- [ ] **M11** (P0) — Hardening de autenticação, sessão e RBAC com testes de autorização
  - Evidência esperada: testes de autorização
  - Métrica: 0 endpoint sensível sem RBAC
## COMPLIANCE
- [ ] **M12** (P0) — Auditoria imutável para ações administrativas críticas (append-only)
  - Evidência esperada: tabela audit + trilha
  - Métrica: 100% ações administrativas auditadas
## DADOS
- [ ] **M15** (P0) — Gestão de schema evolutivo com padrão expand-contract e playbook de migração
  - Evidência esperada: playbook de migração
  - Métrica: zero downtime em migrações
- [ ] **M16** (P0) — Estratégia de índices e plano de capacidade SQL com explain plans
  - Evidência esperada: explain plans + índices
  - Métrica: p95 consultas críticas < 150ms
## SEGURANÇA
- [ ] **M19** (P0) — Segurança de supply chain: SCA + SAST + Secrets scanning nos CI gates
  - Evidência esperada: CI gates
  - Métrica: vulnerabilidade crítica em prod = 0
## QA
- [ ] **M20** (P0) — Testes de contrato consumer-driven entre todos os serviços
  - Evidência esperada: suíte consumer-driven
  - Métrica: regressão de contrato = 0
- [ ] **M21** (P1) — Qualidade de teste por risco (pirâmide balanceada, flakiness < 2%)
  - Evidência esperada: estratégia QA
  - Métrica: flakiness e2e < 2%
- [ ] **M22** (P1) — Testes de carga periódicos em filas BullMQ e APIs críticas
  - Evidência esperada: relatório perf
  - Métrica: throughput alvo sustentado
## RESILIÊNCIA
- [ ] **M23** (P2) — Chaos engineering para dependências externas (degradação graciosa)
  - Evidência esperada: cenários caos
  - Métrica: degradação graciosa validada
## DEPLOYMENT
- [ ] **M24** (P1) — Feature flags com rollout progressivo e rollback < 5 min
  - Evidência esperada: framework FF
  - Métrica: rollback < 5 min
## SEGURANÇA
- [ ] **M26** (P0) — Estratégia antifraude para pagamentos e webhooks com regras e monitoria
  - Evidência esperada: regras + monitoria
  - Métrica: chargeback/fraude sob controle
## BACKEND
- [~] **M27** (P0) — Padronização de erros de domínio e catálogo de erros com observabilidade
  - Evidência esperada: catálogo de erros
  - Métrica: TTR de incidentes reduzido
  - Status atual: Validação e erro de domínio `INVALID_QUEUE` aplicado de forma consistente nas rotas admin de filas.
## ARQUITETURA
- [~] **M28** (P0) — Arquitetura multi-tenant isolada por dados e filas (desenho de tenancy)
  - Evidência esperada: desenho tenancy
  - Métrica: ausência de vazamento cross-tenant
  - Status atual: Geração de nomes de fila isolados por tenant/plano disponível para operação multi-tenant.
## IA/SEGURANÇA
- [ ] **M30** (P0) — Guardrails de IA: PII, toxicidade, jailbreak — filtros + testes
  - Evidência esperada: filtros + testes
  - Métrica: incidentes de segurança de IA = 0
## IA/LLM
- [ ] **M31** (P1) — Observabilidade por token/custo/latência de LLM com dashboards
  - Evidência esperada: dashboards LLM
  - Métrica: otimização contínua de custo
- [ ] **M32** (P1) — Estratégia de fallback multi-modelo com roteador e health check
  - Evidência esperada: roteador de modelos
  - Métrica: disponibilidade IA > 99,5%
- [ ] **M33** (P1) — Golden datasets para validação de agentes com suíte de avaliação
  - Evidência esperada: suíte de avaliação
  - Métrica: precisão mínima definida por tarefa
## FRONT-END
- [ ] **M34** (P0) — Segurança de front-end: CSP, sanitização, headers (auditoria OWASP)
  - Evidência esperada: auditoria OWASP
  - Métrica: XSS/CSRF críticos = 0
- [ ] **M35** (P1) — Performance front-end com Core Web Vitals e relatórios Lighthouse
  - Evidência esperada: relatórios Lighthouse
  - Métrica: LCP < 2.5s em páginas-chave
## CI/CD
- [ ] **M38** (P0) — Pipeline CI/CD com gates por risco e políticas de qualidade obrigatórias
  - Evidência esperada: workflow com políticas
  - Métrica: lead time sem sacrificar qualidade
- [ ] **M39** (P1) — Release train com canary deployment e rollback automático por health
  - Evidência esperada: pipeline deployment
  - Métrica: MTTD/MTTR de release reduzidos
## OBSERVABILIDADE
- [~] **M42** (P0) — Política de logs estruturados com correlação única e rastreabilidade fim a fim
  - Evidência esperada: logger padrão
  - Métrica: rastreabilidade fim a fim
  - Status atual: Correlação operacional de filas reforçada via payloads estruturados com `trace_id` em eventos admin.
## PROCESSO
- [ ] **M44** (P1) — Modelo de ownership técnico por pasta/serviço com CODEOWNERS ativo
  - Evidência esperada: CODEOWNERS ativo
  - Métrica: redução de filas de revisão

## Observações de governança
- Este arquivo é o espelho versionado do checklist visual do HTML.
- Toda entrega por ID deve atualizar este arquivo no mesmo PR com evidência objetiva (endpoint, teste, dashboard, runbook etc.).
