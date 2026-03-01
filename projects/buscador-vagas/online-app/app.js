const STORAGE_KEY = 'jobfinder-online-settings-v6';
const FAVORITES_KEY = 'jobfinder-favorites-v1';
const LAST_SUMMARY_KEY = 'jobfinder-last-summary-v1';
const SEARCH_TIMEOUT_MS = 20000;
const SEARCH_RETRY_LIMIT = 1;

const STORAGE_KEY = 'buscador-vagas-online-v3';
const HEALTH_CACHE_KEY = 'buscador-worker-health-cache-v1';
const els = {
  apiUrl: $('apiUrl'), resumeText: $('resumeText'), location: $('location'), locations: $('locations'), maxResults: $('maxResults'), keywordLimit: $('keywordLimit'),
  extraQuery: $('extraQuery'), minScore: $('minScore'), pageSize: $('pageSize'), seniority: $('seniority'), contractType: $('contractType'), language: $('language'),
  sortBy: $('sortBy'), sortDir: $('sortDir'), includeSites: $('includeSites'), excludeSites: $('excludeSites'),
  includeKeywords: $('includeKeywords'), excludeKeywords: $('excludeKeywords'), remoteOnly: $('remoteOnly'), autoRefresh: $('autoRefresh'),
  status: $('status'), siteStats: $('siteStats'), results: $('results'), favorites: $('favorites'), warnings: $('warnings'), diagnostics: $('diagnostics'),
  searchBtn: $('searchBtn'), cancelSearchBtn: $('cancelSearchBtn'), healthBtn: $('healthBtn'), prevPageBtn: $('prevPageBtn'), nextPageBtn: $('nextPageBtn'),
  openTopBtn: $('openTopBtn'), bookmarkBtn: $('bookmarkBtn'), downloadBtn: $('downloadBtn'), csvBtn: $('csvBtn'), copyBtn: $('copyBtn'),
  exportSettingsBtn: $('exportSettingsBtn'), importSettingsBtn: $('importSettingsBtn'), importSettingsFile: $('importSettingsFile'), clearSettingsBtn: $('clearSettingsBtn'),
  shareBtn: $('shareBtn'), resultFilter: $('resultFilter'),
};

let page = 1;
let lastResults = [];
let lastPayload = null;
let currentPage = 1;
let autoRefreshTimer = null;
let currentSearchController = null;
let isSearching = false;
let currentAttempt = 0;
let saveSettingsTimer = null;
let allRenderedResults = [];

function setStatus(msg, isError = false) {
  els.status.textContent = msg;
  els.status.style.color = isError ? '#c62828' : '#222';
}

function setBusyState(busy) {
  isSearching = busy;
  els.searchBtn.disabled = busy;
  els.cancelSearchBtn.disabled = !busy;
  els.healthBtn.disabled = busy;
  els.prevPageBtn.disabled = busy || !(lastPayload?.pagination?.hasPrev);
  els.nextPageBtn.disabled = busy || !(lastPayload?.pagination?.hasNext);
}

function safeHttpUrl(url) {
  try {
    const parsed = new URL(String(url || '').trim());
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null;
  } catch (_e) {
    return null;
  }
}

function createExternalLink(url) {
  const parsed = safeHttpUrl(url);
  if (!parsed) {
    const invalid = document.createElement('span');
    invalid.className = 'small invalid-url';
    invalid.textContent = 'URL inválida';
    invalid.title = String(url || '');
    return invalid;
  }

  const link = document.createElement('a');
  link.href = parsed;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = parsed;
  return link;
}

