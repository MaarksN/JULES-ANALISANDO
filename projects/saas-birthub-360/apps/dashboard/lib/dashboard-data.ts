"use client";

import useSWR from "swr";

export type PipelineItem = { stage: string; value: number; trend: string };
export type HealthScoreItem = { client: string; score: number; risk: string; nps: number };
export type FinanceItem = { label: string; value: string; delta: string };
export type AttributionItem = { source: string; leads: number; conversion: string; cac: string };
export type ContractItem = { customer: string; status: string; mrr: string; owner: string };

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("birthub_token") : null;
  const tenantId = typeof window !== "undefined" ? localStorage.getItem("birthub_tenant_id") || "default" : "default";
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "x-tenant-id": tenantId,
  };
}

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: authHeaders(), cache: "no-store" });
  if (!response.ok) throw new Error(`dashboard_fetch_failed:${response.status}`);
  return response.json() as Promise<T>;
}

export function useMetrics() {
  const swr = useSWR<{ pipeline: PipelineItem[]; finance: FinanceItem[] }>("/api/dashboard/metrics", fetcher);
  return {
    data: swr.data,
    loading: swr.isLoading,
    error: swr.error,
    empty: !swr.isLoading && !swr.error && (!swr.data || swr.data.pipeline.length === 0),
  };
}

export function useAgentStatuses() {
  const swr = useSWR<{ healthScore: HealthScoreItem[] }>("/api/dashboard/agent-statuses", fetcher);
  return {
    data: swr.data,
    loading: swr.isLoading,
    error: swr.error,
    empty: !swr.isLoading && !swr.error && (!swr.data || swr.data.healthScore.length === 0),
  };
}

export function useRecentTasks() {
  const swr = useSWR<{ contracts: ContractItem[]; attribution: AttributionItem[] }>("/api/dashboard/recent-tasks", fetcher);
  return {
    data: swr.data,
    loading: swr.isLoading,
    error: swr.error,
    empty: !swr.isLoading && !swr.error && (!swr.data || swr.data.contracts.length === 0),
  };
}

export function useBillingSummary() {
  const swr = useSWR<{ finance: FinanceItem[] }>("/api/dashboard/billing-summary", fetcher);
  return {
    data: swr.data,
    loading: swr.isLoading,
    error: swr.error,
    empty: !swr.isLoading && !swr.error && (!swr.data || swr.data.finance.length === 0),
  };
}
