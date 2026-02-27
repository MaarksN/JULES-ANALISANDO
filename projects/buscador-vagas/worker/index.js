const VERSION = '6.0.0';
const CACHE_TTL_MS = 15 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 80;
const MAX_CONCURRENCY = 5;
const FETCH_TIMEOUT_MS = 12000;
const FETCH_RETRIES = 2;
const MAX_PAGE_SIZE = 100;
const MAX_QUERY_LEN = 220;
const MAX_FILTER_KEYWORDS = 30;
const SITE_COOLDOWN_MS = 5 * 60 * 1000;

const memoryCache = new Map();
const rateLimits = new Map();
const siteFailures = new Map();
const metrics = {
  requests: 0, searchRequests: 0, cacheHits: 0, cacheMisses: 0, rateLimited: 0, invalidPayloads: 0,
  upstreamErrors: 0, siteCooldownSkips: 0, totalResultsReturned: 0, explainRequests: 0,
};

export default {
  async fetch(request) {
    metrics.requests += 1;
    const url = new URL(request.url);
    const startedAt = Date.now();
    const requestId = createRequestId();

    if (request.method === 'OPTIONS') return withStdHeaders(new Response(null, { headers: corsHeaders() }), requestId, request);
    cleanupRateLimits(); cleanupCache(); cleanupSiteFailures();

    if (url.pathname === '/health') return respond({ ok: true, service: 'job-finder-worker', now: new Date().toISOString() }, requestId, request);
    if (url.pathname === '/version') return respond({ version: VERSION }, requestId, request);
    if (url.pathname === '/metrics') return respond({ ...metrics, cacheEntries: memoryCache.size, rateLimitEntries: rateLimits.size, siteCooldownEntries: siteFailures.size }, requestId, request);
    if (url.pathname === '/sites') return respond({ count: SITES.length, sites: SITES }, requestId, request);
    if (url.pathname === '/config') return respond(configPayload(), requestId, request);
    if (url.pathname === '/sample-request') return respond(sampleRequest(), requestId, request);
    if (url.pathname === '/normalize' && request.method === 'POST') return normalizeEndpoint(request, requestId);
    if (url.pathname === '/validate' && request.method === 'POST') return validateEndpoint(request, requestId);
    if (url.pathname === '/explain-score' && request.method === 'POST') return explainScoreEndpoint(request, requestId);
    if (url.pathname === '/metrics/reset' && request.method === 'POST') return resetMetrics(requestId, request);

    if (url.pathname !== '/search' || request.method !== 'POST') return respond({ error: 'Not found' }, requestId, request, 404);

    metrics.searchRequests += 1;
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId)) { metrics.rateLimited += 1; return respond({ error: 'Rate limit excedido. Aguarde e tente novamente.' }, requestId, request, 429); }

    if (!(request.headers.get('content-type') || '').includes('application/json')) {
      metrics.invalidPayloads += 1;
      return respond({ error: 'Content-Type deve ser application/json.' }, requestId, request, 400);
    }

    try {
      const body = await request.json();
      const validated = validateInput(body);
      if (!validated.ok) { metrics.invalidPayloads += 1; return respond({ error: validated.error }, requestId, request, 400); }

      const input = validated.value;
      let keywords = extractKeywords(input.resumeText, input.keywordLimit);
      keywords = expandKeywords(keywords);
      if (!keywords.length) return respond({ error: 'Não foi possível extrair palavras-chave do currículo.' }, requestId, request, 400);

      const activeSites = filterSites(input.includeSites, input.excludeSites);
      const locations = input.locations.length ? input.locations : [input.location];
      const cacheKey = buildCacheKey(input, keywords, activeSites, locations);
      const cached = getCache(cacheKey);
      if (cached) {
        metrics.cacheHits += 1;
        return respond({ ...cached, fromCache: true, timingMs: Date.now() - startedAt }, requestId, request);
      }
      metrics.cacheMisses += 1;

      const phaseTimes = { searchMs: 0, scoreMs: 0, filterMs: 0, sortMs: 0, paginateMs: 0 };
      const tSearch = Date.now();
      const siteResults = await mapWithConcurrency(activeSites, MAX_CONCURRENCY, async (site) => searchSite(site, input, keywords, locations));
      phaseTimes.searchMs = Date.now() - tSearch;

      const all = siteResults.flatMap((r) => r.results);
      const tScore = Date.now();
      const ranked = rankAndDedupe(all);
      phaseTimes.scoreMs = Date.now() - tScore;

      const tFilter = Date.now();
      const filtered = applyFilters(ranked, input);
      phaseTimes.filterMs = Date.now() - tFilter;

      const tSort = Date.now();
      const sorted = sortResults(filtered, input.sortBy, input.sortDir);
      phaseTimes.sortMs = Date.now() - tSort;

      const tPage = Date.now();
      const paged = paginate(sorted, input.page, input.pageSize).map((r, i) => ({ ...r, id: makeResultId(r, i), confidence: confidenceFromScore(r.score) }));
      phaseTimes.paginateMs = Date.now() - tPage;

      const warnings = buildWarnings(siteResults, activeSites, sorted);
      const payload = {
        generatedAt: new Date().toISOString(),
        schemaVersion: 3,
        location: input.location,
        locations,
        keywords,
        warnings,
        filtersApplied: {
          minScore: input.minScore, remoteOnly: input.remoteOnly, seniority: input.seniority, contractType: input.contractType,
          includeKeywords: input.includeKeywords, excludeKeywords: input.excludeKeywords, includeSites: input.includeSites,
          excludeSites: input.excludeSites, sortBy: input.sortBy, sortDir: input.sortDir, language: input.language,
        },
        totalResults: sorted.length,
        pagination: buildPagination(sorted.length, input.page, input.pageSize),
        diagnostics: {
          activeSites: activeSites.map((s) => s.name), rawCount: all.length, dedupedCount: ranked.length,
          filteredCount: filtered.length, avgScore: sorted.length ? Number((sorted.reduce((a, b) => a + b.score, 0) / sorted.length).toFixed(2)) : 0,
          phaseTimes,
        },
        siteStats: siteResults.map((s) => ({ site: s.site, ok: s.ok, count: s.count || 0, elapsedMs: s.elapsedMs, skippedByCooldown: !!s.skippedByCooldown, error: s.error })),
        resultSummary: summarizeResults(sorted),
        results: paged,
      };

      setCache(cacheKey, payload);
      metrics.totalResultsReturned += paged.length;
      return respond({ ...payload, fromCache: false, timingMs: Date.now() - startedAt }, requestId, request);
    } catch (error) {
      return respond({ error: String(error.message || error) }, requestId, request, 500);
    }
  },
};

