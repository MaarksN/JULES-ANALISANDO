import { planService } from '../services/planService.js';
import { ForbiddenError } from '../errors/AppError.js';

export const checkPlan = (feature) => (req, res, next) => {
    const access = planService.ensureFeatureAccess(req.user, feature);
    if (!access.allowed) {
        return next(new ForbiddenError(`O recurso "${feature}" não está disponível no plano ${access.plan}.`));
    }

    req.plan = planService.getPlanFromUser(req.user);
    next();
};
