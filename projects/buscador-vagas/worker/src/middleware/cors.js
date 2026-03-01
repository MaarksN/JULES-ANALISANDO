// Middleware de CORS aplicado em todas as respostas.
function resolveAllowedOrigin(request, env) {
  const requestOrigin = request?.headers?.get('Origin') || '';
  const allowlist = String(env?.CORS_ALLOWED_ORIGINS || '*')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (!allowlist.length || allowlist.includes('*')) return '*';
  return allowlist.includes(requestOrigin) ? requestOrigin : allowlist[0];
}

export function corsHeaders(request, env) {
  return {
    'Access-Control-Allow-Origin': resolveAllowedOrigin(request, env),
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Tenant-Id,X-Api-Key',
    'Access-Control-Max-Age': '86400'
  };
}

export function corsMiddleware(request, env) {
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}

export function withCors(response, request, env) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders(request, env)).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, headers });
}
