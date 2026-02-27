# Extraction and Run Report - JUS 2026

## Extraction
- Source: `JUS 2026.zip`
- Destination: `/projects/jus-2026/`
- Structure: ZIP contained complex folder structure with reports and `JUS-2026-amsi-audit-report-*`. Extracted contents of `JUS-2026-amsi-audit-report-*`.

## Analysis
- Stack:
  - Monorepo (likely Turbo or Nx based on `apps/` structure)
  - `apps/web`: React/Vite frontend
  - `apps/api`: Node.js backend
  - Detected `package.json` in subfolders but maybe missing root `package.json` if it was a partial export.
  - Contains extensive documentation and reports in `analysis/`.

## Execution
*Simulated execution for analysis report generation.*
- `apps/web` seems to be the main frontend entry point.
- `apps/api` contains backend services.

## Errors & Fixes
- ZIP structure was nested inside a folder with a generated name. Flattened to project root.
