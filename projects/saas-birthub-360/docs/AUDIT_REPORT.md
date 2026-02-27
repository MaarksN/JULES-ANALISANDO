# AUDIT REPORT — CAI OS Global Transformation

Data: 2026-02-23
Escopo: comandos mandatórios STEP 0 executados no monorepo.

## Resumo executivo

| Bloco | Descrição | Ocorrências |
|---|---|---:|
| 1 | Agentes stub (`processed`/`pass`) | 11 |
| 2 | Contrato BaseAgent (`output`/`data`) | 23 |
| 3 | Arquivos de domínio presentes (subset) | 10 |
| 4 | Rate limit local/in-memory | 8 |
| 5 | HTTP síncrono/direto no orchestrator | 9 |
| 6 | Rotas ausentes no gateway (match vazio) | 0 |
| 7 | Pacotes críticos ausentes | 6 ausentes |
| 8 | Modelos SaaS Prisma | 1 presente |
| 9 | Dashboard hardcoded | 5 |
| 10 | Testes em queue | 0 |
| 11 | Import Gemini deprecado | 2 |
| 12 | `console.log` em produção | 16 |
| 13 | Risco XSS (`dangerouslySetInnerHTML`) | 2 |
| 14 | Chaves expostas no client | 3 |

## Evidências por bloco

### BLOCO 1 — Agentes Stub
| Arquivo | Linha | Tipo do problema | Bloco correspondente |
|---|---:|---|---|
| agents/pos-venda/agent.py | 20 | Retorno stub com `status: processed` | BLOCO 1 |
| agents/financeiro/agent.py | 20 | Retorno stub com `status: processed` | BLOCO 1 |
| agents/juridico/agent.py | 20 | Retorno stub com `status: processed` | BLOCO 1 |
| agents/marketing/agent.py | 20 | Retorno stub com `status: processed` | BLOCO 1 |
| agents/analista/agent.py | 20 | Retorno stub com `status: processed` | BLOCO 1 |
| agents/shared/tool_runtime.py | 36 | Uso de `pass` | BLOCO 1 |
| agents/pos-venda/agent.py | 6 | Uso de `pass` | BLOCO 1 |
| agents/financeiro/agent.py | 6 | Uso de `pass` | BLOCO 1 |
| agents/juridico/agent.py | 6 | Uso de `pass` | BLOCO 1 |
| agents/marketing/agent.py | 6 | Uso de `pass` | BLOCO 1 |
| agents/analista/agent.py | 6 | Uso de `pass` | BLOCO 1 |

### BLOCO 2 — Contrato BaseAgent quebrado
| Arquivo | Linha | Tipo do problema | Bloco correspondente |
|---|---:|---|---|
| agents/shared/base_agent.py | 72 | `AgentResult` ainda define campo `output` | BLOCO 2 |
| agents/shared/tests/test_base_agent.py | 34 | Consumidor usa `result["output"]` | BLOCO 2 |
| agents/ae/tests/test_ae_agent.py | 29,56,57 | Consumidor usa `result["output"]` | BLOCO 2 |
| agents/ldr/tests/test_ldr_agent.py | 33,34 | Consumidor usa `result["output"]` | BLOCO 2 |
| agents/ldr/tests/test_agent.py | 10 | Consumidor usa `result["output"]` | BLOCO 2 |
| agents/pos-venda/tests/test_agent.py | 14 | Consumidor usa `result["output"]` | BLOCO 2 |
| agents/financeiro/tests/test_agent.py | 8 | Consumidor usa `result["output"]` | BLOCO 2 |
| agents/juridico/tests/test_agent.py | 8 | Consumidor usa `result["output"]` | BLOCO 2 |
| agents/marketing/tests/test_agent.py | 8 | Consumidor usa `result["output"]` | BLOCO 2 |
| agents/sdr/tests/test_sdr_agent.py | 30,59 | Consumidor usa `result["output"]` | BLOCO 2 |
| agents/analista/tests/test_agent.py | 8 | Consumidor usa `result["output"]` | BLOCO 2 |

