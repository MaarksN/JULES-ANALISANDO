import { SITES } from '../config.js';
import { withJson } from './shared.js';

export function handleSites(_request, _env, requestId) {
  return withJson({ count: SITES.length, sites: SITES }, 200, requestId);
}
