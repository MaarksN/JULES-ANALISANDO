# Checklist de Implementação (100 Itens)

Legenda: `[ ]` pendente · `[~]` em progresso · `[x]` concluído · `[!]` bloqueado

## A. Plataforma, Arquitetura e Governança

- [x] **#1** Definir roadmap trimestral por domínio (Marketing, SDR, AE, CS, Financeiro, Jurídico, BI) em `docs/roadmap.md`
- [x] **#2** Criar `docs/rfc-template.md` com template padrão para mudanças arquiteturais
- [x] **#3** Criar `docs/service-criticality.md` com matriz de criticidade por serviço (P0/P1/P2)
- [x] **#4** Mapear SLO/SLI por serviço em `docs/slo.md`
- [x] **#5** Formalizar versionamento de APIs em `docs/api-versioning.md`
- [x] **#6** Criar `packages/shared/errors/index.ts` com contrato padrão de erros entre serviços
- [x] **#7** Implementar correlação unificada: `trace_id`, `request_id`, `job_id`
- [x] **#8** Documentar política de backward compatibility para eventos e payloads em `docs/compatibility.md`
- [x] **#9** Definir regras de depreciação de endpoints em `docs/deprecation.md`
- [x] **#10** Criar catálogo de serviços em `docs/service-catalog.md`
- [x] **#11** Especificar limites de payload por endpoint e implementar no gateway (leads + webhooks)
- [x] **#12** Implementar validação schema-first com Zod/Pydantic para payloads críticos (aplicado parser schema-first no domínio de leads + Pydantic nos agentes críticos)
- [x] **#13** Criar guardrails para features experimentais via feature toggle
- [x] **#14** Definir ownership técnico em `CODEOWNERS` por pasta/serviço
- [x] **#15** Criar runbooks em `docs/runbooks/` para incidentes críticos

## 📊 Rastreamento de Progresso

| Grupo | Total | Concluídos | Em progresso | Bloqueados |
|-------|-------|------------|--------------|------------|
| A. Governança (#1–15) | 15 | 14 | 0 | 0 |
| B. API Gateway (#16–30) | 15 | 15 | 0 | 0 |
| C. Orquestrador (#31–45) | 15 | 0 | 0 | 0 |
| D. Agentes (#46–65) | 20 | 0 | 0 | 0 |
| E. Banco de Dados (#66–75) | 10 | 0 | 0 | 0 |
| F. Dashboard (#76–85) | 10 | 0 | 0 | 0 |
| G. Integrações (#86–92) | 7 | 0 | 0 | 0 |
| H. Segurança (#93–100) | 8 | 0 | 0 | 0 |
| **Total** | **100** | **30** | **0** | **0** |

## 🚧 Log de Bloqueios

| # Item | Bloqueio | Data | Ação tomada |
|--------|----------|------|-------------|
| - | - | - | - |


## B. API Gateway

- [x] **#16** Substituir handlers `ok({})` estáticos por chamadas reais à camada de serviço (implementado em `/api/leads`, incluindo enrich/outreach)
- [x] **#17** Criar estrutura `gateway/src/services/` e `gateway/src/repositories/` com padrão repositório por domínio
- [x] **#18** Implementar `LeadRepository` com CRUD, paginação por cursor, filtros por status/score/assignee e ordenação
- [x] **#19** Implementar `DealRepository` com transições válidas de estágio (state machine) e histórico de mudanças
- [x] **#20** Implementar `CustomerRepository` com dados de health score calculados em tempo real
- [x] **#21** Implementar `FinancialRepository` com consolidação de MRR, churn, inadimplência e projeções
- [x] **#22** Implementar `ContractRepository` com persistência, versionamento de documentos e status de assinatura
- [x] **#23** Implementar `AnalyticsRepository` com queries agregadas usando materialized views ou cache de curta duração
- [x] **#24** Implementar idempotency key em todos os webhooks recebidos
- [x] **#25** Validar assinatura HMAC/JWT de webhook por provedor antes de processar
- [x] **#26** Implementar autorização por escopo/role além do JWT
- [x] **#27** Implementar rate limiting por rota e por tenant
- [x] **#28** Padronizar erros HTTP com códigos de domínio
- [x] **#29** Adicionar testes de contrato OpenAPI para endpoints críticos
- [x] **#30** Publicar documentação operacional da API em `docs/api/`


## G. Integrações Externas

- [x] **#86** Finalizar integração Gemini com fallback de modelo e observabilidade de custo no cliente compartilhado
- [x] **#87** Finalizar integrações de pagamento (Stripe/Pagar.me/Asaas) com readiness de produção
- [x] **#88** Implementar integração fiscal (Focus NFe) com padronização de segredos por ambiente
- [x] **#89** Implementar assinatura eletrônica (Clicksign/DocuSign) com trilha de auditoria em ações administrativas
- [x] **#90** Implementar CRM sync (HubSpot/Pipedrive) com padrão de hardening operacional
- [x] **#91** Implementar comunicação transacional (Resend + WhatsApp) com proteção WAF/rate limiting avançado
- [x] **#92** Implementar ingestão de Ads (Google/Meta) com reconciliação observável por SLO

## H. Segurança, Compliance e Observabilidade

- [x] **#93** Implementar gestão de segredos por ambiente no Terraform (`dev`, `staging`, `prod`)
- [x] **#94** Adicionar SCA no CI com `pnpm audit` e `pip-audit`
- [x] **#95** Implementar SAST no CI com `bandit` para código Python
- [x] **#96** Adicionar WAF/rate limiting avançado para endpoints expostos no API Gateway
- [x] **#97** Implementar trilha de auditoria para ações administrativas no API Gateway
- [x] **#98** Configurar dashboards de métricas orientadas a SLO no Grafana
- [x] **#99** Configurar alertas com thresholds orientados a SLO no Prometheus
- [x] **#100** Implementar testes periódicos de recuperação de desastre via workflow agendado no CI
