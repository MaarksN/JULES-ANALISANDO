# Planos Lógicos 01–20 — Implementação

## Escopo executado agora

1. Criado schema de params para `dealId`.
2. Criado schema de body para `lead enrich`.
3. Criado schema de body para `lead outreach`.
4. Criado schema de body para `deal proposal`.
5. Adicionados testes unitários dos novos schemas.
6. Aplicada validação de schema na rota `POST /leads`.
7. Aplicada validação de schema na rota `GET /leads`.
8. Aplicada validação de schema na rota `GET /leads/:id`.
9. Aplicada validação de schema na rota `PATCH /leads/:id/status`.
10. Aplicada validação de schema na rota `DELETE /leads/:id`.
11. Substituído endpoint estático `POST /leads/:id/enrich` por execução real (queued).
12. Substituído endpoint estático `POST /leads/:id/outreach` por execução real (queued).
13. Substituído endpoint estático `POST /deals/:id/proposal` por execução real (generated).
14. Substituído endpoint estático `GET /deals/:id/forecast` por execução real (forecast v1).
15. Adicionado log estruturado de evento de domínio para enrich.
16. Adicionado log estruturado de evento de domínio para outreach.
17. Adicionado log estruturado de evento de domínio para proposal.
18. Adicionado log estruturado de evento de domínio para forecast.
19. Adicionado teste de repositório para geração de proposal+forecast.
20. Adicionado teste de integração para o fluxo completo enrich/outreach/proposal/forecast.

## Resultado

- Nenhum dos 4 endpoints críticos acima retorna mais `ok({})`.
- Rotas críticas agora possuem validação de entrada antes da execução de domínio.
