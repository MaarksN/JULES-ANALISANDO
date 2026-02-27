import { useState, useEffect } from 'react';
import { Template } from '../types';
import { getTemplates, deleteTemplate } from '../services/storage';

export const useTemplates = (userId: string | undefined) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userId) {
            setLoading(true);
            getTemplates(userId)
                .then(setTemplates)
                .finally(() => setLoading(false));
        }
    }, [userId]);

    const removeTemplate = async (templateId: string) => {
        const success = await deleteTemplate(templateId);
        if (success) {
            setTemplates(prev => prev.filter(t => t.id !== templateId));
        }
    };

    return { templates, loading, removeTemplate };
};
