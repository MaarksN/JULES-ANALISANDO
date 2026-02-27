# JusArtificial - Technical Architecture & Documentation

## Overview
JusArtificial is a specialized Legal AI SaaS platform designed for Brazilian law. It leverages Large Language Models (LLMs), RAG (Retrieval-Augmented Generation), and specific legal agents to automate petitions, review contracts, and conduct jurisprudential research.

## Architecture

### Frontend (Client-Side)
- **Framework:** React 19 (Vite)
- **Language:** TypeScript
- **State Management:** Zustand (`useAppStore`, `useSessionStore`)
- **Routing:** Component-based View Manager (SPA)
- **UI Components:** TailwindCSS + Lucide Icons + Custom Components
- **Editor:** TipTap (Headless wrapper) with AI Autocomplete features

### Backend (Server-Side)
- **Runtime:** Node.js (Express)
- **Database:** Firebase Firestore (NoSQL)
- **Auth:** Firebase Auth (Google + Email)
- **Storage:** Firebase Storage (for large PDFs)
- **AI Integration:** Google Gemini API (Flash/Pro models) via `@google/genai`

### Security (Zero-Knowledge)
- **Client-Side Encryption:** All sensitive case data (messages, documents) is encrypted **before** leaving the browser using AES-GCM.
- **Key Derivation:** Encryption keys are derived from a Master Password using PBKDF2.
- **Panic Button:** Implemented in `services/compliance.ts` to perform a hard delete of all user data from Firestore.

## AI Pipeline & Agents

The system uses a Multi-Agent architecture orchestrated by `useChatController`.

| Agent ID | Name | Role | Tech Stack |
|---|---|---|---|
| `PETITION` | Petição Inicial | Drafts legal petitions based on facts. | Gemini Pro + RAG |
| `CONTRACT_REVIEW` | Revisor de Contratos | Analyzes risks and clauses. | Gemini Pro + OCR |
| `JURISPRUDENCE` | Pesquisador | Finds relevant case law. | Google Search Tool |
| `DEVIL_ADVOCATE` | Advogado do Diabo | Challenges arguments to strengthen them. | Prompt Engineering (Critic) |
| `EXPERT_WITNESS` | Perito Técnico | Simulates expert analysis. | Gemini Flash |

### RAG Implementation
1. **Ingestion:** PDFs are uploaded via `server.js`.
2. **OCR:** `pdf-parse` (text) or `tesseract.js` (scanned images) extracts content.
3. **Context:** Extracted text is injected into the System Prompt (Context Window).
4. **Caching:** Semantic hits are cached in Firestore to reduce API costs.

## Directory Structure

```
/
├── src/
│   ├── components/       # React UI Components (Sidebar, Modals, etc.)
│   ├── contexts/         # React Contexts (Auth, Form)
│   ├── hooks/            # Custom Hooks (useChatController, useSessions)
│   ├── services/         # API Clients (Gemini, Crawler, Storage)
│   ├── store/            # Zustand State Stores
│   ├── types.ts          # TypeScript Definitions
│   └── App.tsx           # Main Entry Point
├── server.js             # Express Backend (Proxy, OCR, API)
├── firebase.ts           # Firebase Configuration
└── docs/                 # Documentation
```

## Developer Guide

### Prerequisites
- Node.js v18+
- Firebase Project
- Google Gemini API Key

### Setup
1. `npm install`
2. Create `.env` with API keys.
3. `npm run dev` (Frontend)
4. `node server.js` (Backend)

### Testing
- Unit Tests: `npm test` (Vitest)
- Frontend Verification: Playwright scripts in `verification/` (on demand)

## Deployment
- Frontend: Vercel / Netlify (Static Build)
- Backend: Render / Railway / Google Cloud Run (Dockerized)