async function explainScoreEndpoint(request, requestId) {
  metrics.explainRequests += 1;
  try {
    const body = await request.json();
    const input = validateInput({ resumeText: body.resumeText || 'texto mínimo para validar score', location: body.location || 'Ribeirão Preto, SP' });
    if (!input.ok) return respond({ error: input.error }, requestId, request, 400);
    const keywords = expandKeywords(extractKeywords(input.value.resumeText, 30));
    const job = { title: String(body.title || ''), snippet: String(body.snippet || ''), url: String(body.url || ''), site: String(body.site || 'Manual') };
    const breakdown = computeScoreBreakdown(job, keywords, input.value);
    return respond({ job, keywords, breakdown }, requestId, request);
  } catch (e) {
    return respond({ error: String(e.message || e) }, requestId, request, 400);
  }
}

function sampleRequest() { return { resumeText: 'Cole aqui um resumo do currículo com stack e experiências', location: 'Ribeirão Preto, SP', locations: 'Ribeirão Preto, SP; São Paulo, SP', extraQuery: 'python dados', maxResultsPerSite: 8, minScore: 3, page: 1, pageSize: 20, remoteOnly: false, seniority: 'any', contractType: 'any', sortBy: 'score', sortDir: 'desc', includeKeywords: 'python,dados', excludeKeywords: 'estágio,temporário', includeSites: 'Indeed,Gupy', excludeSites: '', language: 'any', keywordLimit: 30 }; }
function configPayload() { return { defaults: { location: 'Ribeirão Preto, SP', maxResultsPerSite: 8, minScore: 0, page: 1, pageSize: 20, remoteOnly: false, seniority: 'any', contractType: 'any', sortBy: 'score', sortDir: 'desc', language: 'any', keywordLimit: 30 }, limits: { maxResultsPerSite: [1, 20], pageSize: [1, MAX_PAGE_SIZE], minScore: [-50, 200], keywordLimit: [10, 60] }, enums: { seniority: ['any', 'junior', 'pleno', 'senior'], contractType: ['any', 'clt', 'pj', 'estagio', 'temporario'], sortBy: ['score', 'title', 'site', 'recency'], sortDir: ['asc', 'desc'], language: ['any', 'pt', 'en'] } }; }

