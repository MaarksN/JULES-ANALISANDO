const workerUrl = document.getElementById('workerUrl');
const msg = document.getElementById('msg');

function setMsg(text, isError = false) {
  msg.textContent = text;
  msg.style.color = isError ? '#d32f2f' : '#1b5e20';
}

async function load() {
  const data = await chrome.storage.local.get(['workerUrl']);
  workerUrl.value = data.workerUrl || '';
}

async function healthCheck(url) {
  const response = await fetch(`${url.replace(/\/+$/, '')}/health`);
  if (!response.ok) throw new Error('Health check falhou');
  const data = await response.json();
  if (data.status !== 'ok') throw new Error('Worker não respondeu status ok');
}

document.getElementById('save').addEventListener('click', async () => {
  const value = workerUrl.value.trim();
  if (!/^https:\/\/.+/.test(value)) return setMsg('URL inválida.', true);

  try {
    await healthCheck(value);
    await chrome.storage.local.set({ workerUrl: value });
    setMsg('Salvo com sucesso e Worker validado.');
  } catch {
    setMsg('Não foi possível validar o Worker em /health.', true);
  }
});

document.getElementById('export').addEventListener('click', async () => {
  const data = await chrome.storage.local.get(null);
  await navigator.clipboard.writeText(JSON.stringify(data));
  setMsg('Configuração copiada.');
});

document.getElementById('import').addEventListener('click', async () => {
  const raw = prompt('Cole o JSON exportado');
  if (!raw) return;
  try {
    await chrome.storage.local.set(JSON.parse(raw));
    await load();
    setMsg('Importado.');
  } catch {
    setMsg('JSON inválido.', true);
  }
});

load();
