import { normalizeToken, sanitizeText } from '../utils/sanitize.js';
import { withJson } from './shared.js';

export async function handleNormalize(request, _env, requestId) {
  const body = await request.json();
  return withJson({ normalizedText: normalizeToken(sanitizeText(body.text || '', 5000)) }, 200, requestId);
}
