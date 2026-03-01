/**
 * Item 11: IP Whitelisting por Escritório
 */
export const ipFilter = (req, res, next) => {
    // Pula filtro se não houver tenant config (ex: rotas públicas ou usuário sem tenant)
    if (!req.user || !req.user.tenantConfig || !req.user.tenantConfig.allowedIps) {
        return next();
    }

    const allowedIps = req.user.tenantConfig.allowedIps;
    const clientIp = req.ip;

    // Lógica simples de inclusão. Para CIDR, usaria biblioteca 'ip-range-check'
    if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
        console.warn(`[IP BLOCK] Tenant ${req.user.tenantId} blocked IP ${clientIp}`);
        return res.status(403).json({ error: 'IP_NOT_AUTHORIZED', message: 'Acesso negado por política de IP.' });
    }

    next();
};
