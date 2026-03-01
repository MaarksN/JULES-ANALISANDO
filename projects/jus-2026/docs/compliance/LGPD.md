# Relatório de Conformidade LGPD - JusArtificial

## 1. Princípios de Tratamento
O JusArtificial atua como **Operador** de dados, processando informações em nome dos **Controladores** (Escritórios de Advocacia).

## 2. Direitos do Titular (Art. 18)
- **Confirmação e Acesso:** Disponível via API `/api/compliance/export`.
- **Correção:** Editável diretamente pelo advogado responsável.
- **Anonimização/Bloqueio:** Kill switch implementado em `complianceMiddleware.js`.
- **Eliminação:** Função `wipeClientData` (Fase 3) realiza deleção física e lógica (soft delete para auditoria).

## 3. Segurança (Art. 46)
- **Criptografia:** AES-256-GCM para dados em repouso (`encryption.js`).
- **Transferência:** TLS 1.3 obrigatório.
- **Controle de Acesso:** RBAC estrito via Firebase Auth + Claims (`firmId`).

## 4. Retenção de Dados
- Logs de auditoria: 5 anos (Prescrição civil/administrativa).
- Documentos do cliente: Definido pelo contrato do escritório (default 10 anos).
