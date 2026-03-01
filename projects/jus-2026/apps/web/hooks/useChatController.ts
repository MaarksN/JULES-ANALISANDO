import { useState } from 'react';
import { Message, Attachment, UserProfile, AgentConfig, DocumentVersion, Session, AgentType } from '../types';
import { sendMessageToGemini, streamMessageToGemini } from '../services/gemini';
import { saveSession, createNewSession } from '../services/storage';
import { AGENTS } from '../constants';

export const useChatController = (userProfile: UserProfile, sessions: Session[]) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [currentAgent, setCurrentAgent] = useState<AgentType | null>(null);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    // Derived State
    const activeAgentConfig = currentAgent ? AGENTS[currentAgent] : null;

    const startNewSession = async (agentId: AgentType, userId: string, initialPrompt?: string) => {
        const newSession = createNewSession(agentId, userId);
        newSession.title = `${AGENTS[agentId].name} - ${new Date().toLocaleTimeString().slice(0,5)}`;

        setCurrentAgent(agentId);
        setCurrentSessionId(newSession.id);
        setMessages([]);
        await saveSession(newSession, userId);

        return newSession;
    };

    const handleSendMessage = async (
        content: string,
        attachments: Attachment[],
        dossier: Attachment[],
        lastDocument: string | null,
        user: any,
        onDocumentUpdate: (doc: string) => void
    ) => {
        if (!activeAgentConfig || !currentSessionId || !user) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
            attachments
        };

        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setIsTyping(true);
        setLoadingStep("Analisando solicitação jurídica...");

        // Construct context (history + extra context)
        const contextHistory = newHistory.slice(-6).map(m => ({ role: m.role, content: m.content }));
        let contentToSend = content;
        const extraContexts = [];
        if (userProfile.officeContext) extraContexts.push(`[CONTEXTO DO ESCRITÓRIO: ${userProfile.officeContext}]`);
        if (lastDocument) extraContexts.push(`[DOCUMENTO ATUAL NO EDITOR]:\n${lastDocument.slice(0, 10000)}...\n[FIM DOCUMENTO ATUAL]`);
        if (extraContexts.length > 0) contentToSend = `${extraContexts.join('\n\n')}\n\n${content}`;

        try {
            // Streaming Logic
            const aiMsgId = (Date.now() + 1).toString();
            const initialAiMsg: Message = { id: aiMsgId, role: 'model', content: "", timestamp: new Date() };
            setMessages(prev => [...prev, initialAiMsg]);

            const aiConfig = {
                model: userProfile.preferences?.aiModel,
                temperature: userProfile.preferences?.temperature,
                enableCritic: userProfile.preferences?.enableCritic
            };

            let fullResponseText = "";
            const response = await streamMessageToGemini(
                activeAgentConfig,
                contextHistory,
                contentToSend,
                attachments,
                dossier,
                aiConfig,
                (chunk) => {
                    fullResponseText = chunk;
                    setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: chunk } : m));
                }
            );

            const finalAiMsg = { ...initialAiMsg, content: fullResponseText || response.text, sources: response.sources };
            setMessages(prev => prev.map(m => m.id === aiMsgId ? finalAiMsg : m));

            // Document Generation Logic
            if ((activeAgentConfig.id === AgentType.PETITION || activeAgentConfig.id === AgentType.CONTRACT_REVIEW) && finalAiMsg.content.length > 400) {
                onDocumentUpdate(finalAiMsg.content);
            }

            // Save Session
            const session = sessions.find(s => s.id === currentSessionId);
            if (session) {
                const finalSession = {
                    ...session,
                    messages: [...newHistory, finalAiMsg],
                    lastDocument: lastDocument, // Note: This might be stale if onDocumentUpdate is async, but for simplicity here
                    updatedAt: new Date().toISOString()
                };
                await saveSession(finalSession, user.uid);
            }

        } catch (e) {
            console.error(e);
            setMessages(prev => prev.filter(m => m.role !== 'model' || m.content.length > 0));
            throw e;
        } finally {
            setIsTyping(false);
            setLoadingStep('');
        }
    };

    return {
        messages,
        setMessages,
        isTyping,
        loadingStep,
        currentAgent,
        setCurrentAgent,
        currentSessionId,
        setCurrentSessionId,
        activeAgentConfig,
        startNewSession,
        handleSendMessage
    };
};
