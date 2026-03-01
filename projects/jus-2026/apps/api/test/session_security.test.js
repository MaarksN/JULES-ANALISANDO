import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock firebase-admin to prevent connection attempts
vi.mock('firebase-admin', () => ({
    default: {
        apps: [],
        initializeApp: vi.fn(),
        credential: {
            cert: vi.fn()
        },
        firestore: vi.fn(() => ({
            collection: vi.fn()
        }))
    }
}));

// Mock SessionService
vi.mock('../src/sessions.js', () => ({
    createOrUpdateSession: vi.fn(),
    getSessions: vi.fn(),
    deleteSession: vi.fn()
}));

import sessionRoutes from '../src/routes/sessionRoutes.js';
import * as SessionService from '../src/sessions.js';

const app = express();
app.use(express.json());

// Mock middleware to simulate authenticated user
app.use((req, res, next) => {
    req.user = { uid: 'user123', firmId: 'firm456' };
    next();
});

app.use('/sessions', sessionRoutes);

describe('Session Routes Security', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should filter out forbidden fields (Mass Assignment)', async () => {
        const maliciousPayload = {
            title: 'Valid Title',
            isAdmin: true, // Forbidden
            role: 'admin', // Forbidden
            firmId: 'attackerFirm', // Forbidden (should be overwritten)
            userId: 'attackerId', // Forbidden (should be overwritten)
            contractValue: 1000 // Allowed
        };

        // Mock success response
        SessionService.createOrUpdateSession.mockResolvedValue({ id: 'sess1', ...maliciousPayload });

        await request(app)
            .post('/sessions')
            .send(maliciousPayload)
            .expect(200);

        expect(SessionService.createOrUpdateSession).toHaveBeenCalledTimes(1);
        const calledArg = SessionService.createOrUpdateSession.mock.calls[0][0];

        // Verification
        expect(calledArg.title).toBe('Valid Title');
        expect(calledArg.contractValue).toBe(1000);

        // Security checks
        // Before the fix, these assertions will FAIL if the vulnerability exists
        expect(calledArg.isAdmin).toBeUndefined();
        expect(calledArg.role).toBeUndefined();

        // Overwrite checks (these should pass regardless)
        expect(calledArg.firmId).toBe('firm456');
        expect(calledArg.userId).toBe('user123');
    });
});
