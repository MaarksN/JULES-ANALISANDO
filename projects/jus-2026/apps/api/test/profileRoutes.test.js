import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import profileRoutes from '../src/routes/profileRoutes.js';
import * as ProfileService from '../src/profile.js';

// Mock ProfileService
vi.mock('../src/profile.js', () => ({
    getUserProfile: vi.fn(),
    updateUserProfile: vi.fn()
}));

const app = express();
app.use(express.json());
app.use('/profile', profileRoutes);

describe('Profile Routes Security Check', () => {
    it('GET /profile/:userId should return generic error message (SECURE)', async () => {
        const errorMessage = 'Sensitive DB Error: Connection failed';
        ProfileService.getUserProfile.mockRejectedValue(new Error(errorMessage));

        const res = await request(app).get('/profile/123');

        expect(res.status).toBe(500);
        // This confirms the vulnerability is fixed: generic error is returned
        expect(res.body.error).toBe('Internal server error');
        expect(res.body.error).not.toBe(errorMessage);
    });

    it('POST /profile/:userId should return generic error message (SECURE)', async () => {
        const errorMessage = 'Sensitive DB Error: Update failed';
        ProfileService.updateUserProfile.mockRejectedValue(new Error(errorMessage));

        const res = await request(app)
            .post('/profile/123')
            .send({ name: 'Test' });

        expect(res.status).toBe(500);
        // This confirms the vulnerability is fixed: generic error is returned
        expect(res.body.error).toBe('Internal server error');
        expect(res.body.error).not.toBe(errorMessage);
    });
});
