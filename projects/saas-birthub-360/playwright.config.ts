import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3000",
  },
  webServer: {
    command: "pnpm --filter @birthub/api-gateway dev",
    url: "http://127.0.0.1:3000/health",
    reuseExistingServer: true,
    env: {
      JWT_SECRET: "test-secret",
    },
  },
});
