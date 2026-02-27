import { validateSearchPayload } from './search.js';
import { withJson } from './shared.js';

export async function handleValidate(request, _env, requestId) {
  const body = await request.json();
  const errors = validateSearchPayload(body);
  return withJson({ ok: errors.length === 0, errors }, errors.length ? 400 : 200, requestId);
}
