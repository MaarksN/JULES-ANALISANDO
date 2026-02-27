const queryEl = document.getElementById('query');
const statusEl = document.getElementById('status');
const jobsEl = document.getElementById('jobs');
const historyEl = document.getElementById('history');

function setStatus(msg, err = false) {
  statusEl.textContent = msg;
  statusEl.style.color = err ? '#d32f2f' : '#1b5e20';
}

async function getWorkerUrl() {
  const { workerUrl } = await chrome.storage.local.get(['workerUrl']);
  return String(workerUrl || '').replace(/\/+$/, '');
}

async function loadHistory() {
  const { savedSearches = [] } = await chrome.storage.local.get(['savedSearches']);
  historyEl.innerHTML = savedSearches.slice(0, 5).map((item) => `<li>${item.query}</li>`).join('');
}

async function saveSearch(query) {
  const { savedSearches = [] } = await chrome.storage.local.get(['savedSearches']);
  await chrome.storage.local.set({
    savedSearches: [{ query, lastChecked: new Date().toISOString() }, ...savedSearches.filter((s) => s.query !== query)].slice(0, 5)
  });
}

async function runSearch() {
  const workerUrl = await getWorkerUrl();
  if (!workerUrl) return setStatus('Configure a URL do Worker em Opções.', true);

  const query = queryEl.value.trim();
  if (!query) return setStatus('Digite um termo para buscar.', true);

  const response = await fetch(`${workerUrl}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, pageSize: 3, sortBy: 'score', sortDir: 'desc' })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Falha na busca: ${error.slice(0, 120)}`);
  }

  const data = await response.json();
  const warnings = data.warnings?.length ? ` (${data.warnings.length} avisos)` : '';
  jobsEl.innerHTML = (data.results || []).slice(0, 3).map((job) => (
    `<li>${job.title} <button data-url="${job.url}">Abrir</button> <button data-f="${job.id}">Favoritar</button></li>`
  )).join('');

  jobsEl.querySelectorAll('button[data-url]').forEach((btn) => {
    btn.addEventListener('click', () => chrome.tabs.create({ url: btn.dataset.url }));
  });

  jobsEl.querySelectorAll('button[data-f]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const job = (data.results || []).find((item) => item.id === btn.dataset.f);
      if (!job) return;
      const favoriteResp = await fetch(`${workerUrl}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      });
      if (!favoriteResp.ok) return setStatus('Falha ao favoritar vaga.', true);
      setStatus('Vaga adicionada aos favoritos.');
    });
  });

  await saveSearch(query);
  await loadHistory();
  setStatus(`Busca concluída com ${(data.results || []).length} vagas${warnings}.`);
}

document.getElementById('search').addEventListener('click', () => runSearch().catch((e) => setStatus(e.message, true)));
loadHistory();
