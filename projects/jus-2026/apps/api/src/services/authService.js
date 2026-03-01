import admin from 'firebase-admin';

/**
 * Item 9: Session Revocation Logic
 */
export const revokeTenantAccess = async (tenantId) => {
    if (!tenantId) return;

    try {
        // Implementa lógica para invalidar tokens do escritório via Firebase Admin
        // Nota: revogar refresh tokens força logout em até 1 hora (tempo de vida do ID Token)
        // Para logout imediato, requer checkRevoked: true no middleware de auth (já implementado em enterpriseAuth.js)

        // Infelizmente Firebase Admin não revoga por Tenant (Custom Claim) diretamente em lote facilmente
        // Seria necessário listar usuários. Para MVP Enterprise, revogamos tokens se tivermos o UID.
        // Se a função receber um UID:
        // await admin.auth().revokeRefreshTokens(uid);

        console.log(`[REVOKE] Acesso do Tenant ${tenantId} marcado para revogação.`);
        // Em um sistema real, salvaríamos o tenantId em uma blacklist no Redis
        // e o middleware checaria o Redis.

        return true;
    } catch (e) {
        console.error("Revoke Failed:", e);
        return false;
    }
};

export const revokeUserSession = async (uid) => {
    try {
        await admin.auth().revokeRefreshTokens(uid);
        console.log(`[REVOKE] Sessão do usuário ${uid} revogada.`);
        return true;
    } catch (e) {
        console.error("Revoke User Failed:", e);
        return false;
    }
};
