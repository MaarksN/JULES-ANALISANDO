<div align="center">
<img width="1200" height="475" alt="JusArtificial Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# JusArtificial - A Suíte Jurídica Brasileira com IA

Plataforma SaaS para automação jurídica focada no Direito Brasileiro (CF/88, CPC/15), com suporte a Agentes Inteligentes, Colaboração em Tempo Real e Integração com WhatsApp.

## 🚀 Novas Funcionalidades (v2.0)

*   **Busca de Jurisprudência**: Crawler simulado conectado ao backend para encontrar julgados do STJ/TJSP.
*   **Colaboração em Tempo Real**: Edição de documentos estilo Google Docs via WebSocket (Socket.io).
*   **Voice Consultant**: Converse com a IA por voz usando o Gemini Live (WebRTC).
*   **Dashboard de Analytics**: Métricas de produtividade e faturamento do escritório.
*   **Integração WhatsApp**: Receba áudios e mensagens via Twilio (Webhook Mock).
*   **Marketplace**: Loja de agentes e templates jurídicos.

## 🛠️ Tecnologias

*   **Frontend**: React 19, Vite, TailwindCSS, Zustand, TipTap (Editor).
*   **Backend**: Node.js (Express), Socket.io, Firebase Admin.
*   **IA**: Google Gemini (Flash 2.0 / Pro 1.5).
*   **Database**: Firebase Firestore (Produção) / Mock In-Memory (Dev).

## 📦 Instalação e Execução

### Pré-requisitos
*   Node.js v18+
*   Chave de API do Google Gemini (`GEMINI_API_KEY`)

### Passo a Passo

1.  **Instalar dependências** (use `--legacy-peer-deps` devido a conflitos Storybook/Vitest):
    ```bash
    npm install --legacy-peer-deps
    ```

2.  **Configurar Variáveis de Ambiente**:
    Crie um arquivo `.env` na raiz:
    ```env
    API_KEY=sua_chave_gemini_aqui
    GEMINI_API_KEY=sua_chave_gemini_aqui
    VITE_API_URL=http://localhost:3001
    ```

3.  **Iniciar Backend** (API + WebSocket):
    ```bash
    node server.js
    ```
    *Roda na porta 3001.*

4.  **Iniciar Frontend** (em outro terminal):
    ```bash
    npm run dev
    ```
    *Acesse em http://localhost:3000*

## 🧪 Testes

*   **Unitários (Backend/Frontend)**: `npm test` (Vitest)
*   **Verificação E2E (Frontend)**: `npx playwright test`

## 🌍 Deploy

A aplicação está configurada para deploy no **GitHub Pages** (Frontend Estático) via GitHub Actions.
O backend deve ser hospedado em serviços como **Render, Railway ou Fly.io** que suportem WebSockets.

---
**Desenvolvido para Advogados de Elite.**
