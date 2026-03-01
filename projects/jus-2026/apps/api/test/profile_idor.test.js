import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import * as ProfileService from '../src/profile.js';
import profileRoutes from '../src/routes/profileRoutes.js';

// Mock ProfileService
vi.mock('../src/profile.js', () => ({
  updateUserProfile: vi.fn(),
  getUserProfile: vi.fn(),
}));

describe('Profile Routes IDOR Vulnerability', () => {
  let app;
  const attackerUid = 'attacker-uid';
  const victimUid = 'victim-uid';

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock Authentication Middleware
    app.use((req, res, next) => {
      req.user = { uid: attackerUid };
      next();
    });

    app.use('/profile', profileRoutes);

    // Reset mocks
    vi.clearAllMocks();
  });

  it('should allow user to update their own profile', async () => {
    ProfileService.updateUserProfile.mockResolvedValue({ userId: attackerUid, bio: 'Updated' });

    const res = await request(app)
      .post(`/profile/${attackerUid}`)
      .send({ bio: 'Updated' });

    expect(res.status).toBe(200);
    expect(ProfileService.updateUserProfile).toHaveBeenCalledWith(attackerUid, { bio: 'Updated' });
  });

  it('should prevent user from updating another user profile (IDOR)', async () => {
    // Current behavior: IDOR vulnerability allows update
    // Expected behavior after fix: 403 Forbidden

    // We mock success because we want to prove it calls the service (vulnerability exists)
    // or fails to call (vulnerability fixed)
    ProfileService.updateUserProfile.mockResolvedValue({ userId: victimUid, bio: 'Hacked' });

    const res = await request(app)
      .post(`/profile/${victimUid}`)
      .send({ bio: 'Hacked' });

    // The test currently fails if we expect 403, because it returns 200.
    // So we assert 403 to confirm the vulnerability exists (test fails)
    // or fixed (test passes).
    expect(res.status).toBe(403);

    // Also ensure service was NOT called
    expect(ProfileService.updateUserProfile).not.toHaveBeenCalled();
  });
});
