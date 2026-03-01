# JULES // Program Command — BirthHub 360

**Role:** Program Manager Técnico + Arquiteto de Entrega
**Mission:** Plan with Precision. Execute with Discipline.

---

## 🎯 Mission Brief

**Context:**
*   100 ações classificadas (M01–M50 e I01–I50), prioridades P0–P2
*   Stack: TypeScript, Python, Prisma, Redis/BullMQ, Cloud Run

**Tasks:**
1.  Organizar 100 ações em 4 ondas de execução (90 dias cada): Fundação · Confiabilidade · Escala · Otimização
2.  Para cada onda: objetivo de negócio, ações, dependências, capacidade estimada, riscos, métricas de sucesso
3.  Produzir matriz RACI por trilha: Produto · Plataforma · Dados · Segurança · IA · Front-end
4.  Gerar cronograma executivo quinzenal com go/no-go criteria
5.  Gerar checklist de governança semanal para CTO: Arquitetura · Qualidade · Operação · Finanças

---

## 🌊 4 Ondas de 90 Dias

Cada onda tem objetivo de negócio claro, dependências técnicas explícitas, capacidade em squads/semana e critério de sucesso auditável. Nenhuma onda avança sem evidência da anterior.

### Onda 01: Fundação (Semanas 1-12)
*   **Período:** Dias 1–90 · 3 Squads
*   **Objetivo:** Eliminar risco de inconsistência de dados, estabelecer contratos entre serviços, autenticação robusta e CI/CD funcional. O sistema deve ser observável e auditável.
*   **Ações Chave:**
    *   M01–M03: Bounded contexts, matriz de criticidade, contratos versionados
    *   M06–M08: Idempotência, observabilidade full-stack, SLO/SLI
    *   M10–M13: Segredos, RBAC, auditoria, LGPD
    *   M15–M16: Schema evolutivo, índices SQL críticos
    *   M18–M20: Backups, supply chain security, testes de contrato
    *   M28: Arquitetura multi-tenant isolada
    *   M38–M40: CI/CD com gates, runbooks P0/P1
    *   I01–I10: Core APIs gateway (leads, deals, billing, contratos)
    *   I41–I44, I46–I48: Auth, RBAC, E2E, SAST, backup
*   **Capacidade:** 3 squads · 2 sem.
*   **Ações:** ~35 itens P0
*   **Risco Principal:** Débito técnico alto
*   **Critério Exit:** 0 endpoint sem RBAC

### Onda 02: Confiabilidade (Semanas 13-24)
*   **Período:** Dias 91–180 · 4 Squads
*   **Objetivo:** Completar fluxos de agentes ponta a ponta, integrar provedores críticos (Stripe, NFe, DocuSign), implementar resiliência com DLQ e recovery, eliminar mocks residuais.
*   **Ações Chave:**
    *   M05: Resiliência (timeout, retry, circuit breaker)
    *   M24–M25: Feature flags, catálogo de integrações
    *   M26–M27: Antifraude, catálogo de erros de domínio
    *   M29–M30: AI Ops (prompt versioning), guardrails de IA
    *   I11–I20: Fluxos DEAL_CLOSED_WON, HEALTH_ALERT, CHURN_RISK_HIGH, DLQ
    *   I21–I24: Stripe, Pagar.me, Focus NFe, DocuSign/Clicksign
    *   I33: Sandbox de tools de agentes (isolamento)
*   **Capacidade:** 4 squads · 2 sem.
*   **Ações:** ~30 itens P0-P1
*   **Risco Principal:** Integrações externas lentas
*   **Critério Exit:** Fluxos P&A automáticos

### Onda 03: Escala (Semanas 25-36)
*   **Período:** Dias 181–270 · 4 Squads
*   **Objetivo:** Habilitar crescimento de tenants sem degradação, performance de front-end, testes de carga, FinOps operacional, dashboards de negócio e internacionalização.
*   **Ações Chave:**
    *   M09: FinOps com custo por tenant/feature/LLM
    *   M14, M17: Data quality, particionamento AgentLog
    *   M21–M23: Pirâmide QA, testes de carga, chaos engineering
    *   M31–M35: Observabilidade LLM, fallback multi-modelo, golden datasets, FE performance
    *   M36, M41: Design system WCAG AA, autoscaling SLO
    *   I25–I29: CRM sync, Resend/WhatsApp, Ads attribution, Calendar, Drive
    *   I35–I40: Dashboards operacionais, pipeline, financeiro, contratos, health score
    *   I45, I49–I50: Testes carga BullMQ, canary deploy, DR drill
*   **Capacidade:** 4 squads · 2 sem.
*   **Ações:** ~25 itens P1-P2
*   **Risco Principal:** Complexidade de UI
*   **Critério Exit:** 10+ tenants simultâneos

