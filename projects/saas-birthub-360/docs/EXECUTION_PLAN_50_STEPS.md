# BirtHub 360 - 50-Step Execution Plan

This document outlines the logical steps to complete the BirtHub 360 project, organized by development phases.

## 📦 Phase 1: Infrastructure & Initial Setup (Steps 1-5)

1.  **Configure Environment Variables (.env):** Define `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `JWT_SECRET` based on the created Supabase project.
2.  **Configure Google Credentials:** Add `GOOGLE_APPLICATION_CREDENTIALS` and OAuth credentials (Calendar/Gmail) to `.env`.
3.  **Configure Storage:** Define `GCS_BUCKET` in `.env` for file storage (contracts, logs).
4.  **Install Dependencies:** Run `pnpm install` at the root to ensure all monorepo dependencies are up-to-date.
5.  **Start Docker Infrastructure:** Run `docker-compose up -d` to start PostgreSQL, Redis, and Elasticsearch.

## 🗄️ Phase 2: Database & Modeling (Steps 6-10)

6.  **Generate Prisma Client:** Run `pnpm db:generate` to create database TypeScript types.
7.  **Run Migrations:** Run `pnpm db:push` (or `migrate deploy`) to create tables in the local PostgreSQL.
8.  **Seed Database:** Run `pnpm db:seed` to create dummy users, organizations, and leads for testing.
9.  **Verify Redis Connection:** Test connection with Redis via `redis-cli` or container logs to ensure the queue will work.
10. **Verify Elasticsearch Connection:** Validate that ES is accessible for log indexing and vector search.

## 🧩 Phase 3: Shared Packages (Steps 11-15)

11. **Build Shared Types:** Run `pnpm build --filter packages/shared-types` to ensure interfaces are available.
12. **Test Utils:** Run unit tests for `packages/utils` (logger, helpers).
13. **Validate LLM Client:** Test `packages/llm-client` with a simple call to Gemini Pro (using real key or mock).
14. **Validate Queue Configuration:** Test `packages/queue` connection with local Redis.
15. **Implement Integration Wrappers:** Finalize basic wrappers for Google Calendar and Slack in `packages/integrations`.

## 🤖 Phase 4: Agents - Feature Implementation (Steps 16-25)

16. **SDR Agent - Google Calendar:** Implement `schedule_meeting` tool integrating with real/mock Google Calendar API.
17. **SDR Agent - Tests:** Create unit tests for the SDR scheduling flow.
18. **AE Agent - Transcription:** Implement stub/mock for `transcribe_and_sync_call` (simulating audio processing).
19. **Marketing Agent - AB Test:** Implement logic for `run_ab_test_analysis` connected to lead data.
20. **Marketing Agent - Tests:** Add unit tests for copy generation and analysis.
21. **Post-Sales Agent - Deflect:** Implement logic for `deflect_support_ticket` querying a (simulated) knowledge base.
22. **Post-Sales Agent - Tests:** Add tests for health score calculation and churn risk.
23. **Finance Agent - NFe:** Implement mock integration with Focus NFe in `emit_nfe` tool.
24. **Finance Agent - Dunning:** Implement dunning rule logic (`run_dunning_step`).
25. **Legal Agent - Contracts:** Finalize PDF generation for contracts in `generate_contract` tool.

## 🔄 Phase 5: Orchestrator & Queues (Steps 26-30)

26. **SDR Worker:** Configure and start BullMQ worker to process SDR Agent tasks.
27. **AE Worker:** Configure and start BullMQ worker to process AE Agent tasks.
28. **Other Agent Workers:** Configure workers for Marketing, Finance, and Post-Sales.
29. **Lead Lifecycle Workflow:** Implement/Validate `LEAD_LIFECYCLE` flow in LangGraph/Orchestrator.
30. **Schedule Crons:** Configure cron jobs for weekly reports (`BOARD_REPORT`) and health checks.

## 📡 Phase 6: API Gateway (Steps 31-35)

31. **Authentication Middleware:** Implement Supabase JWT validation in API Gateway.
32. **Lead Ingestion Route:** Connect `POST /api/leads` to trigger the enrichment workflow (LDR).
33. **External Webhooks:** Configure endpoints to receive webhooks (e.g., Stripe, external CRM).
34. **Rate Limiting:** Refine rate limit configuration to protect public routes.
35. **API Documentation:** Generate and validate updated Swagger/OpenAPI with new routes.

## 🖥️ Phase 7: Dashboard (Frontend) (Steps 36-45)

36. **Setup Next.js:** Initialize/Verify Next.js 15 project structure in `apps/dashboard`.
37. **Auth Integration:** Configure authentication provider (Supabase) in frontend.
38. **UI Components:** Install and configure component library (e.g., shadcn/ui).
39. **Pipeline Screen:** Create Kanban view for Deals and Leads.
40. **Metrics Screen:** Implement charts for MRR, Churn, and CAC (using Recharts or similar).
41. **Logs Screen:** Create interface to view agent execution logs (`AgentLog`).
42. **Chat Interface:** Implement chat component for direct interaction with agents.
43. **API Connection:** Configure HTTP client (Axios/Fetch) to consume API Gateway.
44. **Realtime:** Implement realtime updates (WebSockets/Supabase Realtime) for notifications.
45. **E2E Tests:** Create E2E test (Playwright) for login flow and dashboard viewing.

## 🚀 Phase 8: Deploy & Finalization (Steps 46-50)

46. **Apps Dockerfiles:** Create/Review Dockerfiles for Gateway, Orchestrator, and Dashboard.
47. **Prod Docker Compose:** Update `docker-compose.yml` to include all stack services.
48. **CI/CD Pipeline:** Configure GitHub Actions for automatic build and tests.
49. **Load Testing:** Run simple load test on queues to validate stability.
50. **Final Validation:** Execute complete flow (Lead -> Deal -> Contract -> Invoice) locally.
