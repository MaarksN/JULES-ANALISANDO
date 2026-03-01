import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { sendMessageToGemini } from '../services/gemini';
import { AGENTS } from '../constants';
import { AgentType } from '../types';

export const useAutocomplete = (text: string, isTyping: boolean) => {
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const debouncedText = useDebounce(text, 1000); // Wait 1s after typing stops

    useEffect(() => {
        const fetchSuggestion = async () => {
            if (!debouncedText || debouncedText.length < 50 || isTyping) {
                setSuggestion(null);
                return;
            }

            // Simple heuristic: Only suggest if user stopped at a sentence end or newline
            const lastChar = debouncedText.trim().slice(-1);
            if (!['.', '\n'].includes(lastChar)) return;

            try {
                // Use a "Completion Agent" (Simulated by generic prompt for now)
                const prompt = `Complete a seguinte frase jurídica de forma concisa e formal (máximo 1 parágrafo): "${debouncedText.slice(-500)}"`;

                // Using Flash model for speed (implied by default config in gemini service logic)
                const response = await sendMessageToGemini(
                    AGENTS[AgentType.PETITION], // Reuse Petition agent config as base
                    [],
                    prompt,
                    [],
                    [],
                    { model: 'flash', temperature: 0.2 }
                );

                if (response.text) {
                    setSuggestion(response.text);
                }
            } catch (e) {
                console.error("Autocomplete failed", e);
            }
        };

        fetchSuggestion();
    }, [debouncedText, isTyping]);

    return { suggestion, setSuggestion };
};
