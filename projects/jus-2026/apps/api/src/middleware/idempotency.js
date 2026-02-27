const CACHE_TTL_MS = Number(process.env.IDEMPOTENCY_TTL_MS || 10 * 60 * 1000);
const cache = new Map();

const pruneExpired = () => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
        if (value.expiresAt <= now) {
            cache.delete(key);
        }
    }
};

export const idempotency = (req, res, next) => {
    pruneExpired();

    const headerKey = req.get('idempotency-key');
    if (!headerKey) return next();

    const tenantKey = req.user?.tenantId || req.ip || 'anonymous';
    const key = `${tenantKey}:${req.method}:${req.path}:${headerKey}`;

    const cached = cache.get(key);
    if (cached) {
        return res.status(cached.status).json({
            ...cached.payload,
            idempotency: 'REPLAY'
        });
    }

    const originalJson = res.json.bind(res);
    res.json = (payload) => {
        cache.set(key, {
            status: res.statusCode,
            payload,
            expiresAt: Date.now() + CACHE_TTL_MS
        });

        return originalJson(payload);
    };

    next();
};

export const _internal = {
    cache,
    pruneExpired
};
