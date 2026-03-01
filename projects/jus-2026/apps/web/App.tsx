import React, { useState, useEffect, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import LegalTools from './components/LegalTools';
import JurisprudenceFinder from './components/JurisprudenceFinder';
import JudgeProfiler from './components/JudgeProfiler';
import ComparisonModal from './components/ComparisonModal';
import TimelineGenerator from './components/TimelineGenerator';
import VadeMecum from './components/VadeMecum';
import VoiceConsultant from './components/VoiceConsultant';
import IntentWizard from './components/IntentWizard';
import OnboardingTour from './components/OnboardingTour';
import LoginScreen from './components/LoginScreen';
import LandingPage from './components/LandingPage';
import Breadcrumbs from './components/Breadcrumbs';
import PetitionWizard from './components/PetitionWizard';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './components/ErrorBoundary';
import SkeletonLoader from './components/SkeletonLoader';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import MasterPasswordModal from './components/MasterPasswordModal';

const ViewManager = lazy(() => import('./components/ViewManager'));
import { FormProvider } from './contexts/FormContext';
import { useSessions } from './hooks/useSessions';
import { useChatController } from './hooks/useChatController';
import { useAppStore } from './store/useAppStore';
import { AgentType, Message, Attachment, UserProfile, Session, DocumentVersion } from './types';
import { saveTemplate, saveSession } from './services/storage';
import { ContractRisk, JudgeProfile } from './components/RichMessageRenderers';
import { sendMessageToGemini } from './services/gemini';
import * as Icons from 'lucide-react';

type ViewState = 'landing' | 'dashboard' | 'workspace';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => (
  <div className="fixed bottom-6 right-6 bg-purple-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 z-[100] animate-fade-in-up border border-purple-700 shadow-purple-900/50">
    <div className="bg-gold-500 rounded-full p-1 text-purple-900">
      <Icons.Check className="w-4 h-4" />
    </div>
    <div>
      <h4 className="font-bold text-sm">Notificação</h4>
      <p className="text-xs text-purple-200">{message}</p>
    </div>
    <button onClick={onClose} className="ml-4 text-purple-400 hover:text-white">
      <Icons.X className="w-4 h-4" />
    </button>
  </div>
);

// Componente Interno Principal
const AppContent = () => {
  const { user, loading, encryptionKey, setEncryptionKey } = useAuth();

  // Zustand State
  const {
      currentView, setCurrentView,
      modals, toggleModal,
      isDarkMode, toggleDarkMode,
      isFocusMode, toggleFocusMode
  } = useAppStore();

  // Custom Hooks
  const { sessions, setSessions, removeSession, updateSessionLocal } = useSessions(user?.uid);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
      const saved = localStorage.getItem('jusartificial_profile');
      return saved ? JSON.parse(saved) : {
        name: user?.displayName || "Dr. Advogado",
        oab: "",
        firmName: "Advocacia Especializada",
        preferences: { fontFamily: 'Times New Roman', fontSize: 12, theme: 'light', hasSeenOnboarding: false },
        globalVariables: { CIDADE: 'São Paulo', UF: 'SP' }
      };
  });

  // Persist Profile
  useEffect(() => {
      localStorage.setItem('jusartificial_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Chat Logic
  const {
      messages, setMessages, isTyping, loadingStep,
      currentAgent, setCurrentAgent, currentSessionId, setCurrentSessionId,
      activeAgentConfig, startNewSession, handleSendMessage: controllerSendMessage
  } = useChatController(userProfile, sessions);

  // Local State (View Specific)
  const [dossier, setDossier] = useState<Attachment[]>([]);
  const [lastDocument, setLastDocument] = useState<string | null>(null);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  const [latestRisks, setLatestRisks] = useState<ContractRisk[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [chatWidth, setChatWidth] = useState(50);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Load Session Logic
  const handleResumeSession = (session: Session) => {
    setCurrentAgent(session.agentId);
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setDossier(session.dossier || []);
    setLastDocument(session.lastDocument);
    setDocumentVersions(session.documentVersions || []);
    setLatestRisks(null);
    setShowPreview(!!session.lastDocument);
    setCurrentView('workspace');
  };

  const handleSelectAgent = async (agentId: AgentType, initialPrompt?: string) => {
      if (!user) return;

      const newSession = await startNewSession(agentId, user.uid, initialPrompt);

      // Reset Workspace State
      setDossier([]);
      setLastDocument(null);
      setDocumentVersions([]);
      setLatestRisks(null);
      setShowPreview(false);

      setCurrentView('workspace');

      if (initialPrompt) {
          // Send message
          setTimeout(() => handleSendMessage(initialPrompt, []), 100);
      } else if (agentId === AgentType.PETITION) {
          toggleModal('petitionWizard', true);
      }
  };

  const handleSendMessage = async (content: string, attachments: Attachment[]) => {
      try {
          await controllerSendMessage(content, attachments, dossier, lastDocument, user, (doc) => {
              // On Document Generation
              setLastDocument(doc);
              setShowPreview(true);
              setDocumentVersions(prev => [{
                  id: Date.now().toString(),
                  content: doc,
                  createdAt: new Date().toISOString(),
                  label: 'Gerado pela IA',
                  author: 'IA'
              }, ...prev]);
              setToastMessage("Documento atualizado pela IA.");
          });
      } catch (e) {
          console.error(e);
          setToastMessage("Erro ao enviar mensagem.");
      }
  };

  const handleGoToDashboard = () => setCurrentView('dashboard');

  const handleResetChat = () => {
      if (currentAgent && user) {
          // Starts a new session with the same agent
          startNewSession(currentAgent, user.uid);
      }
  };

  const handleWizardSubmit = async (data: any) => {
     if (user) {
         const prompt = `Gere uma petição com base nestes dados: ${JSON.stringify(data)}`;
         await handleSelectAgent(AgentType.PETITION, prompt);
         toggleModal('petitionWizard', false);
     }
  };

  // Item 36: Atalhos de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            toggleFocusMode();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '.') {
            e.preventDefault();
            toggleModal('settings');
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFocusMode, toggleModal]);

  useEffect(() => {
    if (user && user.displayName) {
        setUserProfile(prev => ({...prev, name: user.displayName!}));
    }
  }, [user]);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Initially set dark mode if system prefers, handled by store usually but init state
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Extract Risks
  useEffect(() => {
     if (messages.length > 0) {
         const lastModelMsg = [...messages].reverse().find(m => m.role === 'model');
         if (lastModelMsg) {
             const riskRegex = /:::RISK_REPORT::: (\[.*?\])\s*:::/s;
             const matchRisk = lastModelMsg.content.match(riskRegex);
             if (matchRisk && matchRisk[1]) {
                 try {
                     setLatestRisks(JSON.parse(matchRisk[1]));
                 } catch(e) {}
             }
         }
     }
  }, [messages]);

  if (loading) {
    return (
        <div className="h-screen flex items-center justify-center bg-slate-900 text-white flex-col">
            <Icons.Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
            <p className="text-slate-400">Carregando ambiente seguro...</p>
        </div>
    );
  }

  if (!user && currentView !== 'landing') {
     return <LoginScreen />;
  }

  // Item 1: Proteção Zero-Knowledge
  if (user && currentView !== 'landing' && !encryptionKey) {
      return <MasterPasswordModal onUnlock={setEncryptionKey} />;
  }

  const handleEnterApp = () => {
    if (!user) {
        setCurrentView('dashboard');
    } else {
        setCurrentView('dashboard');
        if (!userProfile.preferences?.hasSeenOnboarding && !localStorage.getItem('jusartificial_onboarding_completed')) {
            toggleModal('onboarding', true);
        }
    }
  };

  const handleFinishOnboarding = () => {
      toggleModal('onboarding', false);
      localStorage.setItem('jusartificial_onboarding_completed', 'true');
      setUserProfile({ ...userProfile, preferences: { ...userProfile.preferences!, hasSeenOnboarding: true } });
  };

  // Actions wrapped
  const handleDeleteSession = async (sessionId: string) => {
    const success = await removeSession(sessionId);
    if (success) {
        if (currentSessionId === sessionId) {
           setCurrentView('dashboard');
           setCurrentAgent(null);
           setCurrentSessionId(null);
        }
        setToastMessage("Sessão excluída.");
    }
  };

  const handleUpdateSession = async (sessionId: string, updates: Partial<Session>) => {
      if (!user) return;
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
          const updatedSession = { ...session, ...updates, updatedAt: new Date().toISOString() };
          await updateSessionLocal(updatedSession);
          setToastMessage("Caso atualizado.");
      }
  };

  const handleUpdateDossier = async (newDossier: Attachment[]) => {
      setDossier(newDossier);
      if (currentSessionId && user) {
          const session = sessions.find(s => s.id === currentSessionId);
          if (session) {
              await updateSessionLocal({ ...session, dossier: newDossier });
              setToastMessage("Dossiê atualizado.");
          }
      }
  };

  const handleUpdateDocument = async (newContent: string, isRevert = false) => {
    setLastDocument(newContent);
    let newVersions = [...documentVersions];

    if (!isRevert) {
        const newVersion: DocumentVersion = {
            id: Date.now().toString(),
            content: newContent,
            createdAt: new Date().toISOString(),
            label: `Edição Manual`,
            author: 'User'
        };
        newVersions = [newVersion, ...documentVersions];
        setDocumentVersions(newVersions);
        setToastMessage("Rascunho salvo!");
    } else {
        setToastMessage("Versão restaurada.");
    }

    if (currentSessionId && user) {
       const session = sessions.find(s => s.id === currentSessionId);
       if (session) {
          await updateSessionLocal({ ...session, lastDocument: newContent, documentVersions: newVersions });
       }
    }
  };

  const handleSaveTemplate = async (content: string) => {
      if (!user || !activeAgentConfig) return;
      const title = window.prompt("Nome do modelo:", "Novo Modelo");
      if (!title) return;

      try {
          await saveTemplate({
              userId: user.uid,
              title,
              description: `Criado via ${activeAgentConfig.name}`,
              content,
              agentId: activeAgentConfig.id,
              category: 'Pessoal'
          });
          setToastMessage("Modelo salvo com sucesso!");
      } catch (e) {
          setToastMessage("Erro ao salvar modelo.");
      }
  };

  const handleRefineRequest = async (textToRefine: string, instruction: string) => {
      if (!showPreview) setShowPreview(true);
      const prompt = `Refine o seguinte trecho: "${textToRefine.substring(0, 2000)}...". Instrução: ${instruction}`;

      const resp = await sendMessageToGemini(activeAgentConfig!, [], prompt, [], []);
      return resp.text;
  };

  const handleExternalInsert = (text: string) => {
      if (lastDocument) {
          handleUpdateDocument(lastDocument + "\n" + text, false);
          setToastMessage("Texto inserido no documento.");
          toggleModal('jurisprudence', false);
          toggleModal('timeline', false);
      } else {
          setToastMessage("Abra ou crie um documento primeiro.");
      }
  };

  const handleJudgeProfileSaved = (profile: JudgeProfile) => {
      setToastMessage("Perfil do juiz salvo no contexto.");
  };

  if (currentView === 'landing') {
    return <LandingPage onEnter={handleEnterApp} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar
        currentAgent={currentAgent}
        onSelectAgent={handleSelectAgent}
        onReset={handleResetChat}
        onGoToDashboard={handleGoToDashboard}
        onOpenSettings={() => toggleModal('settings', true)}
        recentSessions={sessions}
        onSelectSession={handleResumeSession}
        onUpdateSession={handleUpdateSession}
        currentSessionId={currentSessionId}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenLegalTools={() => toggleModal('legalTools', true)}
        onOpenJurisprudence={() => toggleModal('jurisprudence', true)}
        onOpenJudgeProfiler={() => toggleModal('judgeProfiler', true)}
        onOpenComparison={() => toggleModal('comparison', true)}
        onOpenTimeline={() => toggleModal('timeline', true)}
        onOpenVadeMecum={() => toggleModal('vadeMecum', true)}
        onOpenVoiceConsultant={() => toggleModal('voiceConsultant', true)}
        isCollapsed={isFocusMode}
      />

      <div className="flex-1 flex flex-col h-full relative">
        {currentView === 'workspace' && activeAgentConfig && (
          <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shadow-sm z-10 transition-colors">
            <div className="flex items-center space-x-4">
              <button onClick={toggleFocusMode} className="text-slate-400 hover:text-emerald-500">
                  {isFocusMode ? <Icons.Menu className="w-5 h-5"/> : <Icons.ChevronLeft className="w-5 h-5"/>}
              </button>
              <Breadcrumbs
                  items={['Escritório', activeAgentConfig.name, currentSession?.title || 'Novo Documento']}
                  onNavigate={(idx) => idx === 0 && handleGoToDashboard()}
              />
            </div>
            <div className="flex items-center space-x-3">
               {user?.photoURL && <img src={user.photoURL} className="w-6 h-6 rounded-full border border-slate-200" alt="User" />}
               <button onClick={() => toggleModal('vadeMecum', true)} className="hidden xl:flex items-center text-xs text-slate-500 hover:text-emerald-600 border px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                  <Icons.Book className="w-3 h-3 mr-1" /> Vade Mecum
               </button>
               <button onClick={() => toggleModal('jurisprudence', true)} className="hidden lg:flex items-center text-xs text-slate-500 hover:text-emerald-600 border px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                  <Icons.BookOpen className="w-3 h-3 mr-1" /> Jurisprudência
               </button>
               <button onClick={() => toggleModal('legalTools', true)} className="hidden md:flex items-center text-xs text-slate-500 hover:text-emerald-600 border px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                  <Icons.Briefcase className="w-3 h-3 mr-1" /> Ferramentas
               </button>
               {lastDocument && (
                 <button
                   onClick={() => setShowPreview(!showPreview)}
                   className={`text-sm px-3 py-1.5 rounded-md border flex items-center transition-colors ${
                      showPreview
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                   }`}
                 >
                   {showPreview ? <Icons.PanelRightClose className="w-4 h-4 mr-2"/> : <Icons.PanelRightOpen className="w-4 h-4 mr-2"/>}
                   {showPreview ? "Ocultar Doc" : "Ver Documento"}
                 </button>
               )}
            </div>
          </header>
        )}

        <div className="flex-1 overflow-hidden relative flex bg-slate-50 dark:bg-slate-900">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Suspense fallback={<div className="p-8"><SkeletonLoader /></div>}>
                  <ViewManager
                      currentView={currentView}
                      user={user}
                      onEnterApp={handleEnterApp}
                      onSelectAgent={handleSelectAgent}
                      userName={userProfile.name}
                      sessions={sessions}
                      onResumeSession={handleResumeSession}
                      onDeleteSession={handleDeleteSession}
                      onUpdateSession={handleUpdateSession}
                      onOpenWizard={() => toggleModal('intentWizard', true)}
                      activeAgentConfig={activeAgentConfig}
                      currentSession={currentSession}
                      showPreview={showPreview}
                      lastDocument={lastDocument}
                      messages={messages}
                      isTyping={isTyping}
                      loadingStep={loadingStep}
                      dossier={dossier}
                      documentVersions={documentVersions}
                      latestRisks={latestRisks}
                      userProfile={userProfile}
                      isVadeMecumOpen={modals.vadeMecum}
                      handleSendMessage={handleSendMessage}
                      handleUpdateDossier={handleUpdateDossier}
                      handleExternalInsert={handleExternalInsert}
                      setIsVadeMecumOpen={(val) => toggleModal('vadeMecum', val)}
                      handleUpdateDocument={handleUpdateDocument}
                      handleRefineRequest={handleRefineRequest}
                      handleSaveTemplate={handleSaveTemplate}
                      setToastMessage={setToastMessage}
                  />
              </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {modals.legalTools && <LegalTools onClose={() => toggleModal('legalTools', false)} />}
      {modals.jurisprudence && <JurisprudenceFinder onClose={() => toggleModal('jurisprudence', false)} onInsert={handleExternalInsert} userContext={userProfile.officeContext} />}
      {modals.judgeProfiler && <JudgeProfiler onClose={() => toggleModal('judgeProfiler', false)} onSaveToContext={handleJudgeProfileSaved} />}
      {modals.comparison && <ComparisonModal onClose={() => toggleModal('comparison', false)} />}
      {modals.timeline && <TimelineGenerator onClose={() => toggleModal('timeline', false)} onInsert={handleExternalInsert} />}
      {modals.petitionWizard && <PetitionWizard onClose={() => toggleModal('petitionWizard', false)} onSubmit={handleWizardSubmit} />}
      {modals.voiceConsultant && <VoiceConsultant onClose={() => toggleModal('voiceConsultant', false)} />}
      {modals.intentWizard && (
          <IntentWizard
            onClose={() => toggleModal('intentWizard', false)}
            onComplete={handleSelectAgent}
          />
      )}
      {modals.onboarding && <OnboardingTour onComplete={handleFinishOnboarding} />}
      <SettingsModal
         isOpen={modals.settings}
         onClose={() => toggleModal('settings', false)}
         currentProfile={userProfile}
         onSave={setUserProfile}
      />
    </div>
  );
};

export default function App() {
    return (
        <HelmetProvider>
            <AuthProvider>
                <FormProvider>
                    <AppContent />
                </FormProvider>
            </AuthProvider>
        </HelmetProvider>
    );
}