async function normalizeEndpoint(request, requestId) { try { const body = await request.json(); return respond({ normalizedText: normalize(String(body?.text || '')) }, requestId, request); } catch (e) { return respond({ error: String(e.message || e) }, requestId, request, 400); } }
async function validateEndpoint(request, requestId) { try { const body = await request.json(); const validated = validateInput(body); return respond({ ok: validated.ok, ...(validated.ok ? { normalizedInput: validated.value } : { error: validated.error }) }, requestId, request, validated.ok ? 200 : 400); } catch (e) { return respond({ ok: false, error: String(e.message || e) }, requestId, request, 400); } }
function resetMetrics(requestId, request) { Object.keys(metrics).forEach((k) => { metrics[k] = 0; }); return respond({ ok: true, message: 'metrics resetadas' }, requestId, request); }

const SITES = [
  { name: 'Vagas.com.br', domain: 'vagas.com.br' }, { name: 'Indeed', domain: 'indeed.com' }, { name: 'Gupy', domain: 'gupy.io' },
  { name: 'InfoJobs', domain: 'infojobs.com.br' }, { name: 'LinkedIn Jobs', domain: 'linkedin.com' }, { name: 'Empregos.com.br', domain: 'empregos.com.br' },
  { name: 'Glassdoor', domain: 'glassdoor.com.br' }, { name: 'Catho', domain: 'catho.com.br' }, { name: 'Sólides Vagas', domain: 'solides.com.br' },
  { name: 'Jobsora', domain: 'jobsora.com' }, { name: 'Emprega Brasil / SINE', domain: 'gov.br' },
];
const STOPWORDS = new Set(['de','da','do','das','dos','e','em','na','no','nas','nos','para','por','com','uma','um','ao','aos','às','as','os','o','a','que','como','mais','menos','sobre','entre','desde','até','se','ser','são','sou','foi','me','minha','meu','currículo','curriculo','perfil','the','this','from','link','version']);
const KEYWORD_EXPANSIONS = { js: ['javascript'], ai: ['inteligencia artificial'], api: ['rest', 'microservices'], dados: ['analytics', 'bi'] };

