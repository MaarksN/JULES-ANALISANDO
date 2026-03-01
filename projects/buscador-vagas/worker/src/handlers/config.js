import { getRuntimeConfig, SITES } from '../config.js';
import { withJson } from './shared.js';

export function handleConfig(_request, env, requestId) {
  return withJson({ config: getRuntimeConfig(env), sites: SITES }, 200, requestId);
}
