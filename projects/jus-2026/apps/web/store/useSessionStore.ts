import { create } from 'zustand';
import { Session, Message, AgentType } from '../types';
import { getSessions, deleteSession, createNewSession, saveSession } from '../services/storage';

interface SessionState {
    sessions: Session[];
    currentSessionId: string | null;
    isLoading: boolean;

    // Actions
    fetchSessions: (userId: string) => Promise<void>;
    startSession: (agentId: AgentType, userId: string) => Promise<Session>;
    selectSession: (sessionId: string) => void;
    removeSession: (sessionId: string) => Promise<void>;
    updateCurrentSessionMessages: (messages: Message[]) => void;
    clearCurrentSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    sessions: [],
    currentSessionId: null,
    isLoading: false,

    fetchSessions: async (userId: string) => {
        set({ isLoading: true });
        try {
            const sessions = await getSessions(userId);
            set({ sessions });
        } finally {
            set({ isLoading: false });
        }
    },

    startSession: async (agentId, userId) => {
        const newSession = createNewSession(agentId, userId);
        // Optimistic UI update
        set((state) => ({
            sessions: [newSession, ...state.sessions],
            currentSessionId: newSession.id
        }));
        await saveSession(newSession, userId);
        return newSession;
    },

    selectSession: (sessionId) => {
        set({ currentSessionId: sessionId });
    },

    removeSession: async (sessionId) => {
        // Optimistic delete
        const prevSessions = get().sessions;
        set((state) => ({
            sessions: state.sessions.filter(s => s.id !== sessionId),
            currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId
        }));

        try {
            await deleteSession(sessionId);
        } catch (e) {
            set({ sessions: prevSessions }); // Revert
            console.error("Failed to delete session", e);
        }
    },

    updateCurrentSessionMessages: (messages) => {
        const { currentSessionId, sessions } = get();
        if (!currentSessionId) return;

        set({
            sessions: sessions.map(s =>
                s.id === currentSessionId
                ? { ...s, messages, updatedAt: new Date().toISOString() }
                : s
            )
        });
    },

    clearCurrentSession: () => set({ currentSessionId: null })
}));
