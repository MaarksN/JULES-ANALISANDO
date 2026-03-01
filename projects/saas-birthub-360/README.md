# BirtHub 360 - Revenue Operations Ecosystem

Monorepo contendo o backend completo do ecossistema de RevOps operado por 8 Agentes de IA especializados.

## 🏗️ Estrutura do Projeto

O projeto é organizado como um monorepo usando `pnpm` e `turborepo`.

- `apps/`: Aplicações principais (API Gateway, Orchestrator, Dashboard, etc.)
    - `dashboard`: Next.js com Sales OS (LDR/SDR/BDR/Closer) em `/sales`.
- `agents/`: Agentes de IA especializados (Marketing, SDR, AE, etc.)
- `packages/`: Bibliotecas compartilhadas e utilitários
- `infra/`: Configurações de infraestrutura (Docker, K8s, Terraform)

## 🚀 Como Iniciar

1. **Pré-requisitos**:
   - Docker e Docker Compose
   - Node.js 20+
   - pnpm 9+
   - Python 3.12+ (para os agentes)

2. **Configuração**:

   ```bash
   # Clone o repositório
   git clone <repo-url>
   cd birthub-360

   # Configure as variáveis de ambiente
   cp .env.example .env
   # Edite o arquivo .env conforme necessário
   ```

3. **Instalação**:

   ```bash
   pnpm install
   ```

4. **Executar Infraestrutura Base**:

   ```bash
   docker-compose up -d
   ```

   Isso iniciará o PostgreSQL, Redis e Elasticsearch.

5. **Desenvolvimento**:
   ```bash
   pnpm dev
   ```

## 🧰 Operação Local Completa

Para subir stack completa de desenvolvimento (apps + observabilidade):

```bash
docker compose -f docker-compose.dev.yml up -d
```

Isso inicia API Gateway, Dashboard, Prometheus e Grafana além da infraestrutura base.


## ✅ Qualidade (FASE 9)

Comandos de validação local:

```bash
# Unit + integração de agentes (Python)
pnpm test:agents

# E2E rotas críticas
pnpm test:e2e

# Carga BullMQ (requer Redis local)
pnpm test:load
```

A pipeline de CI (`.github/workflows/ci.yml`) executa esses mesmos checks, incluindo cobertura mínima de 80% no conjunto crítico de agentes via `pytest-cov`. As dependências de teste Python ficam centralizadas em `requirements-test.txt`.

## 📈 Deploy e Monitoramento (FASE 10)

- **Dev stack completa:** `docker compose -f docker-compose.dev.yml up -d`
- **Cloud Run (prod):** manifesto base em `infra/cloudrun/service.yaml`
- **Métricas e dashboards:** `infra/monitoring/prometheus.yml` e `infra/monitoring/grafana-dashboard.json`
- **Alertas:** `infra/monitoring/alert.rules.yml`
- **Cloud Logging:** middleware estruturado no API Gateway (`apps/api-gateway/src/middleware/cloud-logging.ts`)

## 📝 Status do Projeto

Consulte o arquivo `EXECUTION_CHECKLIST.md` para acompanhar o progresso detalhado da implementação.

## 📄 Licença

Proprietário. Todos os direitos reservados.
