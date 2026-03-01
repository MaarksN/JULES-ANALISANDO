import helmet from 'helmet';

/**
 * Item 7: Helmet Security Headers (Hardening)
 */
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://apis.google.com", "https://www.gstatic.com"], // Allow Google Auth
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"], // Proteção Clickjacking
            upgradeInsecureRequests: [], // Força HTTPS
        },
    },
    hsts: {
        maxAge: 31536000, // 1 ano
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    xssFilter: true, // Legacy, mas útil
    hidePoweredBy: true
});
