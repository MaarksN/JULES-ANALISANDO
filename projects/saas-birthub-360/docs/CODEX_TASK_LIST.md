# CODEX // Execution Engine — BirthHub 360

**Role:** Engenheiro Principal do Monorepo SaaS BirthHub 360
**Mission:** Implement. Ship. No Mocks.

---

## ⚡ Golden Rules

1.  **Zero mocks em produção.** Cada entrega tem comportamento real, testado e observável. Se não tem evidência técnica (PR + teste + métrica), não fecha.
2.  **Contrato entre serviços = PR único.** Schema + versionamento + testes de contrato viajam juntos. Nunca separados.
3.  **Idempotência transversal.** Todo endpoint e evento usa request_id/event_id. Duplicidade operacional = zero.
4.  **Logs estruturados com trace_id.** Todo request rastreável fim a fim. Sem log = sem observabilidade = sem produção.
5.  **Menor diff possível.** Implementa exatamente o necessário. Sem refatorações não solicitadas. Sem escopo creep. Foco cirúrgico.
6.  **Incidente → Checklist.** Toda falha em produção vira item de aprendizado institucional documentado e priorizado.

---

## 🔩 Princípios de Implementação

*   **Validação de Entrada:** Zod (TS) / Pydantic (Python). Todo payload passa por schema validation.
*   **Idempotência Universal:** request_id + event_id obrigatórios. Middleware centralizado.
*   **Observabilidade Obrigatória:** Logs estruturados + métricas + traces.
*   **Resiliência por Padrão:** Timeout, retry, circuit breaker em toda chamada externa.
*   **Multi-tenant Isolation:** `tenant_id` em toda query (middleware Prisma).
*   **Test Coverage Obrigatória:** Happy path + edge cases + erros. Unitários, integração e contrato.

---

## ⚙️ Implementation Tasks (I-Series)

