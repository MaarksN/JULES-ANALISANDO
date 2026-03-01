import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';

// Mock dependencies BEFORE importing app
vi.mock('firebase-admin', () => {
    return {
        default: {
            apps: [],
            initializeApp: vi.fn(),
            credential: {
                cert: vi.fn(),
            },
            firestore: vi.fn(() => ({
                settings: vi.fn(),
                collection: vi.fn(() => ({
                    where: vi.fn().mockReturnThis(),
                    orderBy: vi.fn().mockReturnThis(),
                    get: vi.fn().mockResolvedValue({ docs: [] }),
                    doc: vi.fn(() => ({
                        get: vi.fn().mockResolvedValue({ exists: false }),
                        set: vi.fn(),
                        delete: vi.fn(),
                    })),
                    add: vi.fn().mockResolvedValue({ id: 'mock-id' }),
                })),
            })),
            auth: vi.fn(() => ({
                verifyIdToken: vi.fn(async (token) => {
                    if (token === 'valid-token') {
                        return {
                            uid: 'test-user',
                            email: 'test@example.com',
                            name: 'Test User',
                            firmId: 'firm_test'
                        };
                    }
                    if (token === 'expired-token') {
                         throw new Error('Token expired');
                    }
                    throw new Error('Invalid token');
                })
            }))
        }
    };
});

// Mock Middleware to prevent side effects and dependency issues
vi.mock('../src/middleware/rateLimiter.js', () => ({
    enterpriseLimiter: (req, res, next) => next()
}));

vi.mock('../src/middleware/securityHeaders.js', () => ({
    securityHeaders: (req, res, next) => next()
}));

// Mock Services to prevent side effects
vi.mock('../src/services/dbService.js', () => ({
    initDatabase: vi.fn(),
    db: {
        collection: vi.fn(() => ({
             where: vi.fn().mockReturnThis(),
             orderBy: vi.fn().mockReturnThis(),
             get: vi.fn().mockResolvedValue({ docs: [] }),
             add: vi.fn().mockResolvedValue({ id: 'mock-id' }),
             doc: vi.fn(() => ({
                 get: vi.fn().mockResolvedValue({ exists: false }),
                 set: vi.fn(),
                 delete: vi.fn()
             }))
        }))
    }
}));

vi.mock('../src/services/secretService.js', () => ({
    loadEnterpriseSecrets: vi.fn()
}));

vi.mock('../src/services/queueService.js', () => ({
    queueService: {
        mode: 'test',
        snapshot: vi.fn(() => []),
        registerWorker: vi.fn(),
        add: vi.fn()
    },
    queues: {},
    queueConfigs: {
        'document-processing': { concurrency: 1 },
        'rag-indexing': { concurrency: 1 },
        'notifications': { concurrency: 1 }
    }
}));

vi.mock('../src/services/collaborationService.js', () => ({
    setupCollaboration: vi.fn()
}));

// Mock db.js to prevent top-level execution side effects
vi.mock('../src/db.js', () => ({
    db: {
        collection: vi.fn(() => ({
             where: vi.fn().mockReturnThis(),
             orderBy: vi.fn().mockReturnThis(),
             get: vi.fn().mockResolvedValue({ docs: [] }),
             add: vi.fn().mockResolvedValue({ id: 'mock-id' })
        }))
    }
}));

// Import App after mocks
import { app, serverReady } from '../server.js';

describe('Auth Integration Tests (J01)', () => {
    beforeAll(async () => {
        // Wait for server to be ready
        await serverReady;
    });

    it('GET /health deve ser público e retornar 200', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBeDefined();
    });

    it('GET /api/v1/sessions sem token deve retornar 401', async () => {
        const res = await request(app).get('/api/v1/sessions');
        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/Token não fornecido/);
    });

    it('GET /api/v1/sessions com token inválido deve retornar 403', async () => {
        const res = await request(app)
            .get('/api/v1/sessions')
            .set('Authorization', 'Bearer invalid-token');

        expect(res.status).toBe(403);
    });

    it('GET /api/v1/sessions com token válido deve retornar 200', async () => {
        const res = await request(app)
            .get('/api/v1/sessions')
            .set('Authorization', 'Bearer valid-token');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/v1/sessions com token expirado deve retornar 403', async () => {
        const res = await request(app)
            .get('/api/v1/sessions')
            .set('Authorization', 'Bearer expired-token');

        expect(res.status).toBe(403);
    });
});
