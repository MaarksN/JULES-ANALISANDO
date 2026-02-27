// apps/api/src/services/secretService.js
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

/**
 * Item 6: Secret Management (Env Encryption)
 */
export const loadEnterpriseSecrets = async () => {
    // Em teste/dev, usa .env local
    if (process.env.NODE_ENV !== 'production') {
        console.log("🔒 Secrets: Using local .env (Dev Mode)");
        return;
    }

    try {
        const client = new SecretManagerServiceClient();
        const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'jusartificial-prod';

        // Mapeamento de segredos críticos
        const secretsToLoad = [
            { env: 'GEMINI_API_KEY', secret: 'GEMINI_API_KEY' },
            { env: 'FIREBASE_SERVICE_ACCOUNT', secret: 'FIREBASE_SERVICE_ACCOUNT' },
            { env: 'ENCRYPTION_KEY', secret: 'APP_MASTER_KEY' }
        ];

        for (const s of secretsToLoad) {
            const [version] = await client.accessSecretVersion({
                name: `projects/${projectId}/secrets/${s.secret}/versions/latest`,
            });

            const payload = version.payload.data.toString();
            process.env[s.env] = payload;
            console.log(`🔒 Secret Loaded: ${s.env}`);
        }
    } catch (e) {
        console.error("❌ Secret Manager Failure:", e.message);
        // Em produção, falhar em carregar segredos deve parar o app
        process.exit(1);
    }
};
