# Execução dos Próximos 10 Planos Lógicos (141–150)

1. Refatoração do resolvedor de tenant para contrato explícito `TenantContext` (`tenantId` + `source`).
2. Preservação de compatibilidade por meio de `resolveTenantId` baseado em `resolveTenantContext`.
3. Criação de middleware de observabilidade de tenant para enriquecer `res.locals` com contexto resolvido.
4. Exposição de headers de diagnóstico `x-tenant-id` e `x-tenant-source` em respostas da API v1.
5. Encadeamento do middleware de observabilidade após tenant-binding e antes de rate limit por tenant.
6. Inclusão de `traceId` no contrato de erro para falhas tipadas (`HttpError`) no gateway.
7. Inclusão de `traceId` também no contrato de erro para falhas internas (`INTERNAL_ERROR`).
8. Cobertura de integração para tenant resolvido via token com validação dos headers de observabilidade.
9. Cobertura de integração para tenant resolvido via header quando o token não carrega claim de tenant.
10. Cobertura de integração para erro `TENANT_CONTEXT_REQUIRED` com propagação de `traceId` no payload.