function validateApiUrl(url) {
  const parsed = safeHttpUrl(url);
  if (!parsed) return { ok: false, error: 'URL da API inválida. Use http(s)://.../search' };
  if (!/\/search\/?$/i.test(parsed)) return { ok: false, error: 'URL da API deve terminar com /search.' };
  return { ok: true, value: parsed };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function autoSaveSettingsDebounced() {
  if (saveSettingsTimer) clearTimeout(saveSettingsTimer);
  saveSettingsTimer = setTimeout(() => saveSettings(), 350);
}

function attachSettingsAutosave() {
  const ids = [
    'apiUrl','resumeText','location','locations','maxResults','keywordLimit','extraQuery','minScore','pageSize','seniority','contractType','language',
    'sortBy','sortDir','includeSites','excludeSites','includeKeywords','excludeKeywords','remoteOnly','autoRefresh',
  ];
  ids.forEach((id) => {
    const el = $(id);
    if (!el) return;
    const eventName = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(eventName, autoSaveSettingsDebounced);
  });
}

function collectSettings() {
  return {
    apiUrl: els.apiUrl.value.trim(),
    resumeText: els.resumeText.value.trim(),
    location: els.location.value.trim(),
    locations: els.locations.value.trim(),
    extraQuery: els.extraQuery.value.trim(),
    maxResultsPerSite: Number(els.maxResults.value || 8),
    keywordLimit: Number(els.keywordLimit.value || 30),
    minScore: Number(els.minScore.value || 0),
    page: currentPage,
    pageSize: Number(els.pageSize.value || 20),
    remoteOnly: els.remoteOnly.checked,
    autoRefresh: els.autoRefresh.checked,
    seniority: els.seniority.value,
    contractType: els.contractType.value,
    language: els.language.value,
    sortBy: els.sortBy.value,
    sortDir: els.sortDir.value,
    includeKeywords: els.includeKeywords.value.trim(),
    excludeKeywords: els.excludeKeywords.value.trim(),
    includeSites: els.includeSites.value.trim(),
    excludeSites: els.excludeSites.value.trim(),
  };
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collectSettings()));
}

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    els.apiUrl.value = s.apiUrl || '';
    els.resumeText.value = s.resumeText || '';
    els.location.value = s.location || 'Ribeirão Preto, SP';
    els.locations.value = s.locations || '';
    els.extraQuery.value = s.extraQuery || '';
    els.maxResults.value = s.maxResultsPerSite || 8;
    els.keywordLimit.value = s.keywordLimit || 30;
    els.minScore.value = s.minScore || 0;
    els.pageSize.value = s.pageSize || 20;
    els.remoteOnly.checked = !!s.remoteOnly;
    els.autoRefresh.checked = !!s.autoRefresh;
    els.seniority.value = s.seniority || 'any';
    els.contractType.value = s.contractType || 'any';
    els.language.value = s.language || 'any';
    els.sortBy.value = s.sortBy || 'score';
    els.sortDir.value = s.sortDir || 'desc';
    els.includeKeywords.value = s.includeKeywords || '';
    els.excludeKeywords.value = s.excludeKeywords || '';
    els.includeSites.value = s.includeSites || '';
    els.excludeSites.value = s.excludeSites || '';
  } catch (_e) {}
}

function persistLastSummary(payload) {
  const summary = {
    savedAt: new Date().toISOString(),
    totalResults: payload.totalResults,
    page: payload?.pagination?.page || 1,
    totalPages: payload?.pagination?.totalPages || 1,
    topTitles: payload?.resultSummary?.topTitles || [],
    warningsCount: (payload?.warnings || []).length,
  };
  localStorage.setItem(LAST_SUMMARY_KEY, JSON.stringify(summary));
}

function showLastSummaryHint() {
  try {
    const summary = JSON.parse(localStorage.getItem(LAST_SUMMARY_KEY) || '{}');
    if (!summary?.savedAt) return;
    setStatus(`Última busca salva: ${summary.totalResults || 0} vagas • p${summary.page || 1}/${summary.totalPages || 1} • avisos:${summary.warningsCount || 0} • ${summary.savedAt}`);
  } catch (_e) {}
}

function loadFavorites() {
  let favs = [];
  try { favs = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); } catch (_e) {}
  els.favorites.innerHTML = '';
  if (!favs.length) {
    const li = document.createElement('li');
    li.textContent = 'Sem favoritos salvos.';
    els.favorites.appendChild(li);
    return;
  }

  favs.forEach((f, i) => {
    const li = document.createElement('li');
    const title = document.createElement('b');
    title.textContent = `${i + 1}. ${f.title}`;
    const site = document.createElement('small');
    site.textContent = f.site;
    li.append(title, document.createElement('br'), site, document.createElement('br'), createExternalLink(f.url));
    els.favorites.appendChild(li);
  });
}

function renderWarnings(payload) {
  els.warnings.innerHTML = '';
  const warnings = payload?.warnings || [];
  if (!warnings.length) {
    const li = document.createElement('li');
    li.className = 'ok';
    li.textContent = 'Sem avisos nesta busca.';
    els.warnings.appendChild(li);
    return;
  }

  warnings.forEach((warning) => {
    const li = document.createElement('li');
    li.className = 'fail';
    li.textContent = warning;
    els.warnings.appendChild(li);
  });
}

