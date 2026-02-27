# Planos Lógicos 21–70 — Implementação

## Escopo desta rodada (50 itens)

21. Refatorado `CustomerRepository` para código legível e tipado.
22. Definido `CustomerHealth` tipado para saída de saúde.
23. Definido `CustomerTimelineEvent` tipado para timeline.
24. Removido default implícito de tenant em `CustomerRepository.listWithHealthScore`.
25. Ajustada base de seed para tenant explícito (`tenant-a`).
26. Implementado cálculo de health score em método dedicado.
27. Implementado `listTimeline(tenantId, customerId)`.
28. Implementado `registerNps(tenantId, customerId, score, feedback)`.
29. Mantido soft-delete de customer por tenant.
30. Refatorado `CustomerService` para assinatura tenant-aware.
31. Adicionado `CustomerService.getTimeline`.
32. Adicionado `CustomerService.submitNps`.
33. Refatorado `FinancialRepository` para código legível e tipado.
34. Definido tipo `FinancialSnapshot`.
35. Definido tipo `Invoice`.
36. Removido default implícito de tenant em `FinancialRepository.getSnapshot`.
37. Implementado `listInvoices` com paginação por cursor.
38. Implementado `softDeleteInvoice` com escopo de tenant.
39. Refatorado `FinancialService.getSnapshot(tenantId)`.
40. Criado `domain-schemas.ts` para validações de domínio.
41. Criado `createDealBodySchema`.
42. Criado `updateDealStageBodySchema`.
43. Criado `createContractBodySchema`.
44. Criado `updateContractVersionBodySchema`.
45. Criado `updateContractStatusBodySchema`.
46. Criado `financialReconcileBodySchema`.
47. Criado `customerIdParamsSchema`.
48. Criado `customerNpsBodySchema`.
49. Criada suíte de testes `domain-schemas.test.ts`.
50. Aplicada validação na rota `POST /api/v1/deals`.
51. Aplicada validação na rota `PATCH /api/v1/deals/:id/stage`.
52. Aplicada validação na rota `POST /api/v1/contracts`.
53. Aplicada validação na rota `PATCH /api/v1/contracts/:id/version`.
54. Aplicada validação na rota `PATCH /api/v1/contracts/:id/status`.
55. Aplicada validação na rota `GET /api/v1/contracts/:id`.
56. Aplicada validação na rota `GET /api/v1/contracts/:id/status`.
57. Aplicada validação na rota `GET /api/v1/customers/:id/health`.
58. Aplicada validação na rota `GET /api/v1/customers/:id/timeline`.
59. Aplicada validação na rota `POST /api/v1/customers/:id/nps`.
60. Aplicada validação na rota `POST /api/v1/financial/reconcile`.
61. Tornada rota `GET /api/v1/customers` tenant-aware.
62. Tornada rota `GET /api/v1/financial/summary` tenant-aware.
63. Tornada rota `GET /api/v1/financial/cashflow` tenant-aware.
64. Substituída rota estática `GET /customers/:id/timeline` por fluxo real.
65. Substituída rota estática `POST /customers/:id/nps` por fluxo real.
66. Adicionado log estruturado `customer.timeline.fetched`.
67. Adicionado log estruturado `customer.nps.submitted`.
68. Padronizadas respostas de webhook para contrato `schemaVersion: v1`.
69. Adicionado log estruturado `webhook.received` por provider.
70. Atualizados testes de repositórios `customer` e `financial` para novo contrato tenant-aware.

## Resultado

- Fronteiras críticas de deals/contracts/customers/financial agora estão com validação explícita.
- Endpoints de customer timeline e NPS deixaram de ser placeholders.
- Snapshot financeiro e customer health passam a respeitar tenant explicitamente.
