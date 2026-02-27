import assert from "node:assert/strict";
import test from "node:test";
import { createHmac } from "node:crypto";
import jwt from "jsonwebtoken";

async function startTestServer() {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-jwt-secret";
  process.env.STRIPE_WEBHOOK_SECRET = "stripe-secret";
  process.env.DOCUSIGN_WEBHOOK_SECRET = "docusign-secret";
  process.env.CLICKSIGN_WEBHOOK_SECRET = "clicksign-secret";
  process.env.FOCUS_NFE_WEBHOOK_SECRET = "focus-secret";
  process.env.META_ADS_WEBHOOK_SECRET = "meta-secret";
  process.env.FEATURE_LEAD_ENRICHMENT_ENABLED = "true";
  process.env.FEATURE_LEAD_OUTREACH_ENABLED = "true";

  const { default: app } = await import("../../server.js");
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("failed to resolve test server port");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}

function authToken(payload: Record<string, unknown>) {
  return jwt.sign({ tenantId: "tenant-a", ...payload }, process.env.JWT_SECRET as string);
}

function withInternalServiceToken() {
  process.env.INTERNAL_SERVICE_TOKEN = "svc-secret";
  return { "x-service-token": "svc-secret", "x-tenant-id": "tenant-a" };
}

test("rotas de deals aplicam autorização de role e scope", async () => {
  const ctx = await startTestServer();
  try {
    const forbiddenCreate = await fetch(`${ctx.baseUrl}/api/v1/deals`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${authToken({ roles: ["agent"], scopes: ["deals:write"] })}`,
      },
      body: JSON.stringify({ title: "Deal 1", amount: 1200 }),
    });
    assert.equal(forbiddenCreate.status, 403);

    const created = await fetch(`${ctx.baseUrl}/api/v1/deals`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${authToken({ roles: ["sales_manager"], scopes: ["deals:write"] })}`,
      },
      body: JSON.stringify({ title: "Deal 1", amount: 1200 }),
    });
    assert.equal(created.status, 201);
    const deal = await created.json() as { id: string };

    const forbiddenStage = await fetch(`${ctx.baseUrl}/api/v1/deals/${deal.id}/stage`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${authToken({ roles: ["sales_manager"], scopes: [] })}`,
      },
      body: JSON.stringify({ stage: "QUALIFIED" }),
    });
    assert.equal(forbiddenStage.status, 403);

    const stageUpdated = await fetch(`${ctx.baseUrl}/api/v1/deals/${deal.id}/stage`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${authToken({ roles: ["sales_manager"], scopes: ["deals:write"] })}`,
      },
      body: JSON.stringify({ stage: "QUALIFIED" }),
    });
    assert.equal(stageUpdated.status, 200);
  } finally {
    await ctx.close();
  }
});

test("webhooks docusign aplicam jwt signature + idempotência", async () => {
  const ctx = await startTestServer();
  try {
    const token = jwt.sign({ iss: "docusign" }, process.env.DOCUSIGN_WEBHOOK_SECRET as string);
    const headers = {
      "content-type": "application/json",
      authorization: token,
      "x-docusign-delivery-id": "evt-1",
    };

    const first = await fetch(`${ctx.baseUrl}/webhooks/docusign`, {
      method: "POST",
      headers,
      body: JSON.stringify({ event: "envelope.completed" }),
    });
    assert.equal(first.status, 200);

    const duplicate = await fetch(`${ctx.baseUrl}/webhooks/docusign`, {
      method: "POST",
      headers,
      body: JSON.stringify({ event: "envelope.completed" }),
    });
    assert.equal(duplicate.status, 409);
  } finally {
    await ctx.close();
  }
});

test("webhook stripe valida assinatura hmac", async () => {
  const ctx = await startTestServer();
  try {
    const body = { id: "evt_1", type: "invoice.paid" };
    const signature = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET as string)
      .update(JSON.stringify(body))
      .digest("hex");

    const ok = await fetch(`${ctx.baseUrl}/webhooks/stripe`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "stripe-signature": `v1=${signature}`,
        "stripe-event-id": "evt_1",
      },
      body: JSON.stringify(body),
    });
    assert.equal(ok.status, 200);
  } finally {
    await ctx.close();
  }
});

test("ai complete responde payload estruturado", async () => {
  const ctx = await startTestServer();
  try {
    const response = await fetch(`${ctx.baseUrl}/api/v1/ai/complete`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${authToken({ roles: ["sales_manager"], scopes: ["deals:write"], plan: "PRO" })}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Teste de completion" }],
      }),
    });

    assert.equal(response.status, 200);
    const payload = await response.json() as { content: string; model: string; provider: string };
    assert.equal(payload.content, "Teste de completion");
    assert.equal(typeof payload.model, "string");
    assert.equal(typeof payload.provider, "string");
  } finally {
    await ctx.close();
  }
});

