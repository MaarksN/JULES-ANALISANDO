# BirthHub 360 — Arquitetura de Backend (RevOps Multi-Agente)

## Visão geral

O **BirthHub 360** é um monorepo orientado a domínio para operação de Revenue Operations com 8 agentes de IA, cobrindo o ciclo completo de receita B2B:

1. Marketing (demanda)
2. LDR (enriquecimento e ICP)
3. SDR (prospecção e agendamento)
4. AE (negociação e fechamento)
5. Pós-venda (CS e retenção)
6. Analista (BI e insights)
7. Financeiro (faturamento e cobrança)
8. Jurídico (contratos e compliance)

## Camadas da solução

- **API Gateway (Express + TypeScript)**: autenticação JWT, roteamento central, proteção de borda e contratos HTTP públicos.
- **Agent Orchestrator (FastAPI + LangGraph)**: definição dos fluxos multi-agente e handoff por eventos.
- **Microservices dos agentes (FastAPI, Python 3.12)**: ferramentas especializadas, prompts e regras de decisão por vertical.
- **Persistência principal (PostgreSQL/Supabase + Prisma)**: single source of truth para CRM operacional, contratos, faturas e logs.
- **Fila e execução assíncrona (Redis + BullMQ)**: jobs de alta latência e integrações externas.
- **Busca e intent (Elasticsearch)**: enriquecimento contextual e sinais de compra.
- **Integrações externas**: Stripe/Pagar.me/Asaas, Clicksign/DocuSign, Focus NFe, HubSpot/Pipedrive, Resend, WABA, Google Calendar/Drive.

## Fluxos principais

### 1) Lifecycle de lead

`Marketing -> LDR -> SDR -> AE`

- Marketing gera/segmenta campanhas.
- LDR enriquece lead e calcula ICP Tier.
- SDR aplica cadência adaptativa multicanal.
- AE conduz negociação, forecast e fechamento.

### 2) Pós-fechamento

`AE (closed_won) -> Jurídico + Financeiro + Pós-venda`

- Jurídico gera/revisa contrato e assinatura digital.
- Financeiro emite invoice, dunning e conciliação.
- Pós-venda inicia onboarding, health score, NPS e retenção.

### 3) Governança de dados

`Todos os agentes -> AgentLog`

- Cada execução escreve trilha de auditoria (input/output/erro/tokens/duração).
- Analista consolida KPIs para dashboards e relatórios executivos.

## Diretrizes técnicas

- **Node.js 20 + TypeScript strict** para camada JS/TS.
- **Python 3.12 + FastAPI** para serviços de IA.
- **LangGraph** para orquestração de estados entre agentes.
- **Docker Compose (dev)** e **Cloud Run (prod)** para execução.
- **Observabilidade** via Prometheus, Grafana e Cloud Logging.

## Segurança e compliance

- Autenticação via Supabase Auth + JWT.
- Entrada de webhooks assinados via Svix.
- Registro de eventos críticos (contratos, pagamentos, alterações de status).
- Princípio de menor privilégio para integrações externas e chaves de API.
