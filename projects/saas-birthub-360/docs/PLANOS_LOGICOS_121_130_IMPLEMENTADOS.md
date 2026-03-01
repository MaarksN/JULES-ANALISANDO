# Execução dos Próximos 10 Planos Lógicos (121–130)

1. Padronização do contrato de erro de autenticação para ausência de token com `code` e `message`.
2. Inclusão de `WWW-Authenticate: Bearer` em respostas 401 para interoperabilidade OAuth2.
3. Padronização do contrato de erro de autenticação para token inválido/expirado.
4. Preservação de status HTTP semântico (`401` para ausência e `403` para token inválido).
5. Enriquecimento do log de domínio com `traceId` extraído de correlação da requisição.
6. Enriquecimento do log de domínio com `tenantId` em fallback seguro (`header` → payload → `n/a`).
7. Aplicação do novo contrato de log para eventos críticos de negócio (lead/deal/customer/financial).
8. Aplicação do novo contrato de log para todos os webhooks críticos (Stripe, DocuSign, Clicksign, Focus NFe e Meta Ads).
9. Cobertura de teste para cenário sem token garantindo contrato de erro canônico.
10. Cobertura de teste para token inválido e redirecionamento legado `/api/* -> /api/v1/*` com status `308`.