test("plan guard bloqueia feature de ldr para plano starter", async () => {
  const ctx = await startTestServer();
  try {
    const blocked = await fetch(`${ctx.baseUrl}/api/v1/agents/ldr/qualify`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${authToken({ roles: ["sales_manager"], scopes: ["deals:write"], plan: "STARTER" })}`,
      },
      body: JSON.stringify({ leadId: "lead_1" }),
    });
    assert.equal(blocked.status, 402);

    const allowed = await fetch(`${ctx.baseUrl}/api/v1/agents/ldr/qualify`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${authToken({ roles: ["sales_manager"], scopes: ["deals:write"], plan: "PRO" })}`,
      },
      body: JSON.stringify({ leadId: "lead_1" }),
    });
    assert.equal(allowed.status, 202);
  } finally {
    await ctx.close();
  }
});

test("internal organization plan endpoints aceitam x-service-token", async () => {
  const ctx = await startTestServer();
  try {
    const headers = { "content-type": "application/json", ...withInternalServiceToken() };
    const updated = await fetch(`${ctx.baseUrl}/api/v1/internal/organizations/org-1/plan`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ plan: "PRO" }),
    });
    assert.equal(updated.status, 200);

    const fetched = await fetch(`${ctx.baseUrl}/api/v1/internal/organizations/org-1/plan`, { headers });
    assert.equal(fetched.status, 200);
    const payload = await fetched.json() as { plan: string };
    assert.equal(payload.plan, "PRO");
  } finally {
    await ctx.close();
  }
});

test("internal activity endpoint aceita x-service-token", async () => {
  const ctx = await startTestServer();
  try {
    const headers = { "content-type": "application/json", ...withInternalServiceToken() };
    const updated = await fetch(`${ctx.baseUrl}/api/v1/internal/activities/act-1`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: "OPENED" }),
    });
    assert.equal(updated.status, 200);

    const fetched = await fetch(`${ctx.baseUrl}/api/v1/internal/activities/act-1`, { headers });
    assert.equal(fetched.status, 200);
    const payload = await fetched.json() as { status: string };
    assert.equal(payload.status, "OPENED");
  } finally {
    await ctx.close();
  }
});


