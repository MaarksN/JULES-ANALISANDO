// apps/api/src/services/dbService.js
import admin from 'firebase-admin';

export let db;

// Função de Inicialização Explícita (Previne crash por import estático)
export const initDatabase = async () => {
    if (admin.apps.length) {
        db = admin.firestore();
        return;
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("🔥 Firebase Admin Initialized (Production Mode)");
        } catch (e) {
            console.error("Firebase Auth Error:", e);
            throw e; // Falha crítica se não conectar
        }
    } else {
        admin.initializeApp(); // Default (GCP Env)
        console.log("🔥 Firebase Admin Initialized (Default/Dev Mode)");
    }

    db = admin.firestore();
    db.settings({ ignoreUndefinedProperties: true });
};

/**
 * Item 5: Isolamento de Tenant no Firestore (Wrapper Seguro)
 */
export const getTenantCollection = (tenantId, collectionName) => {
    if (!db) throw new Error("Database not initialized");
    if (!tenantId) throw new Error('SECURITY: Tenant ID required for database access.');
    return db.collection(collectionName).where('tenantId', '==', tenantId);
};

export const safeWrite = async (tenantId, collectionName, data, docId = null) => {
    if (!db) throw new Error("Database not initialized");
    if (!tenantId) throw new Error('SECURITY: Tenant ID required for write.');

    const docData = {
        ...data,
        tenantId, // Force Tenant ID
        updatedAt: new Date().toISOString()
    };

    if (docId) {
        // Verify ownership before update (IDOR check)
        const docRef = db.collection(collectionName).doc(docId);
        const doc = await docRef.get();
        if (doc.exists && doc.data().tenantId !== tenantId) {
            throw new Error('SECURITY: IDOR Detected on Write.');
        }
        await docRef.set(docData, { merge: true });
        return { id: docId, ...docData };
    } else {
        docData.createdAt = new Date().toISOString();
        const ref = await db.collection(collectionName).add(docData);
        return { id: ref.id, ...docData };
    }
};

export const safeDelete = async (tenantId, collectionName, docId) => {
    if (!db) throw new Error("Database not initialized");
    const docRef = db.collection(collectionName).doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) return false;
    if (doc.data().tenantId !== tenantId) {
         throw new Error('SECURITY: IDOR Detected on Delete.');
    }

    await docRef.delete();
    return true;
};
