import { useState } from 'react';

export const useModalManager = () => {
    const [modals, setModals] = useState({
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
    });

    const toggleModal = (key: keyof typeof modals, value?: boolean) => {
        setModals(prev => ({ ...prev, [key]: value ?? !prev[key] }));
    };

    return { modals, toggleModal };
};
