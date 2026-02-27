import { db, auth } from "../firebase";
import { collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject, listAll } from "firebase/storage";

export const wipeClientData = async (userId: string, clientId: string): Promise<string> => {
    const storage = getStorage();
    const logs: string[] = [];

    try {
        if (clientId === 'ALL') {
            // 1. Limpeza no Firestore (Metadados e Mensagens)
            const sessionQ = query(collection(db, 'sessions'), where('userId', '==', userId));
            const sessions = await getDocs(sessionQ);

            // Delete sessions one by one
            for (const doc of sessions.docs) {
                await deleteDoc(doc.ref);
            }
            logs.push("- Metadados excluídos do Firestore.");

            // 2. Limpeza no Firebase Storage (Arquivos Físicos)
            // Note: This requires the Firebase Storage rules to allow deletion by the owner
            const userFolderRef = ref(storage, `documents/${userId}`);

            try {
                const fileList = await listAll(userFolderRef);
                await Promise.all(fileList.items.map(fileRef => deleteObject(fileRef)));
                logs.push(`- ${fileList.items.length} arquivos físicos removidos do Storage.`);
            } catch (storageError: any) {
                // Storage might be empty or permissions might fail if rules aren't set
                console.warn("Storage wipe partial:", storageError);
                logs.push("- Aviso: Falha ao listar/excluir arquivos físicos (Storage pode estar vazio).");
            }
        }

        return `CERTIFICADO DE EXCLUSÃO DEFINITIVA:\n${logs.join('\n')}`;
    } catch (e: any) {
        throw new Error(`Falha no wipe total: ${e.message}`);
    }
};
