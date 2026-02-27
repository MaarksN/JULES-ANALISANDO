import { withProblem } from '../handlers/shared.js';

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function readAdminTokens(env) {
  return String(env.ADMIN_TOKENS || env.ADMIN_TOKEN || '')
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);
}

// Middleware de autenticação para rotas administrativas.
export function requireAdminAuth(request, env, requestId = 'unknown') {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const validTokens = readAdminTokens(env);

  if (!token || !validTokens.length || !validTokens.some((known) => timingSafeEqual(token, known))) {
    return withProblem({
      status: 401,
      title: 'Unauthorized',
      detail: 'Token admin inválido ou ausente',
      code: 'admin_auth_invalid'
    }, requestId);
  }
  return null;
}
