import { db, getTenantCollection } from './dbService.js';
import admin from 'firebase-admin';

/**
 * Item 20: Panic Button (Global Wipe Trigger)
 */
export const triggerPanicWipe = async (tenantId, requestingUser) => {
    console.log(`[PANIC] Initiating WIPE for Tenant: ${tenantId} requested by ${requestingUser.uid}`);

    // 1. Verificação Tripla (Simulada aqui, em prod requer MFA step-up e delay)
    if (requestingUser.role !== 'owner') {
        throw new Error('SECURITY: Apenas o OWNER pode acionar o Panic Button.');
    }

    // 2. Registro do Certificado de Exclusão (Antes de apagar, gera a prova)
    const certificate = {
        tenantId,
        requestedBy: requestingUser.uid,
        timestamp: new Date().toISOString(),
        action: 'GLOBAL_WIPE',
        status: 'INITIATED'
    };

    // Salva em uma collection separada de auditoria global (fora do tenant se possível, ou email)
    await db.collection('global_wipe_certificates').add(certificate);

    // 3. Execução Assíncrona (Background Job)
    // Em produção, isso iria para uma Queue. Aqui simulamos o loop de delete.
    setImmediate(async () => {
        try {
            // A. Deletar Coleções do Firestore
            const collections = ['documents', 'sessions', 'audit_logs', 'cases'];
            for (const col of collections) {
                const snapshot = await getTenantCollection(tenantId, col).get();
                const batch = db.batch();
                let counter = 0;

                snapshot.docs.forEach(doc => {
                    batch.delete(doc.ref);
                    counter++;
                });

                if (counter > 0) await batch.commit();
                console.log(`[PANIC] Wiped ${counter} docs from ${col}`);
            }

            // B. Deletar Storage (Bucket)
            const bucket = admin.storage().bucket();
            await bucket.deleteFiles({ prefix: `tenants/${tenantId}/` });
            console.log(`[PANIC] Wiped Storage for ${tenantId}`);

            // C. Atualizar Certificado
            console.log(`[PANIC] Wipe Completed for ${tenantId}`);
        } catch (e) {
            console.error(`[PANIC] Wipe FAILED for ${tenantId}`, e);
        }
    });

    return { message: 'Protocolo de destruição iniciado. Certificado gerado.', certificateId: certificate.timestamp };
};
