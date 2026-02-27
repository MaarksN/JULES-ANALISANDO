import { SITES } from '../config.js';
import { searchArbeitnow } from './arbeitnow.js';
import { searchIndeed } from './indeed.js';
import { searchLinkedin } from './linkedin.js';
import { searchRemotivo } from './remotivo.js';

const CIRCUIT_TTL_SECONDS = 60;
const MAX_FAILURES = 3;

function resolveSites(options = {}) {
  const include = String(options.includeSites || '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
  const exclude = String(options.excludeSites || '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  const base = include.length ? include : SITES.map((site) => site.key);
  return base.filter((site) => !exclude.includes(site));
}

function timeoutPromise(ms = 5000) {
  let timeoutId;
  const promise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms);
  });
  return { promise, cancel: () => clearTimeout(timeoutId) };
}

function cbKey(site) {
  return `circuit_breaker:${site}`;
}

async function loadCircuitState(env, site) {
  const raw = await env?.KV_METRICS?.get(cbKey(site));
  if (!raw) return { failureCount: 0, lastFailure: null, openUntil: 0 };
  try {
    const parsed = JSON.parse(raw);
    return {
      failureCount: Number(parsed.failureCount || 0),
      lastFailure: parsed.lastFailure || null,
      openUntil: Number(parsed.openUntil || 0)
    };
  } catch {
    return { failureCount: 0, lastFailure: null, openUntil: 0 };
  }
}

async function saveCircuitState(env, site, state) {
  if (!env?.KV_METRICS) return;
  await env.KV_METRICS.put(cbKey(site), JSON.stringify(state), {
    expirationTtl: Math.max(CIRCUIT_TTL_SECONDS * 3, 180)
  });
}

function logCircuit(site, state, reason = null) {
  console.log(JSON.stringify({
    site,
    status: state.openUntil > Date.now() ? 'OPEN' : 'CLOSED',
    failureCount: state.failureCount,
    lastFailure: state.lastFailure,
    reason
  }));
}

async function registerFailure(env, site, state) {
  const nextState = {
    failureCount: state.failureCount + 1,
    lastFailure: Date.now(),
    openUntil: state.failureCount + 1 >= MAX_FAILURES ? Date.now() + (CIRCUIT_TTL_SECONDS * 1000) : 0
  };
  await saveCircuitState(env, site, nextState);
  logCircuit(site, nextState, 'failure');
}

async function registerSuccess(env, site) {
  const nextState = { failureCount: 0, lastFailure: null, openUntil: 0 };
  await saveCircuitState(env, site, nextState);
  logCircuit(site, nextState, 'success');
}

function normalizeScraperResponse(result) {
  if (Array.isArray(result)) return { success: true, results: result, error: null };
  return {
    success: result?.success !== false,
    results: Array.isArray(result?.results) ? result.results : [],
    error: result?.error || null
  };
}

export async function runAllScrapers(query, options = {}, env = {}) {
  const scraperMap = {
    remotivo: searchRemotivo,
    arbeitnow: searchArbeitnow,
    indeed: searchIndeed,
    linkedin: searchLinkedin
  };

  const enabledSites = resolveSites(options).filter((site) => scraperMap[site]);

  const promises = enabledSites.map(async (site) => {
    const state = await loadCircuitState(env, site);
    if (state.openUntil > Date.now()) {
      logCircuit(site, state, 'circuit-open');
      return { site, results: [], success: false, error: 'circuit breaker OPEN' };
    }

    const timeout = timeoutPromise(5000);
    try {
      const rawResult = await Promise.race([
        scraperMap[site](query, options),
        timeout.promise
      ]);
      const result = normalizeScraperResponse(rawResult);

      if (!result.success) {
        await registerFailure(env, site, state);
        return { site, ...result };
      }

      await registerSuccess(env, site);
      return { site, ...result };
    } catch (err) {
      await registerFailure(env, site, state);
      return { site, results: [], success: false, error: err.message || 'erro desconhecido' };
    } finally {
      timeout.cancel();
    }
  });

  return Promise.all(promises);
}