function renderDiagnostics(payload) {
  els.diagnostics.innerHTML = '';
  const d = payload?.diagnostics;
  if (!d) return;

  const rows = [
    ['Sites ativos', (d.activeSites || []).join(', ') || 'n/a'],
    ['Pipeline', `raw:${d.rawCount || 0} • dedupe:${d.dedupedCount || 0} • filtrado:${d.filteredCount || 0}`],
    ['Score médio', String(d.avgScore ?? 0)],
  ];

  rows.forEach(([label, value]) => {
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = `${label}: `;
    const span = document.createElement('span');
    span.textContent = value;
    li.append(b, span);
    els.diagnostics.appendChild(li);
  });
}

function renderSiteStats(payload) {
  els.siteStats.innerHTML = '';
  (payload.siteStats || []).forEach((item) => {
    const li = document.createElement('li');
    li.className = item.ok ? 'ok' : 'fail';
    const title = document.createElement('b');
    title.textContent = item.site;
    const details = document.createElement('span');
    details.className = 'small';
    details.textContent = `${item.ok ? `OK • ${item.count} resultados` : `Falha • ${item.error || 'erro desconhecido'}`} ${item.skippedByCooldown ? '• cooldown' : ''}`;
    li.append(title, document.createElement('br'), details);
    els.siteStats.appendChild(li);
  });
}

function renderResultsList(results) {
  els.results.innerHTML = '';
  if (!results.length) {
    const li = document.createElement('li');
    li.textContent = 'Nenhuma vaga encontrada.';
    els.results.appendChild(li);
    return;
  }

  results.forEach((job, i) => {
    const b = job.scoreBreakdown || {};
    const li = document.createElement('li');
    const title = document.createElement('b');
    title.textContent = `${i + 1}. ${job.title}`;
    const meta = document.createElement('small');
    meta.textContent = `${job.site} • score ${Number(job.score).toFixed(1)}`;
    const snippet = document.createElement('small');
    snippet.textContent = job.snippet || 'Sem resumo.';
    const breakdown = document.createElement('span');
    breakdown.className = 'small';
    breakdown.textContent = `k:${b.keywordMatches ?? 0} • t:${b.titleMatches ?? 0} • loc:+${b.locationBoost ?? 0} • rem:+${b.remoteBoost ?? 0} • sal:+${b.salaryBoost ?? 0}`;

    li.append(
      title,
      document.createElement('br'),
      meta,
      document.createElement('br'),
      createExternalLink(job.url),
      document.createElement('br'),
      snippet,
      document.createElement('br'),
      breakdown,
    );
    els.results.appendChild(li);
  });
}

function applyLocalResultFilter() {
  const term = (els.resultFilter.value || '').trim().toLowerCase();
  if (!term) {
    renderResultsList(allRenderedResults);
    return;
  }
  const filtered = allRenderedResults.filter((r) => String(r.title || '').toLowerCase().includes(term));
  renderResultsList(filtered);
}

function toCsv(rows) {
  const header = ['site', 'title', 'url', 'score', 'snippet'];
  const all = [header, ...rows.map((r) => [r.site, r.title, r.url, String(r.score), r.snippet || ''])];
  return all.map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
}

function updateButtons(payload) {
  const has = !!(payload?.results?.length);
  els.openTopBtn.disabled = isSearching || !has;
  els.bookmarkBtn.disabled = isSearching || !has;
  els.downloadBtn.disabled = isSearching || !has;
  els.csvBtn.disabled = isSearching || !has;
  els.copyBtn.disabled = isSearching || !has;
  els.shareBtn.disabled = isSearching;
  els.prevPageBtn.disabled = isSearching || !(payload?.pagination?.hasPrev);
  els.nextPageBtn.disabled = isSearching || !(payload?.pagination?.hasNext);
}

