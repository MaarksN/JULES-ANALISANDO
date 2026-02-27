// Paginação padrão da API.
export function paginate(items, page = 1, pageSize = 20) {
  const safeSize = Math.min(50, Math.max(1, Number(pageSize || 20)));
  const totalPages = Math.max(1, Math.ceil(items.length / safeSize));
  const safePage = Math.min(totalPages, Math.max(1, Number(page || 1)));
  const start = (safePage - 1) * safeSize;
  const results = items.slice(start, start + safeSize);
  return {
    results,
    page: safePage,
    pageSize: safeSize,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
    startIndex: items.length ? start : 0,
    endIndex: Math.min(start + safeSize, items.length)
  };
}
