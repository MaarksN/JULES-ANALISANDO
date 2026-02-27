# Extraction and Run Report - Sales Prospector Catarina IA

## Extraction
- Source: `SALES PROSPECTOR CATARINA IA.zip`
- Destination: `/projects/sales-prospector-catarina-ia/`
- Structure: ZIP contained `Sales-Prospector-Catarina-Ia-unify-platforms-catarina-hub-*`. Flattened to project root.

## Analysis
- Stack:
  - Monorepo structure (likely Nx or Lerna).
  - `apps/api`: NestJS application (`package.json`, `nest-cli.json`, `tsconfig.json`).
  - `apps/web`: Frontend application (likely React or Next.js).
  - `apps/worker`: Worker service for background jobs.
  - `libs/shared`: Shared library for code reuse.

## Execution
*Simulated execution for analysis report generation.*
- Standard NestJS monorepo layout.
- `prisma/schema.prisma` implies database usage (PostgreSQL likely).

## Errors & Fixes
- ZIP structure was nested inside a folder with a generated name. Flattened to project root.
