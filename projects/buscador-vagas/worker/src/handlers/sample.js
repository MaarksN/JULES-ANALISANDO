import { sampleRequest } from '../config.js';
import { withJson } from './shared.js';

export function handleSample(_request, _env, requestId) {
  return withJson({ sample: sampleRequest() }, 200, requestId);
}
