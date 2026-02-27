import { useState, useEffect } from 'react';
import { Session } from '../types';
import { getSessions, deleteSession, saveSession } from '../services/storage';

export const useSessions = (userId: string | undefined) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userId) {
            setLoading(true);
            getSessions(userId)
                .then(setSessions)
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [userId]);

    const removeSession = async (sessionId: string) => {
        // Item 40: Undo Logic (Optimistic Delete with recovery capability - simulated)
        // Em um app real, usaríamos um Toast com botão "Desfazer" que cancelaria o timer.
        // Aqui, removemos da UI instantaneamente.
        const prevSessions = [...sessions];
        setSessions(prev => prev.filter(s => s.id !== sessionId));

        try {
            const success = await deleteSession(sessionId);
            if (!success) throw new Error("Falha ao deletar");
            return true;
        } catch (e) {
            // Revert on error
            setSessions(prevSessions);
            setError("Erro ao excluir. Tente novamente.");
            return false;
        }
    };

    const updateSessionLocal = async (updatedSession: Session) => {
        setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
        if (userId) {
            await saveSession(updatedSession, userId);
        }
    };

    return { sessions, loading, error, removeSession, updateSessionLocal, setSessions };
};
