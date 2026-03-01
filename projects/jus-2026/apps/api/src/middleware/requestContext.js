import crypto from 'crypto';

const REQUEST_ID_HEADER = 'x-request-id';
const MAX_ID_LENGTH = 128;
const SAFE_REQUEST_ID_REGEX = /^[A-Za-z0-9._:-]+$/;

const normalizeRequestId = (candidate) => {
    if (typeof candidate !== 'string') return null;
    const value = candidate.trim();
    if (!value || value.length > MAX_ID_LENGTH) return null;
    if (!SAFE_REQUEST_ID_REGEX.test(value)) return null;
    return value;
};

/**
 * Correlation middleware to ensure every request carries a stable request id.
 */
export const requestContext = (req, res, next) => {
    const inboundRequestId = normalizeRequestId(req.get(REQUEST_ID_HEADER));
    const requestId = inboundRequestId || crypto.randomUUID();

    req.requestId = requestId;
    req.startedAt = Date.now();
    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
};

export const _internal = {
    normalizeRequestId
};
