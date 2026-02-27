// Gera um identificador único de requisição.
export function createRequestId() {
  return `req_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
