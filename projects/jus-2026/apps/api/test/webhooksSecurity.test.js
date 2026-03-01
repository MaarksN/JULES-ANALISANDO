import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import crypto from 'crypto';

import { requestContext } from '../src/middleware/requestContext.js';
import webhookRoutes from '../src/routes/v1/webhooks.js';
import { _internal as idempotencyInternal } from '../src/middleware/idempotency.js';
import { _internal as signingInternal } from '../src/middleware/requestSigning.js';

const buildSignature = ({ timestamp, nonce, payload, secret }) => {
    const canonical = `${timestamp}.${nonce}.${JSON.stringify(payload)}`;
    return crypto.createHmac('sha256', secret).update(canonical).digest('hex');
};

describe('Webhook signature + idempotency', () => {
    beforeEach(() => {
        process.env.WEBHOOK_SECRET = 'test-secret';
        idempotencyInternal.cache.clear();
        signingInternal.replayCache.clear();
    });

    it('should reject missing signature headers', async () => {
        const app = express();
        app.use(express.json());
        app.use(requestContext);
        app.use('/webhooks', webhookRoutes);

        const res = await request(app)
            .post('/webhooks/provider-a')
            .send({ hello: 'world' })
            .expect(401);

        expect(res.body.error).toBe('MISSING_SIGNATURE');
        expect(res.body.requestId).toBeTruthy();
    });

    it('should accept valid signature and replay idempotent response', async () => {
        const app = express();
        app.use(express.json());
        app.use(requestContext);
        app.use('/webhooks', webhookRoutes);

        const payload = { event: 'invoice.paid', id: 'evt-1' };
        const timestamp = String(Date.now());
        const nonce = 'nonce-abc';
        const signature = buildSignature({
            timestamp,
            nonce,
            payload,
            secret: process.env.WEBHOOK_SECRET
        });

        const first = await request(app)
            .post('/webhooks/provider-a')
            .set('x-signature', signature)
            .set('x-signature-timestamp', timestamp)
            .set('x-signature-nonce', nonce)
            .set('idempotency-key', 'idem-1')
            .send(payload)
            .expect(202);

        expect(first.body.received).toBe(true);
        expect(first.body.idempotency).toBeUndefined();

        const secondNonce = 'nonce-def';
        const secondSignature = buildSignature({
            timestamp,
            nonce: secondNonce,
            payload,
            secret: process.env.WEBHOOK_SECRET
        });

        const second = await request(app)
            .post('/webhooks/provider-a')
            .set('x-signature', secondSignature)
            .set('x-signature-timestamp', timestamp)
            .set('x-signature-nonce', secondNonce)
            .set('idempotency-key', 'idem-1')
            .send(payload)
            .expect(202);

        expect(second.body.idempotency).toBe('REPLAY');
    });

    it('should reject signature replay with same nonce and timestamp', async () => {
        const app = express();
        app.use(express.json());
        app.use(requestContext);
        app.use('/webhooks', webhookRoutes);

        const payload = { event: 'doc.updated', id: 'evt-2' };
        const timestamp = String(Date.now());
        const nonce = 'nonce-replay';
        const signature = buildSignature({
            timestamp,
            nonce,
            payload,
            secret: process.env.WEBHOOK_SECRET
        });

        await request(app)
            .post('/webhooks/provider-b')
            .set('x-signature', signature)
            .set('x-signature-timestamp', timestamp)
            .set('x-signature-nonce', nonce)
            .send(payload)
            .expect(202);

        const replay = await request(app)
            .post('/webhooks/provider-b')
            .set('x-signature', signature)
            .set('x-signature-timestamp', timestamp)
            .set('x-signature-nonce', nonce)
            .send(payload)
            .expect(409);

        expect(replay.body.error).toBe('SIGNATURE_REPLAY_DETECTED');
    });
});
