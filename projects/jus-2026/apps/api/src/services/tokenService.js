// apps/api/src/services/tokenService.js
import { db } from './dbService.js';

/**
 * Item 13: Serviço de Tokens (Billing & Controle de Custos)
 * Funcionalidades:
 * 1. Contagem precisa de tokens (TikToken/Gemini).
 * 2. Verificação de cota do tenant.
 * 3. Bloqueio automático por estouro de cota.
 * 4. Registro de uso por usuário/projeto.
 */

const inMemoryUsageLog = [];
const inMemoryModelCalls = [];

class TokenManager {
    /**
     * Verifica saldo e reserva tokens antes da geração.
     * @param {string} tenantId
     * @param {number} estimatedCost
     */
    async checkQuota(tenantId, estimatedCost = 1000) {
        if (!tenantId) return false;

        const tenantDoc = await db.collection('tenants').doc(tenantId).get();
        if (!tenantDoc.exists) return false; // Tenant inválido

        const data = tenantDoc.data();
        // Se for plano Ilimitado (Enterprise), passa direto
        if (data.plan === 'enterprise') return true;

        const available = data.tokenBalance || 0;

        if (available < estimatedCost) {
            console.warn(`[TOKEN] Tenant ${tenantId} sem saldo. Disp: ${available}, Req: ${estimatedCost}`);
            throw new Error('Saldo de tokens insuficiente. Contate o administrador.');
        }

        return true;
    }

    /**
     * Deduz saldo após uso real.
     * @param {string} tenantId
     * @param {string} userId
     * @param {number} tokensUsed
     * @param {string} model
     */
    async deductUsage(tenantId, userId, tokensUsed, model) {
        if (!tenantId || tokensUsed <= 0) return;

        try {
            // Transação Atômica no Firestore (Consistência)
            await db.runTransaction(async (t) => {
                const tenantRef = db.collection('tenants').doc(tenantId);
                const doc = await t.get(tenantRef);

                if (!doc.exists) return;

                const currentBalance = doc.data().tokenBalance || 0;
                // Não permite saldo negativo
                const newBalance = Math.max(0, currentBalance - tokensUsed);

                t.update(tenantRef, {
                    tokenBalance: newBalance,
                    lastUsage: new Date().toISOString()
                });

                // Registrar histórico de uso
                const usageRef = db.collection('usage_logs').doc();
                const usageRecord = {
                    tenantId,
                    userId,
                    tokens: tokensUsed,
                    model,
                    timestamp: new Date().toISOString()
                };

                t.set(usageRef, usageRecord);
                inMemoryUsageLog.push(usageRecord);
            });

            console.log(`[TOKEN] Deduzidos ${tokensUsed} tokens do Tenant ${tenantId}`);

        } catch (e) {
            console.error("Token Deduction Error:", e);
            // Em falha de billing, logar erro crítico mas não falhar a request do usuário se já gerou
        }
    }



    async checkDailyModelQuota({ tenantId, userId, model, plan }) {
        if (!tenantId || !model) return true;

        const today = new Date().toISOString().slice(0, 10);
        const key = String(model).includes('pro') ? 'pro' : 'flash';
        const limits = {
            free: { pro: 10, flash: 50 },
            pro: { pro: 50, flash: Number.POSITIVE_INFINITY },
            enterprise: { pro: Number.POSITIVE_INFINITY, flash: Number.POSITIVE_INFINITY }
        };

        const normalizedPlan = limits[plan] ? plan : 'free';
        const limit = limits[normalizedPlan][key];

        if (!Number.isFinite(limit)) return true;

        const used = inMemoryModelCalls.filter((item) => {
            return item.tenantId === tenantId
                && item.modelClass === key
                && String(item.timestamp || '').startsWith(today)
                && (!userId || item.userId === userId);
        }).length;

        if (used >= limit) {
            const error = new Error(`Cota diária de chamadas ${key.toUpperCase()} excedida para o plano ${normalizedPlan}.`);
            error.status = 429;
            error.code = 'ai_quota';
            throw error;
        }

        return true;
    }

    registerModelCall({ tenantId, userId, model }) {
        if (!tenantId || !model) return;
        inMemoryModelCalls.push({
            tenantId,
            userId,
            modelClass: String(model).includes('pro') ? 'pro' : 'flash',
            timestamp: new Date().toISOString()
        });
    }

    async getTodayUsage(tenantId, userId = null) {
        if (!tenantId) {
            return { totalTokens: 0, estimatedCostUSD: 0, byModel: {} };
        }

        const today = new Date().toISOString().slice(0, 10);
        const records = inMemoryUsageLog.filter((item) => {
            if (item.tenantId !== tenantId) return false;
            if (userId && item.userId !== userId) return false;
            return String(item.timestamp || '').startsWith(today);
        });

        const byModel = records.reduce((acc, item) => {
            const model = item.model || 'unknown';
            acc[model] = (acc[model] || 0) + (item.tokens || 0);
            return acc;
        }, {});

        const totalTokens = Object.values(byModel).reduce((acc, value) => acc + value, 0);
        const estimatedCostUSD = Number(((byModel['gemini-1.5-pro'] || 0) * 0.0000025 + (byModel['gemini-1.5-flash'] || 0) * 0.00000035).toFixed(6));

        return { totalTokens, estimatedCostUSD, byModel };
    }

    // Estimativa simples (1 token ~ 4 caracteres)
    estimateTokens(text) {
        if (!text) return 0;
        return Math.ceil(text.length / 4);
    }
}

export const tokenService = new TokenManager();