| Status | ID | Prio | Domain | Title | Evidence | Metric |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| [x] | **I01** | P0 | BACKEND | Criar camada service/repository no gateway para leads | PR com testes unitários e integração | CRUD real em produção |
| [ ] | **I02** | P0 | BACKEND | Implementar rotas de deals com transições válidas (state machine) | state machine + testes | zero transição inválida |
| [ ] | **I03** | P1 | BACKEND | Implementar customers health com cálculo real e jobs de atualização | endpoint + jobs atualização | health score confiável |
| [x] | **I04** | P0 | BACKEND | Implementar billing summary via agregações SQL otimizadas | query otimizada + teste | p95 endpoint < 300ms |
| [ ] | **I05** | P0 | BACKEND | Implementar contratos com versionamento e trilha de auditoria | tabelas + API + auditoria | rastreabilidade jurídica completa |
| [ ] | **I06** | P1 | BACKEND | Implementar API de analytics com filtros por tenant e índices | endpoints + índice | consultas previsíveis em escala |
| [x] | **I07** | P0 | BACKEND | Adicionar validação Zod/Pydantic em todos os payloads críticos | schemas + testes negativos | rejeição consistente de payload inválido |
| [x] | **I08** | P0 | BACKEND | Centralizar middleware de idempotência e rate limit reutilizável | middleware reutilizável | proteção uniforme em APIs |
| [ ] | **I09** | P1 | BACKEND | Publicar OpenAPI assinado, versionado e consumível por clientes | pipeline geração docs | contrato consumível por clientes |
| [ ] | **I10** | P0 | BACKEND | Implementar webhook receiver robusto com assinatura, retries e DLQ | assinatura + retries + DLQ | perda de evento = 0 |
| [ ] | **I11** | P0 | ORQUESTRAÇÃO | Completar fluxo DEAL_CLOSED_WON executável ponta a ponta | grafo + persistência de estado | fluxo automatizado ponta a ponta |
| [ ] | **I12** | P0 | ORQUESTRAÇÃO | Completar fluxo HEALTH_ALERT com ações CS e workers ativos | workers + regras | resposta proativa a risco |
| [ ] | **I13** | P0 | ORQUESTRAÇÃO | Completar fluxo CHURN_RISK_HIGH com playbook CRM integrado | grafo + integração CRM | churn evitável reduzido |
| [ ] | **I14** | P1 | ORQUESTRAÇÃO | Completar fluxo BOARD_REPORT agendado com geração automática | cron + geração relatório | reporte executivo automático |
| [ ] | **I15** | P0 | ORQUESTRAÇÃO | Persistir estado intermediário do orquestrador para reprocessamento | tabela state + APIs consulta | reprocessamento determinístico |
| [ ] | **I16** | P0 | ORQUESTRAÇÃO | Implementar DLQ e endpoint de reprocessamento manual de eventos | filas + endpoint retry | incidentes recuperáveis sem engenharia |
| [ ] | **I17** | P1 | ORQUESTRAÇÃO | Priorização de fila por evento/plano para SLA premium | políticas de prioridade | SLA premium sustentado |
| [ ] | **I18** | P1 | ORQUESTRAÇÃO | Isolamento de fila por tenant enterprise com namespaces e quotas | namespaces + quotas | ruído entre tenants eliminado |
| [ ] | **I19** | P2 | ORQUESTRAÇÃO | Implementar endpoint de cancelamento de execução de jobs | API cancel + teste | jobs órfãos reduzidos |
| [ ] | **I20** | P0 | ORQUESTRAÇÃO | Implementar métricas de throughput/latência por fluxo em tempo real | exportadores + dashboards | gargalos visíveis em tempo real |
| [ ] | **I21** | P0 | INTEGRAÇÕES | Integrar Stripe com eventos de cobrança completos e reconciliação | client + webhooks + reconciliação | faturamento automatizado confiável |
| [ ] | **I22** | P1 | INTEGRAÇÕES | Integrar Pagar.me/Asaas com fallback de adquirência automático | adapters + failover | continuidade de cobrança |
| [ ] | **I23** | P0 | INTEGRAÇÕES | Integrar Focus NFe para emissão e consulta de status fiscal | emissão + consulta status | compliance fiscal operacional |
| [ ] | **I24** | P0 | INTEGRAÇÕES | Integrar Clicksign/DocuSign para contratos com callbacks | assinatura + callbacks | ciclo contratual digitalizado |
| [ ] | **I25** | P1 | INTEGRAÇÕES | Integrar HubSpot/Pipedrive com sync incremental e reconciliação | jobs sync + reconciliação | CRM sem divergência crítica |
| [ ] | **I26** | P1 | INTEGRAÇÕES | Integrar Resend/WhatsApp para comunicações transacionais com tracking | templates + tracking | entregabilidade monitorada |
| [ ] | **I27** | P2 | INTEGRAÇÕES | Integrar Google/Meta Ads para attribution e CAC por canal | ingestão + modelo atribuição | CAC por canal confiável |
| [ ] | **I28** | P1 | INTEGRAÇÕES | Implementar conector Calendar para agendamento SDR sem conflitos | booking + conflitos | aumento de reuniões válidas |
| [ ] | **I29** | P2 | INTEGRAÇÕES | Implementar conector Drive/Storage para anexos com ACL auditável | upload seguro + ACL | gestão documental auditável |
| [ ] | **I30** | P1 | IA/LLM | Implementar fallback de LLM (Gemini + modelo secundário) | roteador + health check | disponibilidade IA elevada |
| [ ] | **I31** | P1 | IA/LLM | Implementar orçamento de tokens por tenant com alertas | quotas + alertas | custo de IA previsível |
| [ ] | **I32** | P1 | IA/LLM | Implementar avaliação offline de prompts com scorecards | benchmark + scorecards | melhora contínua de qualidade |
| [ ] | **I33** | P0 | IA/LLM | Implementar sandbox de tools de agentes com isolamento e políticas | isolamento + políticas | redução de risco operacional |
| [ ] | **I34** | P2 | IA/LLM | Implementar cache semântico para tarefas repetidas (custo/latência) | cache + invalidação | custo/latência de IA reduzidos |
| [ ] | **I35** | P1 | FRONT-END | Implementar dashboards operacionais em tempo real (SRE + negócio) | painéis SRE + negócio | decisão assistida por dados ao vivo |
| [ ] | **I36** | P1 | FRONT-END | Implementar tela pipeline com drag/drop e SLAs comerciais | página + API + testes | operação comercial centralizada |
| [ ] | **I37** | P1 | FRONT-END | Implementar tela financeiro com MRR/churn/inadimplência | página + consultas | visibilidade financeira diária |
| [ ] | **I38** | P1 | FRONT-END | Implementar tela contratos com status de assinatura em tempo real | página + webhook status | fechamento jurídico acelerado |
| [ ] | **I39** | P1 | FRONT-END | Implementar tela logs de agentes com filtros avançados e busca | página + busca | troubleshooting rápido |
| [ ] | **I40** | P1 | FRONT-END | Implementar tela health score com alertas acionáveis e regras | página + regras | churn preventivo operacional |
| [ ] | **I41** | P0 | SEGURANÇA | Implementar autenticação robusta dashboard com MFA opcional | fluxos auth + sessão | risco de takeover reduzido |
| [ ] | **I42** | P0 | SEGURANÇA | Implementar controle de acesso granular por módulo (RBAC frontend/backend) | RBAC frontend/backend | segregação de função real |
| [ ] | **I43** | P0 | QA/CI | Implementar testes E2E dos fluxos críticos com Playwright | suíte Playwright | regressão crítica bloqueada |
| [ ] | **I44** | P0 | QA/CI | Implementar testes de contrato OpenAPI no CI com gates | pipeline com gates | quebra de API detectada cedo |
| [ ] | **I45** | P1 | QA/CI | Implementar testes de carga BullMQ e API Gateway (k6/artillery) | cenários k6/artillery | baseline de escala validado |
| [ ] | **I46** | P0 | SEGURANÇA | Implementar cobertura mínima de segurança no CI (SAST/SCA/secrets) | SAST/SCA/secret scanning | vulnerabilidade crítica bloqueada |
| [ ] | **I47** | P0 | INFRA | Implementar política de backup/restore automatizada com drill | jobs + restore drill | resiliência comprovada |
| [ ] | **I48** | P0 | INFRA | Implementar runbook de incidentes P0/P1 com game days | runbooks + game days | resposta padronizada e rápida |
| [ ] | **I49** | P1 | CI/CD | Implementar deploy canary para serviços críticos com health gates | pipeline + health gates | risco de release reduzido |
| [ ] | **I50** | P1 | INFRA | Implementar DR drill trimestral multi-serviço documentado | relatório drill | continuidade de negócio garantida |