function validateInput(body) {
  const resumeText = String(body?.resumeText || '').trim();
  const location = trimText(String(body?.location || 'Ribeirão Preto, SP').trim(), MAX_QUERY_LEN);
  const locations = String(body?.locations || '').split(';').map((s) => trimText(s.trim(), MAX_QUERY_LEN)).filter(Boolean).slice(0, 8);
  const extraQuery = trimText(String(body?.extraQuery || '').trim(), MAX_QUERY_LEN);
  const maxResultsPerSiteNum = Number(body?.maxResultsPerSite || 8);
  const minScoreNum = Number(body?.minScore ?? 0);
  const pageNum = Number(body?.page || 1);
  const pageSizeNum = Number(body?.pageSize || 20);
  const remoteOnly = Boolean(body?.remoteOnly || false);
  const seniority = String(body?.seniority || 'any').toLowerCase();
  const contractType = String(body?.contractType || 'any').toLowerCase();
  const sortBy = String(body?.sortBy || 'score').toLowerCase();
  const sortDir = String(body?.sortDir || 'desc').toLowerCase();
  const language = String(body?.language || 'any').toLowerCase();
  const keywordLimit = Number(body?.keywordLimit || 30);
  const includeKeywords = normalizeCsv(body?.includeKeywords || '', MAX_FILTER_KEYWORDS);
  const excludeKeywords = normalizeCsv(body?.excludeKeywords || '', MAX_FILTER_KEYWORDS);
  const includeSites = normalizeCsv(body?.includeSites || '', MAX_FILTER_KEYWORDS);
  const excludeSites = normalizeCsv(body?.excludeSites || '', MAX_FILTER_KEYWORDS);

  if (!resumeText || resumeText.length < 30) return { ok: false, error: 'Currículo muito curto. Informe pelo menos 30 caracteres.' };
  if (!location) return { ok: false, error: 'Localização é obrigatória.' };
  if (!Number.isFinite(maxResultsPerSiteNum) || maxResultsPerSiteNum < 1 || maxResultsPerSiteNum > 20) return { ok: false, error: 'maxResultsPerSite deve ser entre 1 e 20.' };
  if (!Number.isFinite(minScoreNum) || minScoreNum < -50 || minScoreNum > 200) return { ok: false, error: 'minScore deve ser entre -50 e 200.' };
  if (!Number.isFinite(pageNum) || pageNum < 1) return { ok: false, error: 'page deve ser >= 1.' };
  if (!Number.isFinite(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > MAX_PAGE_SIZE) return { ok: false, error: `pageSize deve ser entre 1 e ${MAX_PAGE_SIZE}.` };
  if (!['any', 'junior', 'pleno', 'senior'].includes(seniority)) return { ok: false, error: 'seniority deve ser: any|junior|pleno|senior.' };
  if (!['any', 'clt', 'pj', 'estagio', 'temporario'].includes(contractType)) return { ok: false, error: 'contractType inválido.' };
  if (!['score', 'title', 'site', 'recency'].includes(sortBy)) return { ok: false, error: 'sortBy inválido.' };
  if (!['asc', 'desc'].includes(sortDir)) return { ok: false, error: 'sortDir inválido.' };
  if (!['any', 'pt', 'en'].includes(language)) return { ok: false, error: 'language inválido.' };
  if (!Number.isFinite(keywordLimit) || keywordLimit < 10 || keywordLimit > 60) return { ok: false, error: 'keywordLimit deve ser entre 10 e 60.' };

  return { ok: true, value: { resumeText, location, locations, extraQuery, maxResultsPerSite: Math.floor(maxResultsPerSiteNum), minScore: minScoreNum, page: Math.floor(pageNum), pageSize: Math.floor(pageSizeNum), remoteOnly, seniority, contractType, sortBy, sortDir, includeKeywords, excludeKeywords, includeSites, excludeSites, language, keywordLimit } };
}

function normalizeCsv(value, max) { return String(value).split(',').map((v) => normalize(v)).filter(Boolean).slice(0, max); }
function createRequestId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
function getClientId(request) { return request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || 'anonymous'; }
function cleanupRateLimits() { const now = Date.now(); for (const [k,v] of rateLimits.entries()) if (now - v.windowStart > RATE_LIMIT_WINDOW_MS * 2) rateLimits.delete(k); }
function checkRateLimit(clientId) { const now = Date.now(); const e = rateLimits.get(clientId) || { count: 0, windowStart: now }; if (now - e.windowStart > RATE_LIMIT_WINDOW_MS) { e.count = 0; e.windowStart = now; } e.count += 1; rateLimits.set(clientId, e); return e.count <= RATE_LIMIT_MAX_REQUESTS; }
function remainingRateLimit(request) { const clientId = getClientId(request); const e = rateLimits.get(clientId); if (!e) return RATE_LIMIT_MAX_REQUESTS; return Math.max(0, RATE_LIMIT_MAX_REQUESTS - e.count); }
function withStdHeaders(response, requestId, request) { const h = new Headers(response.headers); h.set('x-rate-limit-limit', String(RATE_LIMIT_MAX_REQUESTS)); h.set('x-rate-limit-remaining', String(remainingRateLimit(request))); h.set('x-request-id', requestId); h.set('x-worker-version', VERSION); return new Response(response.body, { status: response.status, headers: h }); }

function filterSites(includeSites, excludeSites) { let list = [...SITES]; if (includeSites.length) list = list.filter((s) => includeSites.some((k) => normalize(s.name).includes(k) || normalize(s.domain).includes(k))); if (excludeSites.length) list = list.filter((s) => !excludeSites.some((k) => normalize(s.name).includes(k) || normalize(s.domain).includes(k))); return list; }
function buildCacheKey(input, keywords, activeSites, locations) { return [VERSION, input.location, locations.join('|'), input.extraQuery, input.maxResultsPerSite, input.minScore, input.remoteOnly, input.seniority, input.contractType, input.sortBy, input.sortDir, input.includeKeywords.join('|'), input.excludeKeywords.join('|'), input.includeSites.join('|'), input.excludeSites.join('|'), input.language, input.keywordLimit, activeSites.map((s) => s.domain).join('|'), keywords.slice(0, 12).join('|')].map(normalize).join('::'); }
function getCache(key) { const e = memoryCache.get(key); if (!e) return null; if (Date.now() - e.timestamp > CACHE_TTL_MS) { memoryCache.delete(key); return null; } return e.payload; }
function setCache(key, payload) { memoryCache.set(key, { timestamp: Date.now(), payload }); }
function cleanupCache() { const now = Date.now(); for (const [k,v] of memoryCache.entries()) if (now - v.timestamp > CACHE_TTL_MS) memoryCache.delete(k); }

function markSiteFailure(siteName) { siteFailures.set(siteName, Date.now()); }
function cleanupSiteFailures() { const now = Date.now(); for (const [k,ts] of siteFailures.entries()) if (now - ts > SITE_COOLDOWN_MS) siteFailures.delete(k); }
function isInCooldown(siteName) { const ts = siteFailures.get(siteName); return Boolean(ts && (Date.now() - ts < SITE_COOLDOWN_MS)); }

async function mapWithConcurrency(items, concurrency, mapper) { const results = new Array(items.length); let cur = 0; async function loop() { while (cur < items.length) { const i = cur; cur += 1; results[i] = await mapper(items[i], i); } } await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => loop())); return results; }

