import { test, expect } from "@playwright/test";
import jwt from "jsonwebtoken";

test("critical routes are reachable", async ({ request }) => {
  const token = jwt.sign({ sub: "e2e-user" }, "test-secret");

  const health = await request.get("/health");
  expect(health.ok()).toBeTruthy();

  const openApi = await request.get("/openapi.json");
  expect(openApi.ok()).toBeTruthy();

  const leads = await request.get("/api/v1/leads", {
    headers: { authorization: `Bearer ${token}` },
  });
  expect(leads.ok()).toBeTruthy();
});
