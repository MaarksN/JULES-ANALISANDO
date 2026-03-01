import { db } from './dbService.js';

export const getTenantStats = async (tenantId) => {
    // Mock analytics
    return {
        tokens: 1000,
        documents: 5
    };
};
