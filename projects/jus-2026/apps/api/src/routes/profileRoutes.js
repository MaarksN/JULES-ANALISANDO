import express from 'express';
import * as ProfileService from '../profile.js';

const router = express.Router();

// Whitelist of allowed fields for mass assignment protection
const ALLOWED_PROFILE_FIELDS = [
    'displayName',
    'phoneNumber',
    'photoURL',
    'bio',
    'preferences',
    'language',
    'theme',
    'address'
];

router.get('/:userId', async (req, res) => {
    try {
        const profile = await ProfileService.getUserProfile(req.params.userId);
        res.json(profile || {});
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/:userId', async (req, res) => {
    try {
        // Extract only allowed fields from the request body
        const updates = {};
        for (const field of ALLOWED_PROFILE_FIELDS) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const profile = await ProfileService.updateUserProfile(req.params.userId, updates);
        res.json(profile);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