async function searchSite(site, input, keywords, locations) {
  if (isInCooldown(site.name)) { metrics.siteCooldownSkips += 1; return { ok: false, site: site.name, skippedByCooldown: true, error: 'Site em cooldown temporário por falhas recentes.', count: 0, elapsedMs: 0, results: [] }; }
  const start = Date.now();
  try {
    const multiRaw = [];
    for (const loc of locations) {
      const q = `${keywords.slice(0, 12).join(' ')} ${input.extraQuery} "${loc}"`.trim();
      const raw = await searchDuck(site.domain, q, input.maxResultsPerSite, input.language);
      multiRaw.push(...raw.results);
    }
    const scored = multiRaw.map((item) => { const scoreBreakdown = computeScoreBreakdown(item, keywords, input); return { site: site.name, title: item.title, url: item.url, snippet: item.snippet, score: scoreBreakdown.total, scoreBreakdown }; });
    return { ok: true, site: site.name, count: scored.length, elapsedMs: Date.now() - start, results: scored };
  } catch (error) {
    metrics.upstreamErrors += 1;
    markSiteFailure(site.name);
    return { ok: false, site: site.name, count: 0, elapsedMs: Date.now() - start, error: String(error.message || error), results: [] };
  }
}

async function searchDuck(domain, query, maxResults, language) {
  const langHint = language === 'pt' ? ' idioma português brasil' : language === 'en' ? ' english language' : '';
  const ddgQuery = `site:${domain} ("vaga" OR "jobs" OR "emprego") ${query}${langHint}`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(ddgQuery)}`;
  const html = await fetchWithRetry(url, FETCH_RETRIES);
  return { results: parseDdgResults(html).slice(0, maxResults) };
}

async function fetchWithRetry(url, retries) { let lastErr = null; for (let i = 0; i <= retries; i += 1) { let timeoutId; try { const c = new AbortController(); timeoutId = setTimeout(() => c.abort('timeout'), FETCH_TIMEOUT_MS); const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 JobFinderWorker' }, signal: c.signal }); clearTimeout(timeoutId); if (!r.ok) throw new Error(`DuckDuckGo HTTP ${r.status}`); return await r.text(); } catch (e) { if (timeoutId) clearTimeout(timeoutId); lastErr = e; if (i < retries) await sleep(250 * (i + 1)); } } throw lastErr || new Error('Falha de rede'); }

function parseDdgResults(html) { const results = []; const blocks = html.split('<div class="result').slice(1); for (const block of blocks) { const t = block.match(/class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i); if (!t) continue; const url = normalizeUrl(extractDdgUrl(decodeHtml(t[1]))); if (!url || !isLikelyJobUrl(url)) continue; const title = trimText(stripHtml(decodeHtml(t[2])), 180); const s = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\//i); const snippet = trimText(s ? stripHtml(decodeHtml(s[1])) : '', 320); if (title.length < 6) continue; results.push({ title, url, snippet }); } return results; }
function normalizeUrl(url) { try { const p = new URL(url); ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach((k) => p.searchParams.delete(k)); return p.toString(); } catch (_e) { return url; } }
function isLikelyJobUrl(url) { const n = normalize(url); const pos = ['vaga','vagas','job','jobs','carreira','career','oportunidade','emprego']; const neg = ['/blog','/artigo','/noticia','/about','/sobre','/privacy','/politica']; if (neg.some((k) => n.includes(k))) return false; return pos.some((k) => n.includes(k)); }
function extractDdgUrl(rawUrl) { try { if (rawUrl.startsWith('http')) return rawUrl; const p = new URL(rawUrl, 'https://html.duckduckgo.com'); if (p.pathname.startsWith('/l/')) return p.searchParams.get('uddg') || ''; } catch (_e) { return ''; } return ''; }

function extractKeywords(resumeText, topN) { const clean = normalizeForKeyword(resumeText); const tokens = clean.match(/[a-z][a-z0-9+.#-]{2,}/g) || []; const freq = new Map(); for (const token of tokens) { if (STOPWORDS.has(token) || /^\d+$/.test(token) || /^[a-f0-9]{8,}$/.test(token)) continue; freq.set(token, (freq.get(token) || 0) + 1); } return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, topN).map(([t]) => t); }
function expandKeywords(keywords) { const out = new Set(keywords); for (const kw of keywords) { (KEYWORD_EXPANSIONS[kw] || []).forEach((x) => out.add(x)); } return [...out].slice(0, 80); }

function computeScoreBreakdown(result, keywords, input) {
  const text = normalize(`${result.title} ${result.snippet}`);
  const title = normalize(result.title);
  const loc = normalize(input.location);
  let keywordMatches = 0; let titleMatches = 0;
  for (const kw of keywords) { if (text.includes(kw)) keywordMatches += 1; if (title.includes(kw)) titleMatches += 1; }
  const locationBoost = loc && text.includes(loc) ? 3 : 0;
  const jobIntentBoost = /\b(vaga|job|jobs|emprego|career)\b/i.test(text) ? 2 : 0;
  const remoteBoost = /\b(remote|remoto|home office|hibrido|híbrido)\b/i.test(text) ? 2 : 0;
  const recencyBoost = /\b(hoje|recente|new|posted|dias|day|day ago)\b/i.test(text) ? 1.5 : 0;
  const salaryBoost = /\b(r\$|salario|salário|beneficios|benefícios)\b/i.test(text) ? 1 : 0;
  const seniorityBoost = getSeniorityBoost(text, input.seniority);
  const contractBoost = getContractBoost(text, input.contractType);
  const includeBoost = input.includeKeywords.filter((k) => text.includes(k)).length * 1.2;
  const excludePenalty = input.excludeKeywords.filter((k) => text.includes(k)).length * 4;
  const total = keywordMatches + (titleMatches * 1.8) + locationBoost + jobIntentBoost + remoteBoost + recencyBoost + salaryBoost + seniorityBoost + contractBoost + includeBoost - excludePenalty;
  return { keywordMatches, titleMatches, locationBoost, jobIntentBoost, remoteBoost, recencyBoost, salaryBoost, seniorityBoost, contractBoost, includeBoost, excludePenalty, total, recencyHint: recencyBoost > 0 ? 1 : 0 };
}

function getSeniorityBoost(text, seniority) { if (seniority === 'any') return 0; if (seniority === 'junior' && /\b(jr|junior|trainee|estagio|estágio)\b/i.test(text)) return 2; if (seniority === 'pleno' && /\b(pleno|mid|middle)\b/i.test(text)) return 2; if (seniority === 'senior' && /\b(sr|senior|lead|especialista)\b/i.test(text)) return 2; return -1; }
function getContractBoost(text, contractType) { if (contractType === 'any') return 0; if (contractType === 'clt' && /\b(clt)\b/i.test(text)) return 1.5; if (contractType === 'pj' && /\b(pj|pessoa juridica|pessoa jurídica)\b/i.test(text)) return 1.5; if (contractType === 'estagio' && /\b(estagio|estágio|intern)\b/i.test(text)) return 1.5; if (contractType === 'temporario' && /\b(temporario|temporário|temporary)\b/i.test(text)) return 1.5; return -0.5; }

function applyFilters(results, input) { return results.filter((r) => { if (r.score < input.minScore) return false; const text = normalize(`${r.title} ${r.snippet}`); if (input.remoteOnly && !/\b(remote|remoto|home office|hibrido|híbrido)\b/i.test(text)) return false; if (input.seniority !== 'any' && getSeniorityBoost(text, input.seniority) < 0) return false; if (input.contractType !== 'any' && getContractBoost(text, input.contractType) < 0) return false; if (input.includeKeywords.length && !input.includeKeywords.some((k) => text.includes(k))) return false; if (input.excludeKeywords.some((k) => text.includes(k))) return false; return true; }); }

function sortResults(results, sortBy, sortDir) { const sign = sortDir === 'asc' ? 1 : -1; const arr = [...results]; arr.sort((a, b) => { let base = 0; if (sortBy === 'score') base = a.score - b.score; if (sortBy === 'title') base = a.title.localeCompare(b.title); if (sortBy === 'site') base = a.site.localeCompare(b.site); if (sortBy === 'recency') base = (a.scoreBreakdown?.recencyHint || 0) - (b.scoreBreakdown?.recencyHint || 0); if (base === 0) base = a.url.localeCompare(b.url); return base * sign; }); return arr; }
function summarizeResults(results) { const bySite = {}; for (const r of results) bySite[r.site] = (bySite[r.site] || 0) + 1; return { count: results.length, bySite, topTitles: results.slice(0, 3).map((r) => r.title) }; }
function buildWarnings(siteResults, activeSites, sorted) { const w = siteResults.filter((s) => !s.ok).map((s) => `${s.site}: ${s.error}`).slice(0, 20); if (!activeSites.length) w.push('Nenhum site ativo após filtros include/exclude.'); if (!sorted.length) w.push('Nenhum resultado para os filtros atuais.'); return w; }
function buildPagination(total, page, pageSize) { return { page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)), hasNext: page * pageSize < total, hasPrev: page > 1, startIndex: total ? (page - 1) * pageSize + 1 : 0, endIndex: Math.min(page * pageSize, total) }; }
function makeResultId(r, index) { return `${normalize(r.site).slice(0,8)}-${index + 1}-${Math.abs(hashCode(r.url)).toString(36)}`; }
function confidenceFromScore(score) { if (score >= 20) return 'high'; if (score >= 10) return 'medium'; return 'low'; }
function hashCode(str) { let h = 0; for (let i = 0; i < str.length; i += 1) h = ((h << 5) - h) + str.charCodeAt(i); return h | 0; }

function paginate(results, page, pageSize) { const start = (page - 1) * pageSize; return results.slice(start, start + pageSize); }
function rankAndDedupe(results) { const d = new Map(); for (const r of results) { const k = normalize(r.url).replace(/\/$/, ''); const e = d.get(k); if (!e || r.score > e.score) d.set(k, r); } return [...d.values()].sort((a, b) => b.score - a.score || a.title.localeCompare(b.title) || a.url.localeCompare(b.url)); }
function trimText(text, maxLen) { if (!text) return ''; return text.length <= maxLen ? text : `${text.slice(0, maxLen - 1)}…`; }
function normalize(text) { return normalizeForKeyword(text).replace(/\s+/g, ' ').trim(); }
function normalizeForKeyword(text) { return (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
function stripHtml(value) { return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function decodeHtml(value) { return value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#x2F;', '/').replaceAll('&#x3D;', '=').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>'); }
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function corsHeaders() { return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }; }
function respond(payload, requestId, request, status = 200) { return withStdHeaders(new Response(JSON.stringify({ ...payload, version: VERSION, requestId }, null, 2), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...corsHeaders() } }), requestId, request); }
