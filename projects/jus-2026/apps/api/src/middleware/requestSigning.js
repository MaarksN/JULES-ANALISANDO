import crypto from 'crypto';

const replayCache = new Map();
const REPLAY_WINDOW_MS = Number(process.env.WEBHOOK_REPLAY_WINDOW_MS || 5 * 60 * 1000);

const clearExpired = () => {
    const now = Date.now();
    for (const [key, expiresAt] of replayCache.entries()) {
        if (expiresAt <= now) replayCache.delete(key);
    }
};

const getSecretForRequest = (req) => req.user?.webhookSecret || process.env.WEBHOOK_SECRET;

/**
 * Item 12: Request Signing (HMAC)
 */
export const verifySignature = (req, res, next) => {
    if (!req.routeRequiresSignature) return next();

    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-signature-timestamp'];
    const nonce = req.headers['x-signature-nonce'];

    if (!signature || !timestamp || !nonce) {
        return res.status(401).json({ requestId: req.requestId, error: 'MISSING_SIGNATURE' });
    }

    const timestampMs = Number(timestamp);
    if (!Number.isFinite(timestampMs)) {
        return res.status(400).json({ requestId: req.requestId, error: 'INVALID_SIGNATURE_TIMESTAMP' });
    }

    const drift = Math.abs(Date.now() - timestampMs);
    if (drift > REPLAY_WINDOW_MS) {
        return res.status(401).json({ requestId: req.requestId, error: 'SIGNATURE_EXPIRED' });
    }

    clearExpired();
    const replayKey = `${req.user?.tenantId || 'anonymous'}:${nonce}:${timestamp}`;
    if (replayCache.has(replayKey)) {
        return res.status(409).json({ requestId: req.requestId, error: 'SIGNATURE_REPLAY_DETECTED' });
    }

    try {
        const secret = getSecretForRequest(req);
        if (!secret) {
            return res.status(500).json({ requestId: req.requestId, error: 'SIGNING_NOT_CONFIGURED' });
        }

        const payload = JSON.stringify(req.body || {});
        const canonical = `${timestamp}.${nonce}.${payload}`;
        const expectedSignature = crypto.createHmac('sha256', secret).update(canonical).digest('hex');

        const signatureBuffer = Buffer.from(String(signature), 'utf8');
        const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

        if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
            return res.status(403).json({ requestId: req.requestId, error: 'INVALID_SIGNATURE' });
        }

        replayCache.set(replayKey, Date.now() + REPLAY_WINDOW_MS);
        next();
    } catch {
        return res.status(403).json({ requestId: req.requestId, error: 'INVALID_SIGNATURE' });
    }
};

export const _internal = {
    replayCache,
    clearExpired
};
