import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock queue BEFORE import
vi.mock('../src/queue.js', () => ({
    queue: {
        add: vi.fn()
    }
}));

// Mock db BEFORE import
vi.mock('../src/db.js', () => ({
    db: {
        collection: vi.fn().mockReturnValue({
            doc: vi.fn().mockReturnValue({
                id: 'mock-doc-id'
            })
        })
    }
}));

// Mock firebase-admin just in case (though db.js mock handles db import)
vi.mock('firebase-admin', () => ({
    default: {
        initializeApp: vi.fn(),
        credential: {
            cert: vi.fn()
        },
        firestore: vi.fn()
    }
}));

// Import the router after mocks are set
import uploadRoutes from '../src/routes/uploadRoutes.js';

const app = express();
app.use(express.json());

// Mock Auth Middleware
app.use((req, res, next) => {
    req.user = { uid: 'test-uid', tenantId: 'test-tenant' };
    next();
});

app.use('/', uploadRoutes);

describe('Upload Route Verification', () => {
    it('should successfully upload file with multer middleware', async () => {
        const res = await request(app)
            .post('/')
            .attach('file', Buffer.from('dummy content'), 'test.txt');

        // With multer, req.file is populated, so it proceeds to enqueue job and returns 202
        expect(res.status).toBe(202);
        expect(res.body).toHaveProperty('status', 'processing');
        expect(res.body).toHaveProperty('message', 'Documento enviado para processamento.');
        expect(res.body).toHaveProperty('documentId');
        expect(res.body).toHaveProperty('filename', 'test.txt');
    });

    it('should still handle no file upload gracefully', async () => {
        const res = await request(app)
            .post('/'); // No attachment

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("No file uploaded.");
    });
});
