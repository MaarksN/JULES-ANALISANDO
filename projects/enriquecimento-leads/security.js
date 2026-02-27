const KEY_STORAGE = 'vendasIA_session_key';

const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (base64) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

const SecurityManager = {
    currentUser: null,

    login: (username, role) => {
        const orgId = role === 'admin' ? 'org_hq' : 'org_branch_01';
        SecurityManager.currentUser = {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            name: username,
            role: role,
            orgId: orgId
        };
        SecurityManager.logAction('LOGIN_ATTEMPT', `User ${username} attempting login as ${role}`);
        return SecurityManager.currentUser;
    },

    verify2FA: (code) => {
        if (code === '123456') {
            SecurityManager.logAction('LOGIN_SUCCESS', `User ${SecurityManager.currentUser.name} passed 2FA`);
            return true;
        }
        SecurityManager.logAction('LOGIN_FAILURE', `User ${SecurityManager.currentUser.name} failed 2FA`);
        return false;
    },

    logout: () => {
        SecurityManager.logAction('LOGOUT', `User ${SecurityManager.currentUser?.name} logged out`);
        SecurityManager.currentUser = null;
        sessionStorage.removeItem(KEY_STORAGE);
        location.reload();
    },

    generateKey: async () => {
        const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
        const exported = await crypto.subtle.exportKey('raw', key);
        sessionStorage.setItem(KEY_STORAGE, toBase64(new Uint8Array(exported)));
        return key;
    },

    getOrCreateKey: async () => {
        const stored = sessionStorage.getItem(KEY_STORAGE);
        if (stored) {
            return crypto.subtle.importKey('raw', fromBase64(stored), { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
        }
        return SecurityManager.generateKey();
    },

    encrypt: async (text) => {
        if (!text || typeof text !== 'string') return text;
        const key = await SecurityManager.getOrCreateKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(text);
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
        const payload = new Uint8Array(iv.length + encrypted.byteLength);
        payload.set(iv, 0);
        payload.set(new Uint8Array(encrypted), iv.length);
        return toBase64(payload);
    },

    decrypt: async (encryptedText) => {
        if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;
        const payload = fromBase64(encryptedText);
        const iv = payload.slice(0, 12);
        const ciphertext = payload.slice(12);
        const key = await SecurityManager.getOrCreateKey();
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
        return new TextDecoder().decode(decrypted);
    },

    logAction: (action, details) => {
        const logs = JSON.parse(localStorage.getItem('vendasIA_audit_logs') || '[]');
        const newLog = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            user: SecurityManager.currentUser ? SecurityManager.currentUser.name : 'System',
            role: SecurityManager.currentUser ? SecurityManager.currentUser.role : 'System',
            orgId: SecurityManager.currentUser ? SecurityManager.currentUser.orgId : 'System',
            action,
            details
        };
        logs.unshift(newLog);
        if (logs.length > 1000) logs.pop();
        localStorage.setItem('vendasIA_audit_logs', JSON.stringify(logs));
        console.log(`[AUDIT] ${action}: ${details}`);
    },

    getAuditLogs: () => {
        if (!SecurityManager.hasPermission('admin')) return [];
        return JSON.parse(localStorage.getItem('vendasIA_audit_logs') || '[]');
    },

    hasPermission: (requiredRole) => {
        if (!SecurityManager.currentUser) return false;
        if (SecurityManager.currentUser.role === 'admin') return true;
        return SecurityManager.currentUser.role === requiredRole;
    },

    secureFetch: async (url, options) => {
        if (!SecurityManager.currentUser) {
            SecurityManager.logAction('GATEWAY_BLOCK', `Unauthenticated access attempt to ${url}`);
            throw new Error('API Gateway: Access Denied (Unauthenticated)');
        }
        SecurityManager.logAction('GATEWAY_REQUEST', `Proxying request to ${url} for Org ${SecurityManager.currentUser.orgId}`);
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                SecurityManager.captureException(new Error(`API Error: ${response.statusText}`), { url });
            }
            return response;
        } catch (error) {
            SecurityManager.captureException(error, { url });
            throw error;
        }
    },

    captureException: (error, context = {}) => {
        const errorLog = {
            message: error.message || error,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            user: SecurityManager.currentUser
        };
        console.error('SecurityManager Caught Exception:', errorLog);
        SecurityManager.logAction('ERROR', `Exception: ${error.message}`);
    },

    forgetData: (targetEmail) => {
        if (!SecurityManager.hasPermission('admin')) throw new Error('Permission Denied');

        let count = 0;
        const groups = JSON.parse(localStorage.getItem('vendasIA_groups') || '[]');

        groups.forEach(group => {
            if (group.primaryEmail === targetEmail) {
                group.primaryEmail = 'ANONYMIZED_LGPD';
                group.mainPhone = 'ANONYMIZED_LGPD';
                group.enrichmentData = null;
                count++;
            }
        });

        localStorage.setItem('vendasIA_groups', JSON.stringify(groups));
        SecurityManager.logAction('LGPD_FORGET', `Anonymized data for ${targetEmail}. Records affected: ${count}`);
        return count;
    }
};

window.onerror = function(message, source, lineno, colno, error) {
    SecurityManager.captureException(error || message, { source, lineno });
};