### Onda 04: Otimização (Semanas 37-48)
*   **Período:** Dias 271–360 · 3 Squads
*   **Objetivo:** Atingir maturidade operacional, cache semântico de IA, i18n para expansão, governança de código, modelo de maturidade de engenharia e KPI tree executiva.
*   **Ações Chave:**
    *   M37: Internacionalização e fiscal multi-mercado
    *   M43–M50: Nomenclatura, ownership, dívida técnica, KPI tree, maturidade
    *   M47–M48: Modelo de maturidade, revisões arquiteturais quinzenais
    *   I30–I32, I34: Fallback LLM, avaliação prompts, cache semântico
    *   I14: BOARD_REPORT automático e agendado
*   **Capacidade:** 3 squads · 2 sem.
*   **Ações:** ~10 itens P1-P2
*   **Risco Principal:** Scope creep tardio
*   **Critério Exit:** Score maturidade > 3.5

---

## 📅 Cronograma Executivo (Marcos Quinzenais)

| Semana | Marco | Critério | Go/No-Go |
| :--- | :--- | :--- | :--- |
| **Semana 2** | **M1: Bounded Contexts + Contratos Versionados** | RFC aprovado. Schema registry ativo. Diagrama C4. | **GO:** RFC aprovado + schema registry<br>**NO-GO:** Domínios sobrepostos |
| **Semana 4** | **M2: Segurança Baseline** | RBAC em tudo. Rotação de segredos. Auditoria imutável. SAST/SCA. | **GO:** Pentest básico passando<br>**NO-GO:** Credencial hardcoded |
| **Semana 6** | **M3: Core APIs em Produção** | CRUD Leads/Deals. Billing p95 < 300ms. Contratos auditados. Zod/Pydantic. | **GO:** Demo ao vivo com dados reais<br>**NO-GO:** Mock em endpoint crítico |
| **Semana 8** | **M4: Observabilidade Full-Stack** | Tracing > 90%. Dashboards SRE. Error budget monitorado. Alertas P0 < 5min. | **GO:** MTTD P0 comprovado em drill<br>**NO-GO:** Falha silenciosa em prod |
| **Semana 12** | **M5: Fluxos de Agentes E2E** | Deal/Health/Churn flows. DLQ operacional. | **GO:** 100 execuções reais sem falha<br>**NO-GO:** Estado intermediário perdido |
| **Semana 16** | **M6: Integrações Financeiras** | Stripe reconciliado. NFe emitindo. Clicksign callbacks. Fallback adq. | **GO:** 1ª cobrança real processada<br>**NO-GO:** Divergência de saldo |
| **Semana 20** | **M7: Dashboards Negócio + FinOps** | Pipeline drag/drop. MRR visível. Custo por tenant. LCP < 2.5s. | **GO:** CEO usa dashboard sem suporte<br>**NO-GO:** Custo IA sem visibilidade |
| **Semana 24** | **M8: Testes Carga + Canary** | BullMQ scale baseline. Canary deploy. Chaos engineering. | **GO:** 10x pico atual sustentado<br>**NO-GO:** Cascading failure em teste |
| **Semana 32** | **M9: AI Ops Maduro** | Zero incidente seg. IA. Budget tokens/tenant. Golden datasets. Cache semântico. | **GO:** Avaliação offline passando<br>**NO-GO:** PII vazando em output |
| **Semana 40** | **M10: Maturidade Operacional** | Score > 3.5. KPI tree. i18n. Architecture verdict. | **GO:** Architecture Verdict aprovado<br>**NO-GO:** Risco P0 aberto |

---

## 👥 Matriz RACI

| Trilha / Atividade | CTO | Tech Lead Plat. | Tech Lead Produto | SRE/DevOps | Eng. Dados | Eng. IA | Frontend Lead | Segurança | PM |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Arquitetura de Domínio (M01–M02) | A | **R** | C | I | C | I | I | C | I |
| Contratos + Schema Registry (M03–M04) | A | **R** | C | I | C | I | I | I | I |
| Resiliência + Observabilidade (M05–M08) | A | **R** | I | **R** | I | I | I | C | I |
| FinOps · Custo por tenant (M09) | A | C | C | **R** | **R** | C | I | I | C |
| Segurança + RBAC + Auditoria (M10–M12) | A | C | C | C | I | I | I | **R** | I |
| LGPD + Compliance (M13) | A | C | C | I | **R** | I | I | **R** | C |
| Data Quality + Schema SQL (M14–M17) | A | C | I | C | **R** | I | I | I | I |
| Backup + DR Drill (M18) | A | C | I | **R** | C | I | I | C | I |
| AI Ops + Guardrails (M29–M33) | A | C | I | I | I | **R** | I | C | C |
| Front-end + Design System (M34–M36) | A | I | C | I | I | I | **R** | C | **R** |
| CI/CD + Release Train (M38–M39) | A | **R** | C | **R** | I | I | I | C | I |
| Dívida Técnica + Maturidade (M45–M47) | A | **R** | C | C | C | C | C | C | C |
| KPI Tree Executiva (M46) | A | C | C | I | **R** | I | **R** | I | A |

**Legenda:** R = Responsável (executa), A = Aprovador (decisão final), C = Consultado (input), I = Informado.

