import { create } from 'zustand';

interface AppState {
    currentView: 'landing' | 'dashboard' | 'workspace';
    setCurrentView: (view: 'landing' | 'dashboard' | 'workspace') => void;

    isDarkMode: boolean;
    toggleDarkMode: () => void;

    isFocusMode: boolean;
    toggleFocusMode: () => void;

    // Modal State Manager
    modals: {
        settings: boolean;
        legalTools: boolean;
        jurisprudence: boolean;
        judgeProfiler: boolean;
        comparison: boolean;
        timeline: boolean;
        vadeMecum: boolean;
        voiceConsultant: boolean;
        petitionWizard: boolean;
        intentWizard: boolean;
        onboarding: boolean;
    };
    toggleModal: (key: keyof AppState['modals'], value?: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    currentView: 'landing',
    setCurrentView: (view) => set({ currentView: view }),

    isDarkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
    toggleDarkMode: () => set((state) => {
        const newVal = !state.isDarkMode;
        if (newVal) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        return { isDarkMode: newVal };
    }),

    isFocusMode: false,
    toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),

    modals: {
        settings: false,
        legalTools: false,
        jurisprudence: false,
        judgeProfiler: false,
        comparison: false,
        timeline: false,
        vadeMecum: false,
        voiceConsultant: false,
        petitionWizard: false,
        intentWizard: false,
        onboarding: false
    },
    toggleModal: (key, value) => set((state) => ({
        modals: { ...state.modals, [key]: value ?? !state.modals[key] }
    }))
}));