### BLOCO 3 — Arquivos de domínio ausentes
Comando retornou apenas os arquivos abaixo (indício de ausência em outros agentes):
`agents/ae/{tasks.py,models.py,schemas.sql,cadence_engine.py,crm_sync.py}` e `agents/sdr/{tasks.py,models.py,schemas.sql,cadence_engine.py,crm_sync.py}`.

### BLOCO 4 — Rate limit local
| Arquivo | Linha | Tipo do problema | Bloco correspondente |
|---|---:|---|---|
| agents/shared/base_agent.py | 93 | `_rate_limits` em memória | BLOCO 4 |
| agents/shared/base_agent.py | 315-325 | Fallback local fixed-window | BLOCO 4 |
| agents/shared/tests/test_base_agent.py | 46 | Teste depende de limiter local | BLOCO 4 |

### BLOCO 5 — HTTP direto no orchestrator
Ocorrências em `apps/agent-orchestrator/orchestrator/flows.py` com `httpx` e `_post_with_retry` (linhas 4,10,20,26,30,50,70,83), além de dependência em `requirements.txt:4`.

### BLOCO 6 — Rotas ausentes no gateway
Nenhum arquivo encontrado para o padrão solicitado (`websocket`, `proxy`, `routes/auth`, `routes/agents`, `routes/campaigns`, `routes/reports`).

### BLOCO 7 — Pacotes críticos ausentes
`packages/` contém: `db, integrations, llm-client, queue, shared, shared-types, utils`.
Ausentes: `auth, billing, security, agent-runtime, voice, comms`.

### BLOCO 8 — Modelos SaaS no Prisma
Apenas `model Organization` encontrado em `packages/db/prisma/schema.prisma:12`.
Ausentes no grep: `Tenant, Subscription, UsageRecord, RefreshToken, Role, Permission, Workflow, AgentTask`.

### BLOCO 9 — Dashboard hardcoded
Importações de `dashboard-data` em:
- `apps/dashboard/components/health-score-board.tsx:4`
- `apps/dashboard/components/pipeline-board.tsx:4`
- `apps/dashboard/components/contracts-board.tsx:4`
- `apps/dashboard/components/analytics-board.tsx:4`
- `apps/dashboard/app/page.tsx:1`

### BLOCO 10 — Testes ausentes em queue
Nenhum diretório `tests` / `__tests__` encontrado sob `packages/queue`.

### BLOCO 11 — Import Gemini deprecado
| Arquivo | Linha | Tipo do problema | Bloco correspondente |
|---|---:|---|---|
| agents/shared/base_agent.py | 14 | `from google import genai` | BLOCO 11 |
| agents/shared/tests/conftest.py | 28 | `from google import genai` | BLOCO 11 |

### BLOCO 12 — `console.log` em produção
16 ocorrências em `apps/` e `packages/` (api-gateway, webhook-receiver, orchestrator worker, scripts de queue/llm/db).

### BLOCO 13 — XSS risco
`dangerouslySetInnerHTML` em:
- `apps/dashboard/components/sales-os/ToolView.tsx:198`
- `apps/dashboard/components/sales-os/ChatMentor.tsx:126`

Verificação manual rápida: não foi identificado uso de DOMPurify nos mesmos arquivos -> risco potencial.

### BLOCO 14 — API keys expostas
| Arquivo | Linha | Tipo do problema | Bloco correspondente |
|---|---:|---|---|
| apps/dashboard/.env.local.example | 1 | `NEXT_PUBLIC_GEMINI_API_KEY` exposta ao cliente | BLOCO 14 |
| apps/dashboard/app/api/sales-os/chat/route.ts | 15 | fallback para `NEXT_PUBLIC_GEMINI_API_KEY` | BLOCO 14 |
| apps/dashboard/lib/sales-os/services/gemini.ts | 3 | uso de `NEXT_PUBLIC_GEMINI_API_KEY` no client | BLOCO 14 |
