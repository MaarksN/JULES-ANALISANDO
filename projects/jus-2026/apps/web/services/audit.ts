import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const logAction = async (
    userId: string,
    action: string,
    details: Record<string, any>
) => {
    try {
        const logEntry = {
            userId,
            action,
            details,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent
        };

        // Salvar em coleção separada "audit_logs"
        await addDoc(collection(db, "audit_logs"), logEntry);
        console.log(`[AUDIT] Action logged: ${action}`);
    } catch (e) {
        console.error("Failed to log action:", e);
        // Em um sistema real, falhar o log pode ser crítico (fail-safe) ou ignorado (fail-open)
    }
};
