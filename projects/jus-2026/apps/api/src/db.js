import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let db;

try {
    if (!admin.apps.length) {
        // Exige explicitamente o Service Account para Produção
        // Em testes, permitimos passar se mockado, mas para a aplicação rodar precisamos da ENV.
        if (process.env.NODE_ENV !== 'test' && !process.env.FIREBASE_SERVICE_ACCOUNT) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT não configurada. Impossível iniciar em produção.");
        }

        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET // Necessário para o Wipe de arquivos
            });
        } else {
            // Apenas para testes unitários ou ambientes auto-configurados (GCP)
            admin.initializeApp();
        }
    }

    db = admin.firestore();
    console.log("🚀 JusArtificial: Banco de Dados Conectado em Modo Produção.");
} catch (error) {
    console.error("❌ ERRO CRÍTICO: Falha ao conectar ao banco de dados real:", error.message);
    if (process.env.NODE_ENV !== 'test') {
        process.exit(1); // Encerra o processo se não houver banco real
    }
}

export { db };
