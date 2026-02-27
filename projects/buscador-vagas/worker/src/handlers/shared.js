import { corsHeaders } from '../middleware/cors.js';

export function withJson(payload, status = 200, requestId = 'unknown', extraHeaders = {}) {
  return new Response(JSON.stringify({ ...payload, requestId }, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      ...corsHeaders(),
      ...extraHeaders
    }
  });
}

export function withProblem({ title, detail, status = 500, type = 'about:blank', code = 'internal_error', instance = null }, requestId = 'unknown', extraHeaders = {}) {
  return new Response(JSON.stringify({ type, title, status, detail, code, instance, requestId }, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/problem+json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      ...corsHeaders(),
      ...extraHeaders
    }
  });
}
