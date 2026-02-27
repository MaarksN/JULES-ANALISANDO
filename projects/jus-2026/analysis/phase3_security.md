# FASE 3: Auditoria de Segurança, LGPD e Multitenancy

## Diagnóstico de Segurança

### 1. Autenticação e Controle de Acesso (Crítico)
- **Falha de Enforce:** O arquivo `server.js` declara explicitamente que a autenticação **não é forçada** em todas as rotas (`/api/sessions`, etc.) para manter o modo "demo".
- **Impacto:** Qualquer pessoa pode acessar a API se souber o endpoint.
- **Risco:** Acesso total a dados de usuários.

### 2. IDOR (Insecure Direct Object References)
- **Vulnerabilidade:** Em `backend/sessions.js` e `backend/routes/sessionRoutes.js`, as operações de `getSessions(userId)` e `deleteSession(id)` aceitam parâmetros fornecidos pelo cliente sem validar se o recurso pertence ao usuário autenticado (`req.user.uid`).
- **Cenário:** Um atacante pode listar sessões de outro usuário alterando o `userId` na URL ou deletar sessões aleatórias.

### 3. Multitenancy e Isolamento de Dados
- **Estado Atual:** O sistema usa apenas `userId` como chave de partição. Não há conceito de `firmId` (Escritório) nos schemas auditados (`sessions`, `documents`).
- **Risco Enterprise:** Escritórios com múltiplos advogados não podem colaborar de forma segura ou ter isolamento garantido contra outros escritórios. Se um advogado sair do escritório, seus dados continuam atrelados ao seu `userId` pessoal (se for email pessoal) ou ficam órfãos.

### 4. Gestão de Segredos
- **Front-End Leaks:** O arquivo `gemini.ts` constrói a URL da API baseada em `import.meta.env`. Se chaves de API estivessem hardcoded (não estão, usam env), vazariam.
- **Service Account:** O backend exige `FIREBASE_SERVICE_ACCOUNT` em produção, o que é correto.

## Auditoria LGPD

### 1. Direito ao Esquecimento
- **Implementação:** Existe uma função `wipeClientData` em `services/compliance.ts` (Client-side).
- **Problema:** A exclusão é feita pelo **Cliente** (Frontend) usando o SDK do Firebase. Isso depende de regras de segurança do Firestore (`firestore.rules`) estarem configuradas corretamente. Se não estiverem, um usuário malicioso pode limpar dados de outros.
- **Recomendação:** A exclusão deve ser uma rota de Backend (`/api/compliance/wipe`) autenticada e auditada.

### 2. Logs e Rastreabilidade
- **Audit Logs:** `backend/audit.js` grava logs no Firestore.
- **Dados Sensíveis:** O sistema grava metadados. Se o prompt do usuário for gravado em logs de debug ou em `details`, viola a LGPD se não houver consentimento explícito, pois pode conter dados de terceiros (clientes dos advogados).

## Recomendações Imediatas
1. **Ativar Auth:** Remover o modo "demo" e aplicar `authenticate` em **todas** as rotas `/api/*`.
2. **Corrigir IDOR:** No backend, ignorar o `userId` enviado no body/params e usar sempre `req.user.uid` extraído do token.
3. **Migrar Compliance:** Mover lógica de `wipeClientData` para o backend.
