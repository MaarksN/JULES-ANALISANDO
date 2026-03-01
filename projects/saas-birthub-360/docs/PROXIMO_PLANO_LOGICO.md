# Próximo Plano Lógico — API Gateway + Orquestração (curto prazo)

> Objetivo: transformar o gateway de “scaffold funcional” para “operação segura e auditável”, com execução orientada a risco e valor.

## 1) Prioridade P0 (48h) — Fechar gaps de segurança e fronteira

1. **Tenant em todas as fronteiras de entrada**
   - Remover handlers que ainda aceitam payload sem validação de tenant.
   - Unificar auditoria para sempre registrar `tenantId`, `actor`, `traceId`, `action`.
2. **Validação de payload por rota crítica**
   - Aplicar Zod em `deals`, `contracts`, `financial/reconcile` e webhooks.
   - Padronizar erros em contrato `{ code, message, details }`.
3. **Webhooks com assinatura + idempotência obrigatória**
   - Garantir comportamento idempotente em Stripe/DocuSign/Clicksign/Focus.
   - Cobrir replay attack em testes.

## 2) Prioridade P1 (Sprint atual) — Profundidade de implementação

1. **Eliminar endpoints `ok({})` no gateway**
   - Substituir por service/repository real nos endpoints:
     - `POST /leads/:id/enrich`
     - `POST /leads/:id/outreach`
     - `POST /deals/:id/proposal`
     - `GET /deals/:id/forecast`
2. **Completar contrato de domínio em deals/contracts**
   - Transições de stage com guardrails e auditoria de mudança.
   - Pré-condições explícitas para `WON` (contrato assinado no mesmo tenant + validações financeiras).
3. **Observabilidade operacional**
   - Log estruturado com `trace_id` em todas as mutações.
   - Métricas por endpoint crítico (latência, taxa de erro, taxa de bloqueio por autorização).

## 3) Prioridade P2 (próxima sprint) — Confiabilidade e governança

1. **Testes de contrato OpenAPI**
   - Garantir que payload/response real não desviam da especificação.
2. **Teste de isolamento multi-tenant no CI**
   - Cenário de pentest automatizado (token tenant A tentando acessar recurso tenant B).
3. **Checklist executivo rastreável**
   - Atualizar `EXECUTION_CHECKLIST.md` por item com:
     - status atual,
     - risco,
     - responsável,
     - data alvo.

## Sequência recomendada de execução

1. Fechar P0 completo.
2. Converter endpoints `ok({})` (P1).
3. Travar CI com contrato + isolamento (P2).
4. Só então avançar para expansão de features do dashboard.

## Critério de pronto para este plano

- Nenhuma rota crítica sem validação de entrada.
- Nenhuma mutação sem log estruturado com contexto de tenant.
- Nenhum endpoint crítico retornando payload estático.
- Testes cobrindo autorização, idempotência e isolamento de tenant.
