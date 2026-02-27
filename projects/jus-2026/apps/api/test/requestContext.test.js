import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { requestContext } from '../src/middleware/requestContext.js';
import { globalErrorHandler } from '../src/middleware/errorHandler.js';

describe('requestContext middleware', () => {
    it('should preserve a valid inbound x-request-id', async () => {
        const app = express();
        app.use(requestContext);
        app.get('/ok', (req, res) => {
            res.json({ requestId: req.requestId });
        });

        const res = await request(app)
            .get('/ok')
            .set('x-request-id', 'req-123_ABC')
            .expect(200);

        expect(res.headers['x-request-id']).toBe('req-123_ABC');
        expect(res.body.requestId).toBe('req-123_ABC');
    });

    it('should generate a request id when inbound header is invalid', async () => {
        const app = express();
        app.use(requestContext);
        app.get('/ok', (req, res) => {
            res.json({ requestId: req.requestId });
        });

        const res = await request(app)
            .get('/ok')
            .set('x-request-id', 'invalido com espacos')
            .expect(200);

        expect(res.headers['x-request-id']).toBeTruthy();
        expect(res.headers['x-request-id']).not.toBe('invalido com espacos');
        expect(res.body.requestId).toBe(res.headers['x-request-id']);
    });
});

describe('globalErrorHandler with request context', () => {
    it('should expose requestId in safe error response', async () => {
        const app = express();
        app.use(requestContext);
        app.get('/boom', () => {
            throw new Error('boom');
        });
        app.use(globalErrorHandler);

        const res = await request(app)
            .get('/boom')
            .set('x-request-id', 'trace-001')
            .expect(500);

        expect(res.body.requestId).toBe('trace-001');
        expect(res.body.error).toBe('INTERNAL_ERROR');
        expect(res.body.errorId).toBeTruthy();
    });
});