---

## 🔷 Architecture Tasks (M-Series)

| Status | ID | Prio | Domain | Title | Evidence | Metric |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| [x] | **M01** | P0 | PLATAFORMA | Arquitetura orientada a domínio por bounded contexts | 0 conflitos de responsabilidade entre serviços |
| [ ] | **M02** | P0 | PLATAFORMA | Matriz de criticidade por serviço e dependência (service catalog + RACI) | MTTR por serviço crítico < 30 min |
| [ ] | **M03** | P0 | CONTRATOS | Contratos internos versionados: schema registry + changelog de eventos e APIs | schema registry + changelog | 100% eventos versionados |
| [ ] | **M04** | P1 | PLATAFORMA | Política de depreciação com SLA de migração documentado | 0 quebra sem aviso |
| [ ] | **M05** | P0 | RESILIÊNCIA | Estratégia de resiliência: lib comum de timeout/retry/circuit breaker com testes caos | lib comum + testes caos | falhas transitórias recuperadas > 95% |
| [x] | **M06** | P0 | RESILIÊNCIA | Idempotência de ponta a ponta via middleware com request/event id universal | middleware + testes | duplicidade operacional = 0 |
| [x] | **M07** | P0 | OBSERVABILIDADE | Observabilidade full-stack: logs estruturados, métricas Prometheus, traces OTEL | dashboards + alertas | cobertura de tracing > 90% |
| [ ] | **M08** | P0 | OBSERVABILIDADE | SLO/SLI por domínio e serviço com error budget monitorado semanalmente | docs/slo + alert rules | erro budget monitorado semanalmente |
| [ ] | **M09** | P1 | DADOS | FinOps com custo por tenant/feature/LLM visível em painel | custo por receita reduzido trimestralmente |
| [ ] | **M10** | P0 | SEGURANÇA | Governança de segredos com rotação automática (Vault/Secret Manager) | policy + jobs rotação | 100% segredos com rotação |
| [x] | **M11** | P0 | SEGURANÇA | Hardening de autenticação, sessão e RBAC com testes de autorização | testes de autorização | 0 endpoint sensível sem RBAC |
| [ ] | **M12** | P0 | COMPLIANCE | Auditoria imutável para ações administrativas críticas (append-only) | tabela audit + trilha | 100% ações administrativas auditadas |
| [ ] | **M13** | P0 | SEGURANÇA | Política LGPD: retenção, anonimização, minimização (DPIA) | conformidade auditável |
| [ ] | **M14** | P1 | DADOS | Data quality checks automáticos com jobs e relatórios | incidentes de dados críticos < 2/mês |
| [ ] | **M15** | P0 | DADOS | Gestão de schema evolutivo com padrão expand-contract e playbook de migração | playbook de migração | zero downtime em migrações |
| [ ] | **M16** | P0 | DADOS | Estratégia de índices e plano de capacidade SQL com explain plans | explain plans + índices | p95 consultas críticas < 150ms |
| [ ] | **M17** | P1 | DADOS | Particionamento e retenção de AgentLog com política de custo | custo de storage otimizado |
| [ ] | **M18** | P0 | PLATAFORMA | Backups testados com restore drill mensal documentado | RTO/RPO dentro do alvo |
| [ ] | **M19** | P0 | SEGURANÇA | Segurança de supply chain: SCA + SAST + Secrets scanning nos CI gates | CI gates | vulnerabilidade crítica em prod = 0 |
| [ ] | **M20** | P0 | QA | Testes de contrato consumer-driven entre todos os serviços | suíte consumer-driven | regressão de contrato = 0 |
| [ ] | **M21** | P1 | QA | Qualidade de teste por risco (pirâmide balanceada, flakiness < 2%) | estratégia QA | flakiness e2e < 2% |
| [ ] | **M22** | P1 | QA | Testes de carga periódicos em filas BullMQ e APIs críticas | relatório perf | throughput alvo sustentado |
| [ ] | **M23** | P2 | RESILIÊNCIA | Chaos engineering para dependências externas (degradação graciosa) | cenários caos | degradação graciosa validada |
| [ ] | **M24** | P1 | DEPLOYMENT | Feature flags com rollout progressivo e rollback < 5 min | framework FF | rollback < 5 min |
| [ ] | **M25** | P1 | PLATAFORMA | Catálogo de integrações com score de confiabilidade por provedor | MTBF integrações em alta |
| [ ] | **M26** | P0 | SEGURANÇA | Estratégia antifraude para pagamentos e webhooks com regras e monitoria | regras + monitoria | chargeback/fraude sob controle |
| [x] | **M27** | P0 | BACKEND | Padronização de erros de domínio e catálogo de erros com observabilidade | catálogo de erros | TTR de incidentes reduzido |
| [ ] | **M28** | P0 | ARQUITETURA | Arquitetura multi-tenant isolada por dados e filas (desenho de tenancy) | desenho tenancy | ausência de vazamento cross-tenant |
| [ ] | **M29** | P1 | IA | Governança de prompts e modelos (AI Ops + versionamento) | regressão de qualidade monitorada |
| [ ] | **M30** | P0 | IA/SEGURANÇA | Guardrails de IA: PII, toxicidade, jailbreak — filtros + testes | filtros + testes | incidentes de segurança de IA = 0 |
| [ ] | **M31** | P1 | IA/LLM | Observabilidade por token/custo/latência de LLM com dashboards | dashboards LLM | otimização contínua de custo |
| [ ] | **M32** | P1 | IA/LLM | Estratégia de fallback multi-modelo com roteador e health check | roteador de modelos | disponibilidade IA > 99,5% |
| [ ] | **M33** | P1 | IA/LLM | Golden datasets para validação de agentes com suíte de avaliação | suíte de avaliação | precisão mínima definida por tarefa |
| [ ] | **M34** | P0 | FRONT-END | Segurança de front-end: CSP, sanitização, headers (auditoria OWASP) | auditoria OWASP | XSS/CSRF críticos = 0 |
| [ ] | **M35** | P1 | FRONT-END | Performance front-end com Core Web Vitals e relatórios Lighthouse | relatórios Lighthouse | LCP < 2.5s em páginas-chave |
| [ ] | **M36** | P1 | FRONT-END | Design system com tokens semânticos e acessibilidade WCAG AA | conformidade WCAG AA |
| [ ] | **M37** | P2 | PRODUTO | Estratégia de internacionalização e moeda/fiscal para expansão | expansão de mercado sem retrabalho |
| [ ] | **M38** | P0 | CI/CD | Pipeline CI/CD com gates por risco e políticas de qualidade obrigatórias | workflow com políticas | lead time sem sacrificar qualidade |
| [ ] | **M39** | P1 | CI/CD | Release train com canary deployment e rollback automático por health | pipeline deployment | MTTD/MTTR de release reduzidos |
| [ ] | **M40** | P0 | PLATAFORMA | Runbooks operacionais por incidente crítico com game days | tempo de diagnóstico acelerado |
| [ ] | **M41** | P1 | PLATAFORMA | Gestão de capacidade e autoscaling baseado em SLO (HPA/Cloud Run) | saturação sob picos controlada |
| [x] | **M42** | P0 | OBSERVABILIDADE | Política de logs estruturados com correlação única e rastreabilidade fim a fim | logger padrão | rastreabilidade fim a fim |
| [ ] | **M43** | P2 | ENGENHARIA | Governança de nomenclatura e convenções de código com lint | consistência transversal |
| [ ] | **M44** | P1 | PROCESSO | Modelo de ownership técnico por pasta/serviço com CODEOWNERS ativo | CODEOWNERS ativo | redução de filas de revisão |
| [ ] | **M45** | P1 | ENGENHARIA | Gestão de dívida técnica por orçamento trimestral e backlog | redução de débito alto impacto |
| [ ] | **M46** | P1 | PRODUTO | KPI Tree Executiva (M46) | KPI tree executiva (produto, receita, operação) em dashboard | decisões data-driven semanais |
| [ ] | **M47** | P2 | ENGENHARIA | Modelo de maturidade de engenharia por domínio com score | evolução previsível por trimestre |
| [ ] | **M48** | P2 | PLATAFORMA | Revisão arquitetural quinzenal orientada a risco com atas | riscos críticos tratados no prazo |
| [ ] | **M49** | P1 | ENGENHARIA | Política de documentação viva por PR com template e lint | docs desatualizada < 10% |
| [ ] | **M50** | P2 | PRODUTO | Framework de decisão buy vs build por integração (matriz TCO) | menor custo total de propriedade |
