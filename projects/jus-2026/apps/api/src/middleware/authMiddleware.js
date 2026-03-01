import admin from 'firebase-admin';

export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acesso negado: Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        let user;

        // TEST MODE: Allow specific test token if explicitly configured in environment
        // This is different from the previous "fail-open" bypass.
        if (process.env.NODE_ENV === 'test' && token === 'test-token') {
             user = {
                 uid: 'test-user',
                 email: 'test@jusartificial.com',
                 name: 'Test User',
                 firmId: 'firm_test'
             };
        } else {
            // REAL PRODUCTION MODE
            const decodedToken = await admin.auth().verifyIdToken(token);

            // Extract Firm ID from Custom Claims or Default to User-Specific Firm
            // In a real scenario, this comes from an Admin setting the custom claim.
            const firmId = decodedToken.firmId || `firm_${decodedToken.uid}`;

            user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name || 'Usuário',
                firmId: firmId
            };
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Security Audit: Auth Failed", error.message);
        return res.status(403).json({ error: 'Sessão expirada ou inválida.' });
    }
};
