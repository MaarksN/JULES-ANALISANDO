import React from 'react';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import ChatInterface from './ChatInterface';
import DocumentPreview from './DocumentPreview';
import ResizablePanel from './ResizablePanel';
import VadeMecum from './VadeMecum';
import { Session, Attachment, Message, UserProfile, DocumentVersion, ContractRisk, AgentType } from '../types';

type ViewState = 'landing' | 'dashboard' | 'workspace';

interface ViewManagerProps {
    currentView: ViewState;
    user: any;
    onEnterApp: () => void;

    // Dashboard Props
    onSelectAgent: (agent: AgentType, prompt?: string) => void;
    userName?: string;
    sessions?: Session[];
    onResumeSession?: (session: Session) => void;
    onDeleteSession?: (id: string) => void;
    onUpdateSession?: (id: string, updates: Partial<Session>) => void;
    onOpenWizard: () => void;

    // Workspace Props
    activeAgentConfig: any;
    currentSession?: Session;
    showPreview: boolean;
    lastDocument: string | null;
    messages: Message[];
    isTyping: boolean;
    loadingStep: string;
    dossier: Attachment[];
    documentVersions: DocumentVersion[];
    latestRisks: ContractRisk[] | null;
    userProfile: UserProfile;
    isVadeMecumOpen: boolean;

    // Actions
    handleSendMessage: (content: string, attachments: Attachment[]) => void;
    handleUpdateDossier: (newDossier: Attachment[]) => void;
    handleExternalInsert: (text: string) => void;
    setIsVadeMecumOpen: (isOpen: boolean) => void;
    handleUpdateDocument: (content: string, isRevert?: boolean) => void;
    handleRefineRequest: (text: string, instruction: string) => Promise<string>;
    handleSaveTemplate: (content: string) => void;
    setToastMessage: (msg: string) => void;
}

const ViewManager: React.FC<ViewManagerProps> = (props) => {
    const { currentView } = props;

    if (currentView === 'landing') {
        return <LandingPage onEnter={props.onEnterApp} />;
    }

    if (currentView === 'dashboard') {
        return (
            <Dashboard
                onSelectAgent={props.onSelectAgent}
                userName={props.userName}
                sessions={props.sessions}
                onResumeSession={props.onResumeSession}
                onDeleteSession={props.onDeleteSession}
                onUpdateSession={props.onUpdateSession}
                onOpenWizard={props.onOpenWizard}
            />
        );
    }

    if (currentView === 'workspace' && props.activeAgentConfig) {
        if (props.showPreview && props.lastDocument) {
            return (
                <ResizablePanel
                    left={
                        <ChatInterface
                            messages={props.messages}
                            isTyping={props.isTyping}
                            loadingStep={props.loadingStep}
                            onSendMessage={props.handleSendMessage}
                            agentType={props.activeAgentConfig.id}
                            existingSessions={props.sessions}
                            dossier={props.dossier}
                            onUpdateDossier={props.handleUpdateDossier}
                        />
                    }
                    right={
                        <div className="h-full bg-slate-100 dark:bg-slate-950 relative">
                            {props.isVadeMecumOpen && (
                                <VadeMecum
                                    onInsert={(text) => { props.handleExternalInsert(text); props.setIsVadeMecumOpen(false); }}
                                    onClose={() => props.setIsVadeMecumOpen(false)}
                                />
                            )}
                            <DocumentPreview
                                content={props.lastDocument}
                                userProfile={props.userProfile}
                                onSave={(content) => props.handleUpdateDocument(content, false)}
                                versions={props.documentVersions}
                                onRestore={(version) => props.handleUpdateDocument(version.content, true)}
                                onRefineWithAI={props.handleRefineRequest}
                                onSaveTemplate={props.handleSaveTemplate}
                                analysisRisks={props.latestRisks}
                            />
                        </div>
                    }
                    initialRightWidth={50}
                />
            );
        }

        return (
            <div className="w-full h-full relative">
                 {props.isVadeMecumOpen && (
                    <div className="absolute left-0 top-0 bottom-0 z-20">
                        <VadeMecum
                            onInsert={(text) => {
                                navigator.clipboard.writeText(text);
                                props.setToastMessage("Texto copiado para a área de transferência!");
                                props.setIsVadeMecumOpen(false);
                            }}
                            onClose={() => props.setIsVadeMecumOpen(false)}
                        />
                    </div>
                 )}
                 <ChatInterface
                    messages={props.messages}
                    isTyping={props.isTyping}
                    loadingStep={props.loadingStep}
                    onSendMessage={props.handleSendMessage}
                    agentType={props.activeAgentConfig.id}
                    existingSessions={props.sessions}
                    dossier={props.dossier}
                    onUpdateDossier={props.handleUpdateDossier}
                />
            </div>
        );
    }

    // 404 Fallback (Item 39 of Guide, Item 1 of Plan)
    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <h2 className="text-xl font-bold">Visualização não encontrada</h2>
            <button onClick={() => props.onEnterApp()} className="mt-4 text-emerald-600 underline">Voltar ao Início</button>
        </div>
    );
};

export default ViewManager;
