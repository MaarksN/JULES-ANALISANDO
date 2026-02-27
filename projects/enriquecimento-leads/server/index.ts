import { createServer } from 'node:http';
import { config } from './config';
import { handleAIRequest } from './routes/ai';

const server = createServer(async (req, res) => {
  if (!req.url) return res.end();
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.url.startsWith('/api/ai/')) {
    await handleAIRequest(req, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(config.port, () => {
  console.log(`[server] listening on http://localhost:${config.port}`);
});
