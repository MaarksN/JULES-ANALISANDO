# Plano de Transformação: de MVP para Referência de Mercado

> Documento convertido de diagnóstico para **plano operacional** com prioridades, entregáveis e métricas de sucesso.

## 1) North Star do Produto
**Missão (12 meses):** ser a plataforma de inteligência comercial mais confiável para prospecção B2B no Brasil, com dados verificáveis, automação segura e ROI comprovado.

**North Star Metric (NSM):**
- `Reuniões qualificadas geradas por 100 leads trabalhados` (RQ/100).

**Métricas de suporte:**
- Precisão dos dados críticos (empresa, contato, status legal).
- Tempo até primeiro valor (TTV).
- Taxa de ativação (Aha Moment).
- Retenção D30 e WAU/MAU.
- Receita influenciada por usuário ativo.

---

## 2) Os 5 blocos que precisam evoluir (com meta objetiva)

### Bloco A — Qualidade e confiabilidade de dados
**Problema atual:** validações e parte do enriquecimento ainda com comportamento de demo.

**Meta de sucesso (90 dias):**
- ≥90% de precisão em campos críticos.
- Deduplicação automática com taxa de colisão <3%.
- Todo lead com `confidence_score` e `source_trace`.

**Entregáveis:**
1. Serviço de normalização e deduplicação.
2. Confidence scoring por campo.
3. Revalidação agendada para leads “stale”.

---

### Bloco B — Segurança, LGPD e governança enterprise
**Problema atual:** componentes de segurança simulados no cliente.

**Meta de sucesso (90 dias):**
- SSO + RBAC real + trilha de auditoria server-side.
- Eliminação de segredos no front.
- Fluxo LGPD operacional auditável (exportar, anonimizar, excluir).

**Entregáveis:**
1. Auth real (OIDC/Auth0/Clerk).
2. Criptografia e gestão de segredos no backend.
3. Logs imutáveis e alertas de segurança.

---

### Bloco C — Arquitetura SaaS escalável
**Problema atual:** alta dependência de browser/localStorage e baixo controle operacional.

**Meta de sucesso (90 dias):**
- API/BFF como camada única de integração.
- Filas para workloads de IA.
- Observabilidade fim a fim (latência, erro, custo por requisição).

**Entregáveis:**
1. Backend com APIs versionadas.
2. Job queue para tarefas assíncronas.
3. Métricas e tracing em produção.

---

### Bloco D — Aderência entre promessa e entrega
**Problema atual:** narrativa de “100 tools” sem cobertura funcional equivalente.

**Meta de sucesso (90 dias):**
- Catálogo com ferramentas reais, classificadas por caso de uso.
- Documentação pública completa.
- Qualidade mínima por ferramenta (input/output, exemplo, limitação).

**Entregáveis:**
1. Curadoria de ferramentas por vertical.
2. Fichas de uso (playbook curto) para cada tool.
3. README e docs de arquitetura/segurança/limites.

---

### Bloco E — Máquina de crescimento e retenção
**Problema atual:** falta de loop fechado entre execução comercial e aprendizado de score.

**Meta de sucesso (90 dias):**
- Feedback loop ativo: ação comercial → resultado → recalibração de score.
- +30% em reuniões qualificadas vs baseline.
- TTV <15 minutos no onboarding.

**Entregáveis:**
1. Telemetria de funil ponta a ponta.
2. Recomendações de próxima melhor ação (NBA).
3. Dashboard de ROI por conta.

---

## 3) Roadmap de 12 semanas (transformado em execução)

## Sprint 1–2 (Semanas 1–4): Fundação
**Objetivo:** retirar risco estrutural.

- [ ] Backend/BFF inicial com autenticação e gestão de segredos.
- [ ] Trocar validações mock por integrações reais prioritárias.
- [ ] Definir dicionário de eventos e instrumentação mínima de produto.
- [ ] Criar baseline de KPIs (antes/depois).

**Critério de aceite da fase:**
- Nenhuma chave sensível no front.
- Auditoria mínima de ações críticas funcionando.
- Pipeline de dados com validação real para casos prioritários.

## Sprint 3–4 (Semanas 5–8): Confiabilidade + Integração
**Objetivo:** tornar a operação previsível.

- [ ] Implementar deduplicação e confidence scoring.
- [ ] Integrar pelo menos 1 CRM (HubSpot/Pipedrive/Salesforce).
- [ ] Criar mecanismos de retry/timeout/circuit breaker para integrações.
- [ ] Publicar documentação técnica e de produto.

**Critério de aceite da fase:**
- Precisão de dados evoluindo com relatório semanal.
- Fluxo lead→CRM funcionando com rastreabilidade.
- Documentação acessível para implantação e operação.

## Sprint 5–6 (Semanas 9–12): Diferenciação e escala comercial
**Objetivo:** provar vantagem competitiva.

- [ ] Lançar copiloto de cadência orientado por histórico.
- [ ] Ativar loop de aprendizado por ICP.
- [ ] Entregar painel de ROI por conta/usuário.
- [ ] Reposicionar comunicação comercial com foco em resultado mensurável.

**Critério de aceite da fase:**
- +30% RQ/100 versus baseline piloto.
- TTV médio abaixo de 15 min.
- Retenção D30 em tendência positiva.

---

## 4) Backlog priorizado (RICE simplificado)

| Iniciativa | Reach | Impact | Confidence | Effort | Prioridade |
|---|---:|---:|---:|---:|---:|
| Backend/BFF + Segredos | Alta | Muito Alto | Alta | Média | P0 |
| Auth + RBAC + Auditoria | Alta | Muito Alto | Alta | Média | P0 |
| CNPJ/Enriquecimento real | Alta | Alto | Média | Baixa/Média | P0 |
| Dedup + Confidence Score | Média | Alto | Média | Média | P1 |
| Integração CRM 1º conector | Média | Alto | Alta | Média | P1 |
| Dashboard ROI | Média | Alto | Média | Média | P1 |
| Expansão curada de Tools | Média | Médio | Média | Média | P2 |

---

## 5) Modelo de operação (cadência de gestão)

**Ritual semanal (60 min):**
1. KPI review (NSM + 4 métricas de suporte).
2. Riscos técnicos/compliance.
3. Decisões de escopo da semana.
4. Status de experimentos (hipótese, resultado, próximo passo).

**Ritual quinzenal (90 min):**
1. Revisão de roadmap e capacidade.
2. Qualidade de dados (painel de precisão).
3. Revisão de churn/ativação por segmento.

---

## 6) Definição de “Referência de Mercado” (checklist)

A ferramenta só pode se posicionar como referência quando cumprir todos:

- [ ] Segurança enterprise validada (SSO, RBAC, auditoria, LGPD operacional).
- [ ] Precisão de dados sustentada (≥90% em campos críticos).
- [ ] Integração nativa com CRM e fluxo operacional estável.
- [ ] ROI comprovado em clientes piloto (+30% RQ/100).
- [ ] Onboarding com TTV <15 min e retenção D30 saudável.

---

## 7) Resumo executivo (versão para decisão)
A transformação necessária não é adicionar mais features isoladas; é consolidar **confiabilidade operacional + segurança enterprise + prova de ROI**. Com esse plano, a evolução sai de “produto com ótimo potencial” para “plataforma previsível, auditável e orientada a resultado”, que é o que define referência de mercado em SaaS B2B.
