import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";

async function startTestServer() {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-jwt-secret";
  process.env.STRIPE_WEBHOOK_SECRET = "stripe-secret";
  process.env.DOCUSIGN_WEBHOOK_SECRET = "docusign-secret";
  process.env.CLICKSIGN_WEBHOOK_SECRET = "clicksign-secret";
  process.env.FOCUS_NFE_WEBHOOK_SECRET = "focus-secret";
  process.env.META_ADS_WEBHOOK_SECRET = "meta-secret";

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
  return jwt.sign(payload, process.env.JWT_SECRET as string);
}

test("Sales OS - RBAC for Leads", async () => {
  const ctx = await startTestServer();
  try {
    // 1. Create Lead (SDR) - Should Pass
    const createRes = await fetch(`${ctx.baseUrl}/api/v1/leads`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${authToken({ roles: ["sdr"] })}`,
      },
      body: JSON.stringify({ name: "John Doe", email: "john@example.com", company: "Acme" }),
    });
    assert.equal(createRes.status, 201);
    const lead = await createRes.json() as { id: string };

    // 2. Create Lead (AE) - Should Fail
    const forbiddenCreate = await fetch(`${ctx.baseUrl}/api/v1/leads`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${authToken({ roles: ["ae"] })}`,
      },
      body: JSON.stringify({ name: "Jane Doe", email: "jane@example.com", company: "Globex" }),
    });
    assert.equal(forbiddenCreate.status, 403);

    // 3. Get Leads (Viewer) - Should Pass
    const listRes = await fetch(`${ctx.baseUrl}/api/v1/leads`, {
      headers: {
        authorization: `Bearer ${authToken({ roles: ["viewer"] })}`,
      },
    });
    assert.equal(listRes.status, 200);
  } finally {
    await ctx.close();
  }
});

test("Sales OS - Calendar Availability", async () => {
  const ctx = await startTestServer();
  try {
    const res = await fetch(`${ctx.baseUrl}/api/v1/calendar/availability`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${authToken({ roles: ["ae"] })}`,
      },
      body: JSON.stringify({ userId: "user_1", date: "2024-05-20" }),
    });
    assert.equal(res.status, 200);
    const data = await res.json() as { slots: any[] };
    assert.ok(data.slots.length > 0);
  } finally {
    await ctx.close();
  }
});

test("Sales OS - Proposal Generation", async () => {
  const ctx = await startTestServer();
  try {
    // 1. Create Deal first (Admin)
    const dealRes = await fetch(`${ctx.baseUrl}/api/v1/deals`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${authToken({ roles: ["admin"] })}`,
      },
      body: JSON.stringify({ title: "Deal Test", amount: 5000 }),
    });
    const deal = await dealRes.json() as { id: string };

    // 2. Generate Proposal (AE)
    const proposalRes = await fetch(`${ctx.baseUrl}/api/v1/deals/${deal.id}/proposal`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${authToken({ roles: ["ae"] })}`,
      },
    });
    assert.equal(proposalRes.status, 201);
    const proposal = await proposalRes.json() as { url: string };
    assert.ok(proposal.url.includes("https://storage.birthub.com/proposals/"));
  } finally {
    await ctx.close();
  }
});
