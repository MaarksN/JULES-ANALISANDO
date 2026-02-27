import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, AgentType, Attachment, Session } from '../types';
import { AGENTS } from '../constants';
import * as Icons from 'lucide-react';
import { validateLegalCitations } from '../utils/helpers';
import LoadingSteps from './LoadingSteps';
import SkeletonLoader from './SkeletonLoader';
import { useSpeech } from '../hooks/useSpeech';
import VoiceConsultant from './VoiceConsultant';
import SourceCitations from './SourceCitations';
import {
    JurisprudenceCard, JurisprudenceItem,
    JudgeProfileCard, JudgeProfile,
    RiskReportCard, ContractRisk,
    StrategyCritiqueCard, StrategyWeakness
} from './RichMessageRenderers';

interface ChatInterfaceProps {
  messages: Message[];
  isTyping: boolean;
  loadingStep?: string;
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  agentType: AgentType;
  existingSessions?: Session[];
  onDuplicateFound?: (session: Session) => void;
  dossier?: Attachment[];
  onUpdateDossier?: (newDossier: Attachment[]) => void;
}

const SLASH_COMMANDS = [
  { command: '/limpar', description: 'Limpar conversa atual', action: 'clear' },
  { command: '/resumir', description: 'Resumir o contexto', prompt: 'Resuma os fatos e argumentos apresentados até agora.' },
  { command: '/formal', description: 'Reescrever formalmente', prompt: 'Reescreva a última resposta com tom extremamente formal e culto.' },
  { command: '/expandir', description: 'Expandir argumento', prompt: 'Expanda o último ponto com mais detalhes e fundamentos teóricos.' }
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isTyping,
  onSendMessage,
  agentType,
  dossier = [],
  onUpdateDossier
}) => {
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [dossierSearch, setDossierSearch] = useState(''); // Item 28: Busca Interna
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null); // Item 23: Preview
  const [isVoiceConsultantOpen, setIsVoiceConsultantOpen] = useState(false); // Item 3: Voice UX

  // Slash Commands
  const [showCommands, setShowCommands] = useState(false);
  const [commandFilter, setCommandFilter] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dossierInputRef = useRef<HTMLInputElement>(null);

  // Hook Speech
  const { isListening, toggleRecording, transcript, resetTranscript } = useSpeech((text) => {
      // Opcional: atualização em tempo real se necessário
  });

  const activeAgentConfig = AGENTS[agentType];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, attachments]);

  // Sync Transcript to Input
  useEffect(() => {
      if (isListening && transcript) {
         setInputValue(prev => {
             return transcript;
         });
      }
  }, [transcript, isListening]);

  useEffect(() => {
    if (inputValue.startsWith('/')) {
        setCommandFilter(inputValue.substring(1).toLowerCase());
        setShowCommands(true);
        setSelectedCommandIndex(0);
    } else {
        setShowCommands(false);
    }
  }, [inputValue]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, isDossierUpload = false) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: Attachment[] = [];

      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];

        // Item 62: Validação de Segurança
        if (!validateFileSecurity(file)) {
            alert(`Arquivo bloqueado por segurança: ${file.name}. Formato não permitido.`);
            continue;
        }

        // Upload Pipeline (Backend Processing)
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Upload to backend to get text extracted (OCR/PDF)
            // Note: For large files, show a spinner in real UI.
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                // We store the extracted text as 'data' (base64 encoded text) to simulate "file content" for the AI context
                // This replaces sending raw PDF base64 to the prompt which is heavy
                const textBase64 = btoa(unescape(encodeURIComponent(data.text))); // UTF-8 safe base64

                newFiles.push({
                    name: file.name,
                    mimeType: 'text/plain', // Converted to text context
                    data: textBase64
                });
            } else {
                console.error("Upload failed");
            }
        } catch (e) {
            console.error("Upload error", e);
        }
      }

      if (newFiles.length > 0) {
          if (isDossierUpload) {
              onUpdateDossier?.([...dossier, ...newFiles]);
              if (dossierInputRef.current) dossierInputRef.current.value = '';
              setIsDossierOpen(true);
          } else {
              setAttachments(prev => [...prev, ...newFiles]);
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      }
    }
  };

  const executeCommand = (cmd: typeof SLASH_COMMANDS[0]) => {
      setInputValue('');
      setShowCommands(false);
      if (cmd.action === 'clear') {
         if (window.confirm("Limpar histórico da tela? (Isso não apaga a memória da IA)")) {
            window.location.reload();
         }
      } else if (cmd.prompt) {
         onSendMessage(cmd.prompt, []);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && attachments.length === 0) return;

    if (inputValue.startsWith('/')) {
        const cmd = SLASH_COMMANDS.find(c => c.command === inputValue.split(' ')[0]);
        if (cmd) { executeCommand(cmd); return; }
    }

    onSendMessage(inputValue, attachments);
    setInputValue('');
    resetTranscript();
    setAttachments([]);
  };

  const handleExternalSearch = (term: string, site: 'jusbrasil' | 'google' | 'stj') => {
      if (!term) return;
      const encoded = encodeURIComponent(term);
      let url = '';
      switch(site) {
          case 'jusbrasil': url = `https://www.jusbrasil.com.br/busca?q=${encoded}`; break;
          case 'google': url = `https://www.google.com/search?q=${encoded}`; break;
          case 'stj': url = `https://www.stj.jus.br/sites/portalp/Pesquisa.aspx?q=${encoded}`; break;
      }
      window.open(url, '_blank');
  };

  const linkifyLaws = (text: string) => {
    let processedText = text;
    processedText = processedText.replace(/(?:Art\.|Artigo)\s?(\d+(?:-[A-Z])?)/gi, '[$&](https://www.google.com/search?q=Artigo+$1+planalto)');
    processedText = processedText.replace(/(?:Lei|Decreto)\s?n?º?\s?([\d\.]+)/gi, '[$&](https://www.google.com/search?q=Lei+$1+planalto)');
    return processedText;
  };

  // Helper para processar conteúdo rico e sugestões
  const processMessageContent = (content: string) => {
      let displayContent = content;

      // Item 6: Ocultar Auto-Reflexão (<thinking>...</thinking>)
      displayContent = displayContent.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');

      // Extractors regex... (Mantido do original)
      const suggestionRegex = /:::SUGGESTIONS::: (\[.*?\])/s;
      const matchSugg = displayContent.match(suggestionRegex);
      let suggestions: string[] = [];
      if (matchSugg && matchSugg[1]) {
          try { suggestions = JSON.parse(matchSugg[1]); displayContent = displayContent.replace(suggestionRegex, '').trim(); } catch(e){}
      }

      const jurisRegex = /:::JURIS_LIST::: (\[.*?\])\s*:::/s;
      const matchJuris = displayContent.match(jurisRegex);
      let jurisItems: JurisprudenceItem[] | null = null;
      if (matchJuris && matchJuris[1]) {
          try { jurisItems = JSON.parse(matchJuris[1]); displayContent = displayContent.replace(jurisRegex, '').trim(); } catch(e){}
      }

      const judgeRegex = /:::JUDGE_PROFILE::: ({.*?})\s*:::/s;
      const matchJudge = displayContent.match(judgeRegex);
      let judgeProfile: JudgeProfile | null = null;
      if (matchJudge && matchJudge[1]) {
          try { judgeProfile = JSON.parse(matchJudge[1]); displayContent = displayContent.replace(judgeRegex, '').trim(); } catch(e){}
      }

      const riskRegex = /:::RISK_REPORT::: (\[.*?\])\s*:::/s;
      const matchRisk = displayContent.match(riskRegex);
      let risks: ContractRisk[] | null = null;
      if (matchRisk && matchRisk[1]) {
          try { risks = JSON.parse(matchRisk[1]); displayContent = displayContent.replace(riskRegex, '').trim(); } catch(e){}
      }

      const weakRegex = /:::WEAKNESS_REPORT::: (\[.*?\])\s*:::/s;
      const matchWeak = displayContent.match(weakRegex);
      let weaknesses: StrategyWeakness[] | null = null;
      if (matchWeak && matchWeak[1]) {
          try { weaknesses = JSON.parse(matchWeak[1]); displayContent = displayContent.replace(weakRegex, '').trim(); } catch(e){}
      }

      return { displayContent, suggestions, jurisItems, judgeProfile, risks, weaknesses };
  };

  const removeDossierItem = (index: number) => {
    if (onUpdateDossier) {
        const newDossier = [...dossier];
        newDossier.splice(index, 1);
        onUpdateDossier(newDossier);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const filteredCommands = SLASH_COMMANDS.filter(c => c.command.includes(commandFilter));

  // Item 28: Filtro do Dossiê
  const filteredDossier = dossier.filter(f => f.name.toLowerCase().includes(dossierSearch.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 relative chat-interface transition-colors overflow-hidden">

      {/* Header com botão de Dossiê */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex justify-between items-center shrink-0">
         <div className="flex items-center text-xs text-slate-500">
            <Icons.Shield className="w-3 h-3 mr-1 text-emerald-500"/> Ambiente Seguro
         </div>
         <button onClick={() => setIsDossierOpen(!isDossierOpen)} className={`text-xs flex items-center px-3 py-1.5 rounded-full border transition-all ${dossier.length > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}>
            <Icons.FolderOpen className="w-3 h-3 mr-2" /> Dossiê ({dossier.length})
         </button>
      </div>

      {/* Painel Lateral do Dossiê */}
      <div className={`absolute top-10 right-0 bottom-16 w-72 bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 z-20 shadow-lg transform transition-transform duration-300 flex flex-col ${isDossierOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="p-4 bg-indigo-100 dark:bg-indigo-900/20 border-b border-indigo-200 dark:border-indigo-800">
            <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 flex items-center"><Icons.Briefcase className="w-4 h-4 mr-2"/> Arquivos do Caso</h4>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">IA lê estes arquivos via OCR.</p>
         </div>
         {/* Item 28: Busca Interna */}
         <div className="p-2 border-b border-slate-200 dark:border-slate-700">
             <div className="relative">
                 <Icons.Search className="w-3 h-3 absolute left-2 top-2 text-slate-400"/>
                 <input
                    type="text"
                    placeholder="Filtrar arquivos..."
                    value={dossierSearch}
                    onChange={(e) => setDossierSearch(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 text-xs border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500"
                 />
             </div>
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredDossier.map((file, idx) => (
               <div key={idx} className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-400 transition-colors cursor-pointer" onClick={() => setPreviewFile(file)}>
                  <div className="flex items-center flex-1 min-w-0">
                      {file.mimeType.includes('image') ? <Icons.Image className="w-3 h-3 text-purple-500 mr-2 shrink-0"/> : <Icons.FileText className="w-3 h-3 text-blue-500 mr-2 shrink-0"/>}
                      <span className="text-xs truncate text-slate-700 dark:text-slate-300" title={file.name}>{file.name}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeDossierItem(idx); }} className="text-slate-400 hover:text-red-500 p-1"><Icons.Trash2 className="w-3 h-3"/></button>
               </div>
            ))}
            {filteredDossier.length === 0 && <div className="text-center text-xs text-slate-400 py-4">Nenhum arquivo encontrado.</div>}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 mt-auto">
                <input type="file" multiple ref={dossierInputRef} onChange={(e) => handleFileSelect(e, true)} className="hidden" accept=".pdf,.doc,.docx,.txt,image/*" />
                <button onClick={() => dossierInputRef.current?.click()} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 rounded flex items-center justify-center">
                    <Icons.Upload className="w-3 h-3 mr-2" /> Adicionar (OCR/Word)
                </button>
            </div>
         </div>
      </div>

      {/* Item 23: Modal de Preview */}
      {previewFile && (
          <div className="absolute inset-0 z-50 bg-slate-900/90 flex flex-col animate-fade-in-up">
              <div className="flex justify-between items-center p-4 bg-slate-800 border-b border-slate-700">
                  <span className="text-white text-sm font-bold flex items-center truncate">
                      <Icons.Eye className="w-4 h-4 mr-2" /> {previewFile.name}
                  </span>
                  <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-white"><Icons.X className="w-5 h-5"/></button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex justify-center bg-slate-950">
                  {previewFile.mimeType.includes('image') ? (
                      <img src={`data:${previewFile.mimeType};base64,${previewFile.data}`} className="max-w-full max-h-full object-contain rounded" alt="Preview" />
                  ) : previewFile.mimeType === 'application/pdf' ? (
                      <iframe src={`data:application/pdf;base64,${previewFile.data}`} className="w-full h-full rounded border-none" title="PDF Preview"></iframe>
                  ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                          <Icons.File className="w-16 h-16 mb-4"/>
                          <p>Visualização não disponível para este formato.</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-8 legal-scroll pb-32">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full mb-6">
               {React.createElement((Icons as any)[activeAgentConfig.icon] || Icons.HelpCircle, { className: "w-12 h-12 text-emerald-600" })}
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8 font-serif">{activeAgentConfig.name}</h3>
            <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
               {activeAgentConfig.suggestedPrompts.map((prompt, idx) => (
                  <button key={idx} onClick={() => onSendMessage(prompt, [])} className="text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-slate-800 transition-all text-sm text-slate-700 dark:text-slate-300 flex items-center bg-white dark:bg-slate-800 shadow-sm">
                     <Icons.MessageCircle className="w-4 h-4 mr-3 text-slate-400" /> {prompt}
                  </button>
               ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const { displayContent, suggestions, jurisItems, judgeProfile, risks, weaknesses } = msg.role === 'model'
              ? processMessageContent(msg.content)
              : { displayContent: msg.content, suggestions: [], jurisItems: null, judgeProfile: null, risks: null, weaknesses: null };

          const validation = msg.role === 'model' ? validateLegalCitations(displayContent) : null;

          return (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm border ${msg.role === 'user' ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-700' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'}`}>
              {msg.role === 'model' && (
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">
                   <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">JusArtificial</span>
                        {/* Validation Badge */}
                        {validation && (
                            <span className={`text-[10px] px-1.5 rounded flex items-center ${validation.isValid ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'}`} title={validation.message}>
                                {validation.isValid ? <Icons.CheckCircle className="w-3 h-3 mr-1"/> : <Icons.AlertTriangle className="w-3 h-3 mr-1"/>}
                                {validation.isValid ? 'Verificado' : 'Atenção'}
                            </span>
                        )}
                   </div>
                   <div className="flex space-x-1">
                      <button onClick={() => handleExternalSearch(messages[messages.length-2]?.content?.substring(0, 50) || "direito", 'jusbrasil')} className="text-[10px] text-emerald-600 dark:text-emerald-400 px-1 rounded flex items-center hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                          <Icons.Search className="w-3 h-3 mr-1" /> Jusbrasil
                      </button>
                   </div>
                </div>
              )}

              {msg.attachments && msg.attachments.length > 0 && (
                 <div className="mb-3 flex flex-wrap gap-2">
                    {msg.attachments.map((att, idx) => (
                       <div key={idx} onClick={() => setPreviewFile(att)} className="flex items-center p-2 rounded text-xs border bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                          <Icons.FileText className="w-4 h-4 mr-2 opacity-70" /> {att.name}
                       </div>
                    ))}
                 </div>
              )}

              {/* Conteúdo de Texto */}
              <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-slate dark:prose-invert'}`}>
                <ReactMarkdown components={{ a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" {...props} /> }}>
                    {linkifyLaws(displayContent)}
                </ReactMarkdown>
              </div>

              {/* Componentes Ricos */}
              {jurisItems && <JurisprudenceCard items={jurisItems} />}
              {judgeProfile && <JudgeProfileCard profile={judgeProfile} />}
              {risks && <RiskReportCard risks={risks} />}
              {weaknesses && <StrategyCritiqueCard weaknesses={weaknesses} />}

              {/* Sugestões de Próximos Passos */}
              {suggestions.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                      {suggestions.map((sug, i) => (
                          <button
                             key={i}
                             onClick={() => onSendMessage(sug, [])}
                             className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors text-left"
                          >
                             {sug}
                          </button>
                      ))}
                  </div>
              )}

              {/* Visualização de Fontes */}
              {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                  <SourceCitations sources={msg.sources} />
              )}
            </div>
          </div>
        )})}

        {isTyping && (
           <div className="flex flex-col space-y-2 max-w-[85%] mt-2">
               {messages.length > 0 ? <LoadingSteps /> : <SkeletonLoader />}
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showCommands && (
        <div className="absolute bottom-24 left-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-64 z-20 overflow-hidden">
            {filteredCommands.map((cmd, idx) => (
                <button key={idx} onClick={() => executeCommand(cmd)} className={`w-full text-left px-3 py-2 text-sm flex justify-between hover:bg-emerald-50 dark:hover:bg-emerald-900/30 ${idx === selectedCommandIndex ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''}`}>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{cmd.command}</span>
                    <span className="text-xs text-slate-400">{cmd.description}</span>
                </button>
            ))}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4 transition-colors">
        {!inputValue && messages.length > 0 && (
            <div className="flex justify-center space-x-2 mb-2">
                <button type="button" onClick={() => handleExternalSearch(messages[messages.length-1].content.slice(0, 50), 'jusbrasil')} className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-slate-500 hover:text-emerald-500">
                    Pesquisar no Jusbrasil
                </button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 px-1">
              {attachments.map((file, idx) => (
                <div key={idx} className="relative flex items-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs pl-2 pr-8 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button type="button" onClick={() => removeAttachment(idx)} className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 hover:text-red-500"><Icons.X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-end bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
            <input type="file" multiple ref={fileInputRef} onChange={(e) => handleFileSelect(e, false)} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 mb-1 ml-1 text-slate-400 hover:text-emerald-600 transition-colors">
               <Icons.Paperclip className="w-5 h-5" />
            </button>
            <button type="button" onClick={toggleRecording} className={`p-3 mb-1 text-slate-400 hover:text-emerald-600 ${isListening ? 'text-red-500 animate-pulse' : ''}`}>
               <Icons.Mic className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => setIsVoiceConsultantOpen(true)} className="p-3 mb-1 text-slate-400 hover:text-emerald-600" title="Consultor de Voz (Gemini Live)">
               <Icons.Headphones className="w-5 h-5" />
            </button>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite ou use / para comandos..."
              className="w-full bg-transparent border-none focus:ring-0 resize-none py-4 pl-2 pr-14 min-h-[60px] max-h-[160px] text-slate-700 dark:text-slate-200 placeholder-slate-400"
              rows={1}
            />
            <div className="absolute right-2 bottom-2">
               <button type="submit" disabled={(!inputValue.trim() && attachments.length === 0) || isTyping} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md disabled:bg-slate-300 dark:disabled:bg-slate-700">
                <Icons.Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {isVoiceConsultantOpen && <VoiceConsultant onClose={() => setIsVoiceConsultantOpen(false)} />}
    </div>
  );
};

export default ChatInterface;