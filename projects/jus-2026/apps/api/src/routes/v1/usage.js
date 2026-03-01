import express from 'express';
import { tokenService } from '../../services/tokenService.js';
import { planService } from '../../services/planService.js';

const router = express.Router();

router.get('/today', async (req, res, next) => {
    try {
        const { tenantId, uid } = req.user;
        const plan = planService.getPlanFromUser(req.user);
        const usage = await tokenService.getTodayUsage(tenantId, uid);

        res.json({
            plan: plan.id,
            usage
        });
    } catch (error) {
        next(error);
    }
});

export default router;