async function fetchJsonWithTimeout(url, options, timeoutMs = SEARCH_TIMEOUT_MS) {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort('timeout'), timeoutMs);

  const parentSignal = options?.signal;
  if (parentSignal) {
    if (parentSignal.aborted) timeoutController.abort('parent_abort');
    parentSignal.addEventListener('abort', () => timeoutController.abort('parent_abort'), { once: true });
  }

  try {
    const response = await fetch(url, { ...options, signal: timeoutController.signal });
    let payload = {};
    try { payload = await response.json(); } catch (_e) {}
    return { response, payload };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function requestSearchWithRetry(apiUrl, body, signal) {
  let attempt = 0;
  let lastError = new Error('Falha desconhecida');

  while (attempt <= SEARCH_RETRY_LIMIT) {
    currentAttempt = attempt + 1;
    try {
      const { response, payload } = await fetchJsonWithTimeout(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      });

      if (response.ok) return payload;
      const message = payload?.error || `Falha HTTP ${response.status}`;
      if ((response.status === 429 || response.status >= 500) && attempt < SEARCH_RETRY_LIMIT) {
        await sleep(400 * (attempt + 1));
        attempt += 1;
        continue;
      }
      throw new Error(message);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (signal.aborted) throw new Error('search_aborted');
      if (attempt < SEARCH_RETRY_LIMIT) {
        await sleep(400 * (attempt + 1));
        attempt += 1;
        continue;
      }
      throw lastError;
    }
  }

  throw lastError;
}

async function runSearch() {
  const s = collectSettings();
  const validApi = validateApiUrl(s.apiUrl);
  if (!validApi.ok) return setStatus(validApi.error, true);
  if (!s.resumeText || s.resumeText.length < 30) return setStatus('Cole um currículo mais completo (>= 30 chars).', true);

  if (currentSearchController) currentSearchController.abort('new_search');
  currentSearchController = new AbortController();

  saveSettings();
  setBusyState(true);
  updateButtons(lastPayload);
  const startedAt = performance.now();
  setStatus('Buscando vagas... tentativa 1');

  try {
    const payload = await requestSearchWithRetry(validApi.value, s, currentSearchController.signal);
    lastPayload = payload;
    currentPage = Math.min(currentPage, payload?.pagination?.totalPages || currentPage);
    renderWarnings(payload);
    renderDiagnostics(payload);
    renderSiteStats(payload);
    allRenderedResults = payload.results || [];
    applyLocalResultFilter();
    updateButtons(payload);
    persistLastSummary(payload);

    const elapsedMs = Math.round(performance.now() - startedAt);
    setStatus(
      `OK: ${payload.totalResults} vagas\n` +
      `Página ${payload.pagination?.page || 1}/${payload.pagination?.totalPages || 1} (${payload.pagination?.startIndex || 0}-${payload.pagination?.endIndex || 0})\n` +
      `cache:${payload.fromCache ? 'sim' : 'não'} • v${payload.version || 'n/a'} • requestId:${payload.requestId || 'n/a'} • timing:${payload.timingMs || 0}ms • ui:${elapsedMs}ms\n` +
      `summary: ${(payload.resultSummary?.topTitles || []).join(' | ') || 'n/a'}\n` +
      `warnings: ${(payload.warnings || []).length} • tentativas:${currentAttempt}`,
    );
  } catch (err) {
    const message = String(err?.message || err);
    if (message.includes('search_aborted')) return;
    if (message.includes('timeout')) {
      setStatus(`Busca cancelada por timeout (${SEARCH_TIMEOUT_MS}ms).`, true);
    } else {
      setStatus(message, true);
    }
    updateButtons(null);
  } finally {
    setBusyState(false);
    currentSearchController = null;
    currentAttempt = 0;
  }
}

function cancelCurrentSearch() {
  if (!currentSearchController) return;
  currentSearchController.abort('manual_cancel');
  setStatus('Busca cancelada manualmente.');
}

async function checkHealth() {
  const apiValidation = validateApiUrl(els.apiUrl.value.trim());
  if (!apiValidation.ok) return setStatus(apiValidation.error, true);
  try {
    const base = apiValidation.value.replace(/\/search\/?$/, '');
    const [health, metrics, config, sites] = await Promise.all([
      fetch(`${base}/health`).then((r) => r.json()),
      fetch(`${base}/metrics`).then((r) => r.json()),
      fetch(`${base}/config`).then((r) => r.json()),
      fetch(`${base}/sites`).then((r) => r.json()),
    ]);

    const status = healthData.status === 'ok' ? 'online' : 'offline';
    const version = versionData.version || '-';
    setWorkerStatus(status, version);
    localStorage.setItem(HEALTH_CACHE_KEY, JSON.stringify({ status, version, checkedAt: Date.now() }));
  } catch {
    setWorkerStatus('offline', '-');
  }
}

function toggleAutoRefresh() {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  if (els.autoRefresh.checked) {
    autoRefreshTimer = setInterval(() => {
      if (!isSearching) runSearch();
    }, 60000);
  }
}