test("financial reconcile exige role permitida e retorna contrato v1", async () => {
  const ctx = await startTestServer();
  try {
    const forbidden = await fetch(`${ctx.baseUrl}/api/v1/financial/reconcile`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${authToken({ roles: ["sales_manager"], scopes: [] })}`,
      },
      body: JSON.stringify({ customerId: "cust-1", amountCents: 2000, currency: "BRL" }),
    });
    assert.equal(forbidden.status, 403);

    const invalidPayload = await fetch(`${ctx.baseUrl}/api/v1/financial/reconcile`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${authToken({ roles: ["finance_manager"], scopes: [] })}`,
      },
      body: JSON.stringify({ customerId: "cust-1", amountCents: -1, currency: "BRL" }),
    });
    assert.equal(invalidPayload.status, 400);

    const accepted = await fetch(`${ctx.baseUrl}/api/v1/financial/reconcile`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${authToken({ roles: ["finance_manager"], scopes: [] })}`,
      },
      body: JSON.stringify({ customerId: "cust-1", amountCents: 2000, currency: "BRL" }),
    });
    assert.equal(accepted.status, 202);
    const payload = await accepted.json() as { schemaVersion: string; status: string; provider: string; chargeId: string };
    assert.equal(payload.schemaVersion, "v1");
    assert.equal(payload.status, "accepted");
    assert.equal(payload.provider, "mock-payment");
    assert.equal(typeof payload.chargeId, "string");
  } finally {
    await ctx.close();
  }
});


test("rotas críticas executam enrich/outreach/proposal/forecast com validação", async () => {
  const ctx = await startTestServer();
  try {
    const token = authToken({ roles: ["sales_manager"], scopes: ["deals:write"] });

    const createLead = await fetch(`${ctx.baseUrl}/api/v1/leads`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: "Nina",
        email: "nina@acme.com",
        status: "NEW",
        score: 75,
        assignee: "sdr-100",
      }),
    });
    assert.equal(createLead.status, 201);
    const lead = await createLead.json() as { id: string };

    const enrich = await fetch(`${ctx.baseUrl}/api/v1/leads/${lead.id}/enrich`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ forceRefresh: true, source: "manual" }),
    });
    assert.equal(enrich.status, 202);

    const outreach = await fetch(`${ctx.baseUrl}/api/v1/leads/${lead.id}/outreach`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel: "email", cadenceId: "cad-1" }),
    });
    assert.equal(outreach.status, 202);

    const createDeal = await fetch(`${ctx.baseUrl}/api/v1/deals`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: "Deal Plan", amount: 4000 }),
    });
    assert.equal(createDeal.status, 201);
    const deal = await createDeal.json() as { id: string };

    const proposal = await fetch(`${ctx.baseUrl}/api/v1/deals/${deal.id}/proposal`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ templateId: "tpl-std", expirationDays: 15 }),
    });
    assert.equal(proposal.status, 202);

    const forecast = await fetch(`${ctx.baseUrl}/api/v1/deals/${deal.id}/forecast`, {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(forecast.status, 200);
    const forecastPayload = await forecast.json() as { schemaVersion: string; confidence: number };
    assert.equal(forecastPayload.schemaVersion, "v1");
    assert.ok(typeof forecastPayload.confidence === "number");

    const invalidProposal = await fetch(`${ctx.baseUrl}/api/v1/deals/${deal.id}/proposal`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ templateId: "", expirationDays: 200 }),
    });
    assert.equal(invalidProposal.status, 400);
  } finally {
    await ctx.close();
  }
});


test("customer timeline e nps possuem fluxo real e contrato v1", async () => {
  const ctx = await startTestServer();
  try {
    const token = authToken({ roles: ["sales_manager"], scopes: [] });

    const timelineBefore = await fetch(`${ctx.baseUrl}/api/v1/customers/cust_1/timeline`, {
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(timelineBefore.status, 200);

    const nps = await fetch(`${ctx.baseUrl}/api/v1/customers/cust_1/nps`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ score: 9, feedback: "great" }),
    });
    assert.equal(nps.status, 202);
    const npsPayload = await nps.json() as { schemaVersion: string; accepted: boolean };
    assert.equal(npsPayload.schemaVersion, "v1");
    assert.equal(npsPayload.accepted, true);

    const timelineAfter = await fetch(`${ctx.baseUrl}/api/v1/customers/cust_1/timeline`, {
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(timelineAfter.status, 200);
    const timelinePayload = await timelineAfter.json() as { schemaVersion: string; events: Array<{ description: string }> };
    assert.equal(timelinePayload.schemaVersion, "v1");
    assert.ok(timelinePayload.events.some((event) => event.description.includes("NPS")));
  } finally {
    await ctx.close();
  }
});

test("webhook stripe responde contrato v1", async () => {
  const ctx = await startTestServer();
  try {
    const body = { id: "evt_2", type: "invoice.payment_failed" };
    const signature = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET as string)
      .update(JSON.stringify(body))
      .digest("hex");

    const response = await fetch(`${ctx.baseUrl}/webhooks/stripe`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "stripe-signature": `v1=${signature}`,
        "x-idempotency-key": "evt-2",
      },
      body: JSON.stringify(body),
    });

    assert.equal(response.status, 200);
    const payload = await response.json() as { schemaVersion: string; status: string; provider: string };
    assert.equal(payload.schemaVersion, "v1");
    assert.equal(payload.status, "accepted");
    assert.equal(payload.provider, "stripe");
  } finally {
    await ctx.close();
  }
});


test("contracts list e financial invoices suportam paginação e soft delete", async () => {
  const ctx = await startTestServer();
  try {
    const token = authToken({ roles: ["finance_manager", "sales_manager"], scopes: [] });

    const dealCreate = await fetch(`${ctx.baseUrl}/api/v1/deals`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: "Deal For Contract", amount: 1500 }),
    });
    assert.equal(dealCreate.status, 201);
    const deal = await dealCreate.json() as { id: string };

    const contractCreate = await fetch(`${ctx.baseUrl}/api/v1/contracts`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ customerId: "cust_1", documentUrl: "https://docs/acme.pdf", dealId: deal.id }),
    });
    assert.equal(contractCreate.status, 201);

    const contractList = await fetch(`${ctx.baseUrl}/api/v1/contracts?customerId=cust_1&limit=10`, {
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(contractList.status, 200);
    const contractListPayload = await contractList.json() as { schemaVersion: string; data: Array<{ customerId: string }> };
    assert.equal(contractListPayload.schemaVersion, "v1");
    assert.ok(contractListPayload.data.length >= 1);

    const invoices = await fetch(`${ctx.baseUrl}/api/v1/financial/invoices?limit=10`, {
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(invoices.status, 200);
    const invoicesPayload = await invoices.json() as { schemaVersion: string; data: Array<{ id: string }> };
    assert.equal(invoicesPayload.schemaVersion, "v1");

    const invoiceId = invoicesPayload.data[0]?.id;
    assert.ok(invoiceId);

    const deleted = await fetch(`${ctx.baseUrl}/api/v1/financial/invoices/${invoiceId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(deleted.status, 204);

    const invoicesAfter = await fetch(`${ctx.baseUrl}/api/v1/financial/invoices?limit=10`, {
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(invoicesAfter.status, 200);
    const invoicesAfterPayload = await invoicesAfter.json() as { data: Array<{ id: string }> };
    assert.equal(invoicesAfterPayload.data.length, 0);
  } finally {
    await ctx.close();
  }
});