---

## ⚠️ Top 10 Riscos (Impacto x Probabilidade)

| Rank | Risco | Domínio | Impacto | Prob. | Mitigação (Ações) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Complexidade invisível multi-agente sem observabilidade | IA/Ops | CRÍTICO | ALTA | Observabilidade full-stack (M07, M08, I20) |
| **2** | Mocks residuais em produção | Backend | ALTO | MÉDIA | Gate CI bloqueia TODO/mock (I01–I10, M20) |
| **3** | Vazamento cross-tenant (falta de isolamento) | Sec/Dados | CRÍTICO | MÉDIA | Middleware tenant_id + RLS (M28, M13, M12) |
| **4** | Explosão de custo de LLM | IA/FinOps | ALTO | ALTA | Quotas por tenant + Alertas (M09, M31, I31) |
| **5** | Inconsistência de dados (falta de idempotência) | Backend | ALTO | ALTA | Middleware idempotência Redis (M06, I08, I10) |
| **6** | Perda de estado em fluxos de agente | Orch | ALTO | MÉDIA | Persistência Postgres + DLQ (I15, I16, I11–I13) |
| **7** | Integrações externas como SPOF | Int/Res | MÉDIO | MÉDIA | Circuit breaker + Fallback (M05, M25, I22) |
| **8** | Segurança IA (PII, jailbreak) | IA/Sec | CRÍTICO | BAIXA | Guardrails + Sandbox (M30, I33, M29) |
| **9** | Débito técnico acumulado | Eng | MÉDIO | ALTA | Reserva 20% capacity + Review (M45, M47, M48) |
| **10** | Ausência de ownership técnico | Processo | BAIXO | ALTA | CODEOWNERS + Docs viva (M44, M49, M43) |

---

## ✅ Checklist de Governança Semanal (CTO)

### 🏗️ Arquitetura & Qualidade (Segunda-feira)
- [ ] Há algum serviço sem dono claro (CODEOWNERS) ou com responsabilidade sobreposta?
- [ ] Algum PR da semana quebrou contrato entre serviços sem atualizar schema registry?
- [ ] Alguma migração de schema foi aplicada sem o padrão expand-contract documentado?
- [ ] O índice de flakiness de testes E2E está abaixo de 2%?
- [ ] Alguma decisão de arquitetura nova aumentou acoplamento sem revisão em fórum?
- [ ] Coverage de testes de contrato está acima do mínimo para todos os serviços críticos?

### 📡 Operação & SLO (Segunda-feira)
- [ ] Algum SLO de serviço crítico queimou mais de 20% do error budget na semana?
- [ ] Todos os incidentes P0/P1 da semana têm post-mortem aberto e ação no checklist?
- [ ] DLQ está limpa ou com itens processados e justificados?
- [ ] Backup foi executado e restore drill está dentro do prazo mensal?
- [ ] Runbooks de P0 foram usados esta semana? Precisam de atualização?
- [ ] Tracing coverage está acima de 90%? Algum serviço novo sem instrumentação?

### 🔐 Segurança & Compliance (Segunda-feira)
- [ ] Alguma vulnerabilidade crítica (SAST/SCA) nova aberta sem atribuição e prazo?
- [ ] Segredos com rotação vencida ou próxima do vencimento identificados?
- [ ] Algum endpoint novo não passou por revisão de RBAC?
- [ ] Guardrails de IA (PII, toxicidade) foram testados no deploy mais recente?
- [ ] Solicitações de acesso a dados sensíveis revisadas e justificadas?

### 💰 Finanças & FinOps (Segunda-feira)
- [ ] Custo de LLM por tenant está dentro do orçamento esperado? Alguma anomalia?
- [ ] Custo de infraestrutura por receita melhorou ou piorou em relação à semana anterior?
- [ ] MRR e churn atualizados no dashboard? Algum tenant em risco alto?
- [ ] Alguma integração de billing (Stripe/NFe) com divergência ou falha silenciosa?
- [ ] Orçamento trimestral de débito técnico sendo respeitado?

### 🤖 IA & Agentes (Segunda-feira)
- [ ] Algum prompt alterado sem versionamento e rollback testado?
- [ ] Golden datasets foram executados no último deploy? Score mínimo mantido?
- [ ] Disponibilidade do LLM primário acima de 99,5%? Fallback testado?
- [ ] Latência p95 de completions dentro do SLO por fluxo?
- [ ] Sandbox de tools isolou corretamente todos os agentes novos da semana?

### 📈 Produto & Execução (Segunda-feira)
- [ ] Quantos itens do checklist foram fechados com evidência verificável na semana?
- [ ] Algum item fechado sem evidência técnica real (PR/teste/dashboard)?
- [ ] Estamos no ritmo de 8–12 itens/semana? Acima ou abaixo?
- [ ] Próximo marco quinzenal está on-track? Quais itens estão em risco?
- [ ] Alguma decisão de buy vs. build em aberto que está bloqueando sprint?
