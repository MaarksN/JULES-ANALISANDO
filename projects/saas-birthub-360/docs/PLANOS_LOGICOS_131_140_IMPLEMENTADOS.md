# Execução dos Próximos 10 Planos Lógicos (131–140)

1. Implementação de middleware dedicado para binding de tenant entre token JWT e header `x-tenant-id`.
2. Normalização defensiva de tenant context (trim + empty-safe) antes da comparação.
3. Bloqueio explícito de mismatch de contexto multi-tenant com erro `TENANT_CONTEXT_MISMATCH` e status `403`.
4. Inclusão de `details` estruturado no erro de mismatch (`tokenTenantId` e `headerTenantId`) para auditoria.
5. Preservação de compatibilidade para tokens que usam `organizationId` como claim de tenant.
6. Aplicação centralizada do binding em toda superfície `/api/v1` no `server.ts`.
7. Garantia de ordem de segurança: autenticação → tenant binding → rate limit por tenant → rotas.
8. Cobertura de integração para cenário negativo de mismatch (header divergente do token).
9. Cobertura de integração para cenário positivo (header igual ao tenant do token).
10. Cobertura de integração para cenário de fallback por `organizationId` com binding válido.
