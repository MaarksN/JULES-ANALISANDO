# Checklist de Execução — Próximos 20 Planos Lógicos

Legenda: 🟢 implementado | 🟡 falta melhorar | 🔴 sem implementação

| Plano | Status | Entrega aplicada |
|---|---|---|
| 01. Router declarativo na API | 🟢 | `worker/src/index.js` migrou para tabela de rotas por método/path. |
| 02. Envelope de erro padrão | 🟢 | `withProblem` em `application/problem+json` adicionado. |
| 03. Auth admin com rotação | 🟢 | `ADMIN_TOKENS` com comparação timing-safe. |
| 04. Rate limit por tenant/cliente | 🟢 | Chave com `X-Tenant-Id` + `X-Api-Key` + IP. |
| 05. Timeout configurável por scraper | 🟢 | `SCRAPER_TIMEOUT_MS` + `options.timeoutMs`. |
| 06. Cache key com versão de schema | 🟢 | chave de cache inclui `schemaVersion`. |
| 07. Ordenação salarial numérica | 🟢 | parsing numérico em sort por `salary`. |
| 08. Dedupe semântico de vagas | 🟢 | fingerprint título+empresa+local+url canônica. |
| 09. Memoização de score por fingerprint | 🟢 | `scoreCache` na etapa de scoring. |
| 10. Validação de sites suportados | 🟢 | valida `includeSites` e `excludeSites`. |
| 11. Sanitização rígida de URL | 🟢 | somente protocolos `http/https`. |
| 12. Centralização de limites/defaults | 🟢 | `LIMITS` no `worker/src/config.js`. |
| 13. Filtro de includeKeywords | 🟢 | `worker/src/filters/index.js` implementa include/exclude. |
| 14. Paginação segura | 🟢 | página clampada ao `totalPages`. |
| 15. CORS com allowlist por ambiente | 🟢 | `CORS_ALLOWED_ORIGINS` suportado. |
| 16. SiteStats com latência por fonte | 🟢 | `durationMs` por scraper no payload final. |
| 17. Favoritos idempotentes por chave | 🟢 | dedupe por fingerprint em favoritos. |
| 18. Favoritos com sanitização e limites | 🟢 | truncagem e normalização de campos sensíveis. |
| 19. Frontend sem innerHTML em resultados | 🟢 | renderização por criação segura de nós DOM. |
| 20. Resiliência de chamadas no frontend | 🟢 | retry com backoff + cache de health/version (TTL 60s). |

## Próximos itens (fase seguinte)
- 🟡 i18n completo de mensagens da API.
- 🟡 JSON Schema compartilhado entre frontend e worker.
- 🔴 Paginação por cursor.
- 🔴 Telemetria OpenTelemetry ponta a ponta.
