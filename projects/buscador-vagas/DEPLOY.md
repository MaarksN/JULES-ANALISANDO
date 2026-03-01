# Deploy do Buscador de Vagas (Cloudflare Worker)

1. Criar conta Cloudflare (plano gratuito).
2. Instalar Wrangler:
```bash
npm i -g wrangler
```
3. Login:
```bash
wrangler login
```
4. Criar namespaces KV:
```bash
wrangler kv namespace create KV_CACHE
wrangler kv namespace create KV_METRICS
wrangler kv namespace create KV_FAVORITES
```
5. Preencher os IDs no `worker/wrangler.toml`.
6. Configurar segredo admin:
```bash
cd worker
wrangler secret put ADMIN_TOKEN
```
7. Deploy:
```bash
wrangler deploy
```
8. Configurar URL no `online-app` e extensão.
9. Testar saúde:
```bash
curl https://SEU_WORKER.workers.dev/health
```
