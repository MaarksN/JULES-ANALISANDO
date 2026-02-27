import { LIMITS, SITES, getRuntimeConfig } from '../config.js';
import { getCachedSearch, setCachedSearch } from '../cache/index.js';
import { filterJobs } from '../filters/index.js';
import { incrementMetric } from '../metrics/index.js';
import { runAllScrapers } from '../scrapers/index.js';
import { scoreJob } from '../scoring/index.js';
import { dedupeJobs } from '../utils/dedupe.js';
import { paginate } from '../utils/pagination.js';
import { cleanUrl, normalizeToken, sanitizeText } from '../utils/sanitize.js';
import { withJson } from './shared.js';

function tokensFromResume(text) {
  return String(text || '')
    .toLowerCase()
    .match(/[a-zà-ÿ][a-zà-ÿ0-9+#.-]{2,}/gi)?.slice(0, 12) || [];
}

function buildLegacyQuery(body) {
  const resumeTokens = tokensFromResume(body.resumeText).slice(0, 6).join(' ');
  return [body.query, body.extraQuery, resumeTokens].filter(Boolean).join(' ').trim();
}

function parseSites(value) {
  return String(value || '')
    .split(',')
    .map((item) => sanitizeText(item, 40).toLowerCase())
    .filter(Boolean);
}

export function validateSearchPayload(body) {
  const errors = [];
  const query = buildLegacyQuery(body);
  if (!query || typeof query !== 'string') errors.push('query é obrigatório e deve ser string');
  if (query?.length > LIMITS.queryMaxChars) errors.push(`query não pode ter mais de ${LIMITS.queryMaxChars} caracteres`);
  if (body?.pageSize && (body.pageSize < 1 || body.pageSize > LIMITS.pageSizeMax)) errors.push(`pageSize deve ser entre 1 e ${LIMITS.pageSizeMax}`);
  if (body?.locations && !Array.isArray(body.locations)) errors.push('locations deve ser um array');
  if (body?.locations?.length > LIMITS.locationsMax) errors.push(`máximo ${LIMITS.locationsMax} locations por busca`);

  const knownSites = new Set(SITES.map((site) => site.key));
  const includeSites = parseSites(body?.includeSites);
  const excludeSites = parseSites(body?.excludeSites);
  if (includeSites.some((site) => !knownSites.has(site))) errors.push('includeSites contém site não suportado');
  if (excludeSites.some((site) => !knownSites.has(site))) errors.push('excludeSites contém site não suportado');

  return errors;
}


function normalizeExpectedSalaryRange(payload) {
  const range = payload.expectedSalaryRange || payload.salaryRange || {};
  if (typeof range === 'string') {
    const [min, max] = range.split('-').map((v) => Number(String(v).replace(/[^\d]/g, '')) || null);
    return { min, max };
  }
  return {
    min: Number(range.min || range.minimum || 0) || null,
    max: Number(range.max || range.maximum || 0) || null
  };
}

function normalizePayload(payload) {
  const query = sanitizeText(buildLegacyQuery(payload), LIMITS.queryMaxChars);
  const rawLocations = Array.isArray(payload.locations)
    ? payload.locations
    : String(payload.locations || '').split(';').map((v) => v.trim()).filter(Boolean);

  const locations = rawLocations.length
    ? rawLocations.slice(0, LIMITS.locationsMax).map((item) => sanitizeText(item, 120))
    : [sanitizeText(payload.location || 'Remoto', 120)];

  return {
    query,
    locations,
    remoteOnly: Boolean(payload.remoteOnly),
    seniority: String(payload.seniority || 'any'),
    contractType: String(payload.contractType || 'any'),
    includeKeywords: String(payload.includeKeywords || ''),
    excludeKeywords: String(payload.excludeKeywords || ''),
    includeSites: String(payload.includeSites || ''),
    excludeSites: String(payload.excludeSites || ''),
    language: String(payload.language || 'any'),
    minScore: Number(payload.minScore || 0),
    sortBy: String(payload.sortBy || 'score'),
    sortDir: String(payload.sortDir || 'desc'),
    page: Number(payload.page || 1),
    pageSize: Number(payload.pageSize || 20),
    maxResultsPerSite: Number(payload.maxResultsPerSite || 10),
    expectedSalaryRange: normalizeExpectedSalaryRange(payload)
  };
}

function cacheKeyFromPayload(payload, cfg) {
  return normalizeToken(JSON.stringify({ ...payload, page: 1, schemaVersion: cfg.version }));
}

function parseSalaryValue(rawSalary) {
  const numbers = String(rawSalary || '').match(/\d[\d.,]*/g) || [];
  if (!numbers.length) return 0;
  const numeric = numbers.map((chunk) => Number(chunk.replace(/\./g, '').replace(',', '.')) || 0);
  return Math.max(...numeric);
}

function sortJobs(items, sortBy, sortDir) {
  const factor = sortDir === 'asc' ? 1 : -1;
  const list = [...items];
  list.sort((a, b) => {
    if (sortBy === 'recent' || sortBy === 'recency') return (new Date(a.postedAt || 0).getTime() - new Date(b.postedAt || 0).getTime()) * factor;
    if (sortBy === 'salary') return (parseSalaryValue(a.salary) - parseSalaryValue(b.salary)) * factor;
    return ((a.score || 0) - (b.score || 0)) * factor;
  });
  return list;
}

function normalizeJobOutput(job) {
  return {
    id: sanitizeText(job.id || crypto.randomUUID(), 100),
    title: sanitizeText(job.title, 160),
    company: sanitizeText(job.company, 120),
    location: sanitizeText(job.location || 'Remoto', 120),
    url: cleanUrl(job.url),
    description: sanitizeText(job.description, 500),
    postedAt: job.postedAt || null,
    remote: Boolean(job.remote),
    site: sanitizeText(job.site, 50),
    salary: job.salary || null,
    tags: Array.isArray(job.tags) ? job.tags.map((tag) => sanitizeText(tag, 40)).filter(Boolean) : [],
    score: Number(job.score || 0),
    scoreBreakdown: job.scoreBreakdown || {}
  };
}

export async function handleSearch(request, env, requestId) {
  const rawPayload = await request.json();
  const errors = validateSearchPayload(rawPayload);
  if (errors.length) {
    await incrementMetric(env, 'invalidPayloads', 1);
    return withJson({ error: 'Payload inválido', errors }, 400, requestId);
  }

  const payload = normalizePayload(rawPayload);
  await incrementMetric(env, 'searchRequests', 1);
  const cfg = getRuntimeConfig(env);
  const cacheKey = cacheKeyFromPayload(payload, cfg);
  const cached = await getCachedSearch(env, cacheKey);

  if (cached) {
    await incrementMetric(env, 'cacheHits', 1);
    return withJson({ ...cached, cached: true }, 200, requestId, { 'x-cache': 'HIT' });
  }

  await incrementMetric(env, 'cacheMisses', 1);
  const scraperResult = await runAllScrapers(payload.query, payload, env);
  const warnings = scraperResult.filter((item) => !item.success).map((item) => `${item.site}: ${item.error}`);
  const allJobs = scraperResult.flatMap((item) => item.results || []);

  const scoreCache = new Map();
  const scored = allJobs.map((job) => {
    const key = normalizeToken(`${job.url}|${job.title}|${job.company}`);
    if (!scoreCache.has(key)) scoreCache.set(key, scoreJob(job, payload));
    return normalizeJobOutput(scoreCache.get(key));
  }).filter((job) => job.url);

  const deduped = dedupeJobs(scored);
  const filtered = filterJobs(deduped, payload);
  const sorted = sortJobs(filtered, payload.sortBy, payload.sortDir);
  const paged = paginate(sorted, payload.page, payload.pageSize);

  const siteStats = scraperResult.reduce((acc, item) => ({
    ...acc,
    [item.site]: {
      found: item.results.length,
      filtered: item.results.length,
      avgScore: 0,
      success: item.success,
      durationMs: Number(item.durationMs || 0)
    }
  }), {});

  const response = {
    schemaVersion: cfg.version,
    query: payload.query,
    totalResults: deduped.length,
    filteredResults: sorted.length,
    page: paged.page,
    totalPages: paged.totalPages,
    hasNext: paged.hasNext,
    hasPrev: paged.hasPrev,
    startIndex: paged.startIndex,
    endIndex: paged.endIndex,
    avgScore: sorted.length ? Number((sorted.reduce((acc, job) => acc + (job.score || 0), 0) / sorted.length).toFixed(2)) : 0,
    cached: false,
    results: paged.results,
    siteStats,
    warnings,
    diagnostics: {
      activeSites: Object.keys(siteStats).length,
      totalFetched: allJobs.length,
      afterFilters: sorted.length,
      afterDedup: deduped.length,
      inputMode: rawPayload.query ? 'query' : 'legacy'
    }
  };

  await setCachedSearch(env, cacheKey, response, cfg.cacheTtlSeconds);
  await incrementMetric(env, 'totalResultsReturned', paged.results.length);
  if (warnings.length) await incrementMetric(env, 'upstreamErrors', warnings.length);
  return withJson(response, 200, requestId, { 'x-cache': 'MISS' });
}
