import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import profileRouter from '../src/routes/profileRoutes.js';
import * as ProfileService from '../src/profile.js';

// Mock ProfileService functions
vi.mock('../src/profile.js', () => ({
    getUserProfile: vi.fn(),
    updateUserProfile: vi.fn(),
}));

const app = express();
app.use(express.json());
app.use('/profile', profileRouter);

describe('Profile Update Security', () => {
    it('should filter out restricted fields like role during update', async () => {
        const userId = 'user123';
        const payload = {
            displayName: 'John Doe',
            role: 'admin', // Restricted field
            permissions: ['all'], // Restricted field
            bio: 'Just a user'
        };

        // Reset mocks
        vi.mocked(ProfileService.updateUserProfile).mockReset();
        vi.mocked(ProfileService.updateUserProfile).mockResolvedValue({ success: true });

        const res = await request(app)
            .post(`/profile/${userId}`)
            .send(payload);

        expect(res.status).toBe(200);

        // Check what arguments were passed to the mocked function
        const updateCall = vi.mocked(ProfileService.updateUserProfile).mock.calls[0];

        expect(updateCall).toBeDefined();

        const passedData = updateCall[1]; // First arg is userId, second is data

        // Should contain allowed fields
        expect(passedData).toHaveProperty('displayName', 'John Doe');
        expect(passedData).toHaveProperty('bio', 'Just a user');

        // Should NOT contain restricted fields
        // This assertion will fail if the vulnerability exists
        expect(passedData).not.toHaveProperty('role');
        expect(passedData).not.toHaveProperty('permissions');
    });
});