function copyShareLink() {
  const params = new URLSearchParams({
    apiUrl: els.apiUrl.value.trim(),
    location: els.location.value.trim(),
    q: els.extraQuery.value.trim(),
    remoteOnly: String(els.remoteOnly.checked),
    lang: els.language.value,
  });
  const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  navigator.clipboard.writeText(url)
    .then(() => setStatus('Link de compartilhamento copiado.'))
    .catch(() => setStatus('Não foi possível copiar link de compartilhamento.', true));
}

function hydrateFromQueryParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('apiUrl')) els.apiUrl.value = params.get('apiUrl') || '';
  if (params.has('location')) els.location.value = params.get('location') || '';
  if (params.has('q')) els.extraQuery.value = params.get('q') || '';
  if (params.has('lang')) els.language.value = params.get('lang') || 'any';
  if (params.has('remoteOnly')) els.remoteOnly.checked = params.get('remoteOnly') === 'true';
}

function exportSettings() {
  const blob = new Blob([JSON.stringify(collectSettings(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jobfinder-settings-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importSettingsFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const p = JSON.parse(String(reader.result || '{}'));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
      loadSettings();
      setStatus('Configurações importadas via arquivo.');
    } catch (_e) {
      setStatus('Arquivo de configurações inválido.', true);
    }
  };
  reader.readAsText(file);
}

els.searchBtn.addEventListener('click', async () => { currentPage = 1; await runSearch(); toggleAutoRefresh(); });
els.cancelSearchBtn.addEventListener('click', cancelCurrentSearch);
els.prevPageBtn.addEventListener('click', async () => { currentPage = Math.max(1, currentPage - 1); await runSearch(); });
els.nextPageBtn.addEventListener('click', async () => {
  const totalPages = lastPayload?.pagination?.totalPages || currentPage + 1;
  currentPage = Math.min(totalPages, currentPage + 1);
  await runSearch();
});
els.healthBtn.addEventListener('click', checkHealth);
els.autoRefresh.addEventListener('change', toggleAutoRefresh);
els.shareBtn.addEventListener('click', copyShareLink);
els.resultFilter.addEventListener('input', applyLocalResultFilter);

els.openTopBtn.addEventListener('click', () => {
  if (!lastPayload) return;
  let opened = 0;
  lastPayload.results.slice(0, 5).forEach((r) => {
    const safe = safeHttpUrl(r.url);
    if (!safe) return;
    window.open(safe, '_blank', 'noopener,noreferrer');
    opened += 1;
  });
  setStatus(`Abertas ${opened} abas com URLs válidas.`);
});

els.bookmarkBtn.addEventListener('click', () => {
  if (!lastPayload) return;
  const top = lastPayload.results.slice(0, 3).map((r) => ({ title: r.title, site: r.site, url: r.url }));
  let old = [];
  try { old = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); } catch (_e) {}
  const merged = [...top, ...old].filter((v, i, arr) => arr.findIndex((x) => x.url === v.url) === i).slice(0, 30);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(merged));
  loadFavorites();
  setStatus('Favoritos atualizados com Top 3.');
});

els.downloadBtn.addEventListener('click', () => {
  if (!lastPayload) return;
  const blob = new Blob([JSON.stringify(lastPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vagas-online-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

els.csvBtn.addEventListener('click', () => {
  if (!lastPayload) return;
  const csv = toCsv(lastPayload.results || []);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vagas-online-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

els.copyBtn.addEventListener('click', async () => {
  if (!lastPayload) return;
  try {
    await navigator.clipboard.writeText(JSON.stringify(lastPayload, null, 2));
    setStatus('JSON copiado.');
  } catch (_e) {
    setStatus('Falha ao copiar JSON.', true);
  }
});

els.exportSettingsBtn.addEventListener('click', exportSettings);
els.importSettingsBtn.addEventListener('click', () => els.importSettingsFile.click());
els.importSettingsFile.addEventListener('change', (event) => importSettingsFromFile(event.target.files?.[0]));

els.clearSettingsBtn.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(FAVORITES_KEY);
  localStorage.removeItem(LAST_SUMMARY_KEY);
  loadSettings();
  loadFavorites();
  renderWarnings({ warnings: [] });
  els.diagnostics.innerHTML = '';
  els.resultFilter.value = '';
  setStatus('Configurações e favoritos limpos.');
});

document.addEventListener('keydown', async (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    currentPage = 1;
    await runSearch();
  }
});

loadSettings();
hydrateFromQueryParams();
loadFavorites();
attachSettingsAutosave();
renderWarnings({ warnings: [] });
showLastSummaryHint();
updateButtons(null);
