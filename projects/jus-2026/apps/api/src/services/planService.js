const PLAN_DEFINITIONS = {
    free: {
        id: 'free',
        aiModel: 'flash',
        webSearch: false,
        collaborators: 1,
        docsPerMonth: 10,
        legalValidation: false,
        dailyBudget: { pro: 10, flash: 50 }
    },
    pro: {
        id: 'pro',
        aiModel: 'pro',
        webSearch: true,
        collaborators: 5,
        docsPerMonth: 100,
        legalValidation: true,
        dailyBudget: { pro: 50, flash: Number.POSITIVE_INFINITY }
    },
    enterprise: {
        id: 'enterprise',
        aiModel: 'pro',
        webSearch: true,
        collaborators: Number.POSITIVE_INFINITY,
        docsPerMonth: Number.POSITIVE_INFINITY,
        legalValidation: true,
        dailyBudget: { pro: Number.POSITIVE_INFINITY, flash: Number.POSITIVE_INFINITY }
    }
};

const DEFAULT_PLAN = 'free';

const normalizePlan = (plan) => {
    const key = String(plan || DEFAULT_PLAN).toLowerCase();
    return PLAN_DEFINITIONS[key] ? key : DEFAULT_PLAN;
};

export const planService = {
    getPlan(plan) {
        return PLAN_DEFINITIONS[normalizePlan(plan)];
    },

    getPlanFromUser(user = {}) {
        const claimPlan = user?.token?.plan || user?.plan;
        return PLAN_DEFINITIONS[normalizePlan(claimPlan)];
    },

    canUseFeature(plan, feature) {
        const p = this.getPlan(plan);
        return Boolean(p?.[feature]);
    },

    ensureFeatureAccess(user, feature) {
        const p = this.getPlanFromUser(user);
        return {
            allowed: Boolean(p?.[feature]),
            plan: p.id
        };
    }
};
