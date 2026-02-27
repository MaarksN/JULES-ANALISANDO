# 🔍 Buscador de Vagas de Emprego Automático

> Busque vagas em múltiplas fontes em uma única consulta, com Worker serverless + frontend estático + extensão Chrome.

## 🚀 Como usar em 3 passos
1. Abra `online-app/index.html` no navegador.
2. Informe a URL do seu Worker no campo “URL do Worker”.
3. Busque por cargo/tecnologia e favorite vagas relevantes.

## ⚙️ Deploy do seu próprio Worker (opcional)
Consulte [`DEPLOY.md`](./DEPLOY.md).

### 1) Plataforma e Observabilidade
1. Versionamento `v5.0.0`
2. `schemaVersion` no payload
3. `requestId` por requisição
4. Header `x-request-id`
5. Header `x-worker-version`
6. Header `x-rate-limit-limit`
7. Header `x-rate-limit-remaining`
8. Métrica `requests`
9. Métrica `searchRequests`
10. Métrica `cacheHits`
11. Métrica `cacheMisses`
12. Métrica `rateLimited`
13. Métrica `invalidPayloads`
14. Métrica `upstreamErrors`
15. Métrica `siteCooldownSkips`
16. Métrica `totalResultsReturned`
17. `GET /health`
18. `GET /version`
19. `GET /metrics`
20. `POST /metrics/reset`
21. `GET /config`
22. `GET /sites`
23. `GET /sample-request`
24. `POST /normalize`
25. `POST /validate`

### 2) Segurança, Limites e Resiliência
26. Guard de `Content-Type`
27. Rate-limit por cliente
28. Janela de rate-limit configurada
29. Limpeza periódica da tabela de rate-limit
30. Cache TTL
31. Limpeza periódica de cache
32. Chave de cache robusta (versão + filtros + sites)
33. Timeout de fetch externo
34. Retry de fetch externo
35. Concurrency control por plataforma
36. Cooldown de site com falhas repetidas
37. Limpeza periódica da tabela de cooldown
38. Warnings estruturados de falhas por site
39. Endpoint de validação de payload
40. Limite de tamanho de query
41. Limite de número de keywords/filtros
42. Limite de `pageSize`
43. Limite de `keywordLimit`
44. Sanitização de snippets/títulos
45. Remoção de tracking UTM em URLs
46. Dedupe determinístico
47. Ordenação determinística com desempate
48. Mensagens de erro explícitas por regra
49. Diagnóstico de contagens pipeline
50. Fallback seguro sem quebrar resposta global

### 3) Busca, Relevância e Filtros
51. Suporte a múltiplas localizações (`locations`)
52. Include sites (csv)
53. Exclude sites (csv)
54. Include keywords (csv)
55. Exclude keywords (csv)
56. Filtro `remoteOnly`
57. Filtro `seniority`
58. Filtro `contractType`
59. Filtro `minScore`
60. Filtro `language`
61. Ordenação `score`
62. Ordenação `title`
63. Ordenação `site`
64. Ordenação `recency`
65. Direção `asc/desc`
66. Score breakdown: keyword matches
67. Score breakdown: title matches
68. Score breakdown: location boost
69. Score breakdown: job intent boost
70. Score breakdown: remote boost
71. Score breakdown: recency boost
72. Score breakdown: salary boost
73. Score breakdown: seniority boost
74. Score breakdown: contract boost
75. Score breakdown: include boost
76. Score breakdown: exclude penalty
77. `recencyHint` para sort heurístico
78. Result summary por plataforma
79. Top títulos em `resultSummary`
80. Estatísticas por site em `siteStats`
81. Paginação server-side
82. Metadados `startIndex/endIndex`
83. `totalPages/hasNext/hasPrev`
84. `avgScore` no diagnóstico
85. `activeSites` no diagnóstico

### 4) UX do Web App
86. Campo de `keywordLimit`
87. Campo de `language`
88. Campo de `locations` múltiplas
89. Health check completo (`/health,/metrics,/config,/sites`)
90. Exibição de `summary` e `warnings`
91. Botão Abrir Top 5
92. Botão salvar favoritos (Top 3)
93. Lista de favoritos locais
94. Exportação JSON
95. Exportação CSV
96. Copiar JSON
97. Exportar configurações
98. Importar configurações
99. Limpar configurações/favoritos
100. Auto refresh opcional (60s)


## Próximos 10 planos lógicos — implementados nesta rodada

101. Validação da URL da API no frontend (`http/https` + sufixo `/search`)
102. Timeout de requisição de busca no frontend (20s)
103. Cancelamento da requisição anterior ao iniciar nova busca
104. Retry automático de busca para erros transitórios (`429`/`5xx`)
105. Estado global de carregamento com bloqueio de controles durante busca
106. Métrica de tempo da UI (`ui:...ms`) no status final
107. Seção dedicada para warnings retornados pela API
108. Seção dedicada para diagnósticos (`activeSites`, pipeline, `avgScore`)
109. Abertura do Top 5 apenas para URLs válidas (`http/https`)
110. Migração de persistência para `jobfinder-online-settings-v5`


## Próximos 10 planos lógicos — implementados nesta rodada

111. Auto-save de configurações com debounce (sem precisar clicar em buscar)
112. Botão para cancelar busca em andamento
113. Indicador de tentativas no status (retry visível)
114. Persistência do resumo da última busca no navegador
115. Importação de configuração via arquivo `.json`
116. Migração de persistência para `jobfinder-online-settings-v6`
117. Atalho de teclado `Ctrl+Enter`/`Cmd+Enter` para buscar
118. Botão para copiar link compartilhável com parâmetros principais
119. Filtro local por título nos resultados da página atual
120. Remoção de dependência de `AbortSignal.any` para maior compatibilidade

## Endpoints
- `GET /health`
- `GET /version`
- `GET /config`
- `GET /sites`
- `GET /sample-request`
- `GET /metrics`
- `POST /metrics/reset` (Bearer admin)
- `POST /search`
- `POST /normalize`
- `POST /validate`
- `GET /favorites`
- `POST /favorites`
- `DELETE /favorites`
- `DELETE /favorites/:id`

### Payload moderno (`POST /search`)
```json
{
  "query": "desenvolvedor react",
  "locations": ["São Paulo", "Remoto"],
  "remoteOnly": false,
  "page": 1,
  "pageSize": 20,
  "sortBy": "score",
  "sortDir": "desc"
}
```

### Payload legado compatível (`POST /search`)
```json
{
  "resumeText": "Experiência com React, Node e TypeScript...",
  "location": "São Paulo, SP",
  "extraQuery": "frontend pleno",
  "page": 1,
  "pageSize": 20
}
```

### Exemplo de resposta resumida
```json
{
  "schemaVersion": "5.0.0",
  "query": "desenvolvedor react",
  "totalResults": 47,
  "filteredResults": 23,
  "page": 1,
  "totalPages": 2,
  "cached": false,
  "warnings": [],
  "results": []
}
```

## 🧩 Extensão Chrome
- Popup com busca rápida.
- Opções para configurar a URL do Worker com validação de saúde.
- Rotina em background com `chrome.alarms` para verificar novas vagas.

## 🛠️ Desenvolvimento local
```bash
cd worker
npx wrangler dev
```

## 📋 Variáveis de ambiente
Veja `worker/.env.example`.

## 🤝 Contribuindo
1. Faça fork.
2. Crie branch.
3. Rode checks locais.
4. Abra PR descrevendo o impacto.
