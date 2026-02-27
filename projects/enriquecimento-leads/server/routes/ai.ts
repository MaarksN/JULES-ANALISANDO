import { IncomingMessage, ServerResponse } from 'node:http';
import {
  analyzeVisualWithGemini,
  deepReasonWithGemini,
  enrichWithGemini,
  executeToolWithGemini,
  salesKitWithGemini,
  searchLeadsWithGemini,
  transcribeWithGemini,
  ttsWithGemini,
} from '../services/gemini';

const requestsByIp = new Map<string, number[]>();

const parseBody = async (req: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf-8') || '{}';
  return JSON.parse(raw);
};

const rateLimit = (ip: string) => {
  const now = Date.now();
  const windowStart = now - 60000;
  const hits = (requestsByIp.get(ip) || []).filter((ts) => ts > windowStart);
  if (hits.length >= 10) return false;
  hits.push(now);
  requestsByIp.set(ip, hits);
  return true;
};

const send = (res: ServerResponse, status: number, payload: unknown, headers: Record<string, string> = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(payload));
};

const isString = (v: unknown) => typeof v === 'string' && v.trim().length > 0;

export const handleAIRequest = async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method !== 'POST' || !req.url) return send(res, 405, { error: 'Method not allowed' });
  const ip = req.socket.remoteAddress || 'unknown';
  if (!rateLimit(ip)) return send(res, 429, { error: 'Too many requests. Try again in 60 seconds.' }, { 'Retry-After': '60' });

  try {
    const body = await parseBody(req);
    if (req.url.endsWith('/search-leads')) {
      if (!isString(body.sector) || !isString(body.location) || !isString(body.keywords) || !isString(body.size) || typeof body.quantity !== 'number') {
        return send(res, 400, { error: 'Invalid body' });
      }
      return send(res, 200, { data: await searchLeadsWithGemini(body) });
    }

    if (req.url.endsWith('/sales-kit')) {
      if (!isString(body.companyName) || !isString(body.sector)) return send(res, 400, { error: 'Invalid body' });
      return send(res, 200, { data: await salesKitWithGemini(body.companyName, body.sector) });
    }

    if (req.url.endsWith('/enrich')) {
      if (!isString(body.companyName)) return send(res, 400, { error: 'Invalid body' });
      return send(res, 200, { data: await enrichWithGemini(body.companyName, body.location) });
    }

    if (req.url.endsWith('/execute-tool')) return send(res, 200, { data: await executeToolWithGemini(body.prompt, body.systemRole || '') });
    if (req.url.endsWith('/thinking')) return send(res, 200, { data: await deepReasonWithGemini(body.query) });
    if (req.url.endsWith('/tts')) return send(res, 200, { data: await ttsWithGemini(body.text) });
    if (req.url.endsWith('/transcribe')) return send(res, 200, { data: await transcribeWithGemini(body.base64Audio, body.mimeType) });
    if (req.url.endsWith('/analyze-visual')) return send(res, 200, { data: await analyzeVisualWithGemini(body.base64Data, body.mimeType, body.prompt) });

    return send(res, 404, { error: 'Not found' });
  } catch {
    return send(res, 500, { error: 'Internal server error' });
  }
};
