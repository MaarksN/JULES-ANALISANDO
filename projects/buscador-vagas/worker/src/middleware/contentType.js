// Garante JSON em rotas POST.
export function requireJson(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Content-Type deve ser application/json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return null;
}
