# Relatório de Due Diligence Técnica - JusArtificial

## 1. Visão Geral da Arquitetura
Plataforma SaaS B2B Enterprise hospedada em Nuvem Híbrida (Google Cloud + Firebase).
Arquitetura de microsserviços lógicos em Monorepo (`apps/api`, `apps/web`).

## 2. Propriedade Intelectual (IP)
- **Código Fonte:** 100% proprietário.
- **Modelos de IA:** Uso de modelos fundacionais (Gemini) via API paga (Enterprise license), sem treinamento com dados de clientes (Zero Data Retention Policy).
- **Embeddings:** Vetores gerados são propriedade do cliente, armazenados de forma segregada.

## 3. Mapa de Riscos e Mitigações (Fase 12)
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Vazamento de Dados (Cross-Tenant)** | Baixa | Crítico | Isolamento lógico por `firmId` em todas as queries. Testes de IDOR automatizados. |
| **Alucinação Jurídica** | Média | Alto | RAG Server-Side obrigatório. Prompt com disclaimer fixo. Citação de fontes obrigatória. |
| **Indisponibilidade** | Baixa | Médio | Infraestrutura Kubernetes auto-escalável. Banco de dados distribuído (Firestore). |

## 4. Governança de Código
- CI/CD: Pipeline automatizado com testes unitários (Vitest) e verificação de segurança.
- Code Review: Obrigatório para merge em `main`.
- Dependências: Monitoramento via `npm audit`.

## 5. Escalabilidade
- Backend: Stateless Node.js (Horizontal Scaling).
- Database: Firestore (Auto-scaling).
- Processamento: Workers assíncronos para OCR/IA.
