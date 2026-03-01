import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import * as Icons from 'lucide-react';
import { UserProfile, DocumentVersion } from '../types';
import { anonymizeLGPD, exportToDocx, openJusbrasil, extractHeadings, generateSlug, formatABNT } from '../utils/helpers';
import { useSpeech } from '../hooks/useSpeech';
import AnimatedButton from './AnimatedButton';
import ClauseLibrary from './ClauseLibrary';
import { computeDiff, DiffPart } from '../utils/diffLogic';
import { ContractRisk } from './RichMessageRenderers';
import { checkCriticalHallucination } from '../utils/monitoring';
import SmartEditor from './SmartEditor';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { io, Socket } from 'socket.io-client'; // Item 2: Collab

interface DocumentPreviewProps {
  content: string;
  userProfile?: UserProfile;
  onSave?: (content: string) => void;
  versions?: DocumentVersion[];
  onRestore?: (version: DocumentVersion) => void;
  onRefineWithAI?: (text: string, instruction: string) => Promise<string>;
  onSaveTemplate?: (content: string) => void;
  analysisRisks?: ContractRisk[] | null;
}

const FONTS = [
    { name: 'Times New Roman', class: 'font-legal' },
    { name: 'Arial', class: 'font-sans' },
    { name: 'Garamond', class: 'font-serif' },
    { name: 'Courier New', class: 'font-mono' }
];

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
    content,
    userProfile,
    onSave,
    versions = [],
    onRestore,
    onRefineWithAI,
    onSaveTemplate,
    analysisRisks
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [variables, setVariables] = useState<string[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isClauseLibOpen, setIsClauseLibOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [isRisksOpen, setIsRisksOpen] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [currentFont, setCurrentFont] = useState(FONTS.find(f => f.name === userProfile?.preferences?.fontFamily) || FONTS[0]);
  const [showDiff, setShowDiff] = useState(false);
  const [diffData, setDiffData] = useState<DiffPart[]>([]);
  const [isZenMode, setIsZenMode] = useState(false);

  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [selectedText, setSelectedText] = useState('');
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const [showRefinePopover, setShowRefinePopover] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const documentAreaRef = useRef<HTMLDivElement>(null);

  // Collab State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const { isListening, toggleRecording, transcript, resetTranscript } = useSpeech();
  const { suggestion } = useAutocomplete(editedContent, isListening);

  const headings = extractHeadings(editedContent);

  // Item 2: Collab Init
  useEffect(() => {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001');
      setSocket(newSocket);

      newSocket.on('connect', () => {
          setIsConnected(true);
          const docId = 'demo-doc'; // In real app, sessionId
          newSocket.emit('join-document', docId);
      });

      newSocket.on('document-updated', (data: { content: string, user: string }) => {
          if (data.user !== newSocket.id) {
              setEditedContent(data.content);
              // Optional: Show toast "Updated by remote user"
          }
      });

      return () => {
          newSocket.disconnect();
      };
  }, []);

  // Sync edits to socket
  useEffect(() => {
      if (socket && isConnected && isEditing) {
          socket.emit('edit-document', {
              docId: 'demo-doc',
              content: editedContent,
              user: socket.id
          });
      }
  }, [editedContent, socket, isConnected, isEditing]);

  // Auto-open risks panel if new risks arrive
  useEffect(() => {
      if (analysisRisks && analysisRisks.length > 0) {
          setIsRisksOpen(true);
      }
  }, [analysisRisks]);

  useEffect(() => {
      if (!isListening && transcript) {
         if (textareaRef.current) {
             const start = textareaRef.current.selectionStart;
             const end = textareaRef.current.selectionEnd;
             const text = editedContent;
             const newText = text.substring(0, start) + ' ' + transcript + ' ' + text.substring(end);
             setEditedContent(newText);
             resetTranscript();
         } else {
             setEditedContent(prev => prev + ' ' + transcript);
             resetTranscript();
         }
      }
  }, [isListening, transcript, editedContent, resetTranscript]);


  useEffect(() => {
     if (!isEditing) setEditedContent(content);
     const regex = /{{(.*?)}}/g;
     const matches = content.match(regex);
     if (matches) {
         const uniqueVars = Array.from(new Set(matches.map(m => m.replace(/{{|}}/g, ''))));
         setVariables(uniqueVars);
         if (uniqueVars.length > 0) setShowVariables(true);
     } else {
         setVariables([]);
     }
  }, [content, isEditing]);

  useEffect(() => {
      if (userProfile?.preferences?.fontFamily) {
          const font = FONTS.find(f => f.name === userProfile.preferences!.fontFamily);
          if (font) setCurrentFont(font);
      }
  }, [userProfile]);

  useEffect(() => {
    if (showDiff && versions.length > 0) {
        const prevContent = versions[0].content;
        setDiffData(computeDiff(prevContent, editedContent));
    }
  }, [showDiff, versions, editedContent]);

  const toggleSpeech = () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    } else {
        const u = new SpeechSynthesisUtterance(editedContent);
        u.lang = 'pt-BR';
        u.rate = 1.2;
        u.onend = () => setIsSpeaking(false);
        utteranceRef.current = u;
        window.speechSynthesis.speak(u);
        setIsSpeaking(true);
    }
  };

  const insertText = (text: string) => {
      setEditedContent(prev => prev + '\n' + text);
      setIsEditing(true);
  };

  const handleDownloadDoc = async () => {
      // Tenta usar o backend para geração profissional (ABNT)
      try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          const response = await fetch(`${API_URL}/api/documents/export`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  content: editedContent,
                  metadata: {
                      firmName: userProfile?.firmName,
                      lawyerName: userProfile?.name,
                      oab: userProfile?.oab
                  }
              })
          });

          if (!response.ok) throw new Error("Backend export failed");

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Documento_${new Date().toISOString().slice(0,10)}.docx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
      } catch (e) {
          console.warn("Backend DOCX failed, falling back to simple export", e);
          exportToDocx(editedContent, `documento_${new Date().toISOString().slice(0,10)}`);
      }
  };

  const handlePrint = () => {
      window.print();
  };

  const handleDigitalSignature = () => {
      const date = new Date();
      const hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const mdSignature = `\n\n---\n\n**${userProfile?.name || 'Advogado'}**  \nOAB ${userProfile?.oab || '...'}  \n*Assinado digitalmente em ${date.toLocaleString()} (Hash: ${hash.toUpperCase()})*`;
      setEditedContent(prev => prev + mdSignature);
      setIsEditing(true);
      alert("Bloco de assinatura inserido no final do documento.");
  };

  const handleApplyLGPD = () => {
      const anon = anonymizeLGPD(editedContent);
      setEditedContent(anon);
      setIsEditing(true);
  };

  const handleFormatABNT = () => {
      const formatted = formatABNT(editedContent);
      setEditedContent(formatted);
      setIsEditing(true);
  };

  const handleSmartClean = () => {
      let cleaned = editedContent;
      cleaned = cleaned.replace(/([a-z0-9])\n([a-z0-9])/g, '$1 $2');
      cleaned = cleaned.replace(/[ \t]+/g, ' ');
      cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');
      setEditedContent(cleaned);
      setIsEditing(true);
      alert("Texto limpo! Quebras de linha corrigidas.");
  };

  const handleApplyVariables = () => {
      let newContent = editedContent;
      Object.keys(variableValues).forEach(key => {
          if (variableValues[key]) {
             const regex = new RegExp(`{{${key}}}`, 'g');
             newContent = newContent.replace(regex, variableValues[key]);
          }
      });
      setEditedContent(newContent);
      setVariables([]);
      setShowVariables(false);
      onSave?.(newContent);
  };

  const handleSaveWrapper = () => {
      if (versions.length > 0 && versions[0].author === 'IA') {
          checkCriticalHallucination(versions[0].content, editedContent);
      }
      onSave?.(editedContent);
      setIsEditing(false);
  };

  const handleTextSelect = () => {
      if (isEditing) return;
      const selection = window.getSelection();
      if (selection && selection.toString().length > 5) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectedText(selection.toString());
          setPopoverPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
          setShowRefinePopover(true);
      } else {
          setTimeout(() => {
              if (!document.activeElement?.closest('.refine-popover')) {
                  setShowRefinePopover(false);
              }
          }, 200);
      }
  };

  const handleRefine = async (instruction: string) => {
      if (onRefineWithAI && selectedText) {
          setShowRefinePopover(false);
          const newText = await onRefineWithAI(selectedText, instruction);
          setEditedContent(prev => prev.replace(selectedText, newText));
          setIsEditing(true);
      }
  };

  const handleSearchSelection = () => {
      if (selectedText) {
          openJusbrasil(selectedText);
          setShowRefinePopover(false);
      }
  };

  const scrollToId = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          element.style.backgroundColor = '#f0fdf4';
          setTimeout(() => element.style.backgroundColor = 'transparent', 1500);
      }
  };

  const TextWithSmartLinks = ({ children }: { children: string }) => {
      const parts = children.split(/((?:Art\.|artigo)\s*\d+(?:[.-]\d+)*|(?:Lei|lei)\s*(?:nº|no)?\s*\d+(?:\.\d+)*|CF\/88|CPC|CDC)/gi);
      return <>{parts.map((part, i) => {
          const lower = part.toLowerCase();
          let url = '';
          if (lower.includes('cf/88')) url = 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm';
          else if (lower.includes('cpc')) url = 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm';
          else if (lower.includes('cdc')) url = 'https://www.planalto.gov.br/ccivil_03/leis/l8078.htm';
          else if (lower.includes('lei') || lower.includes('art')) url = `https://www.google.com/search?q=${encodeURIComponent(part + ' planalto')}`;
          return url ? <a key={i} href={url} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">{part}</a> : part;
      })}</>;
  };

  const DiffView = () => (
      <div className="prose prose-slate dark:prose-invert max-w-none text-justify text-[12pt] leading-relaxed font-mono bg-slate-50 dark:bg-slate-900 p-4 rounded-lg overflow-y-auto h-[600px]">
         <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
            <span className="font-bold text-sm text-slate-500">Comparando com versão anterior</span>
            <div className="flex space-x-3 text-xs">
                <span className="flex items-center"><span className="w-3 h-3 bg-red-200 dark:bg-red-900/50 mr-1 rounded-sm"></span> Removido</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-green-200 dark:bg-green-900/50 mr-1 rounded-sm"></span> Adicionado</span>
            </div>
         </div>
         <div className="whitespace-pre-wrap">
            {diffData.map((part, index) => {
                if (part.type === 'eq') return <span key={index}>{part.value}</span>;
                if (part.type === 'add') return <span key={index} className="bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-0.5 rounded-sm">{part.value}</span>;
                if (part.type === 'del') return <span key={index} className="bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200 line-through px-0.5 rounded-sm opacity-70">{part.value}</span>;
                return null;
            })}
         </div>
      </div>
  );

  return (
    <div className={`${isZenMode ? 'fixed inset-0 z-[100] w-screen h-screen m-0 rounded-none' : 'h-full border-l border-slate-200 dark:border-slate-800'} bg-slate-100 dark:bg-slate-950 flex flex-col document-preview-container relative transition-colors`}>

      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center shadow-sm z-10 toolbar-actions gap-2 flex-wrap">
         <div className="flex items-center text-slate-600 dark:text-slate-300 space-x-2">
            <div className="flex items-center group mr-2">
                <Icons.FileText className="w-4 h-4 mr-2 text-emerald-600" />
                <span className="text-sm font-semibold hidden lg:inline">Minuta</span>
                {variables.length > 0 && (
                    <span onClick={() => setShowVariables(!showVariables)} className="ml-2 px-2 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded-full cursor-pointer hover:bg-amber-200 animate-pulse">
                        {variables.length} vars
                    </span>
                )}
                {/* Collab Indicator */}
                {isConnected && (
                    <span className="ml-2 px-2 py-0.5 text-[10px] bg-green-100 text-green-700 rounded-full flex items-center" title="Conectado ao servidor de colaboração">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span> Online
                    </span>
                )}
            </div>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>

            <select
               className="bg-transparent text-xs font-medium border-none focus:ring-0 cursor-pointer text-slate-600 dark:text-slate-300 p-1 w-24 sm:w-auto"
               value={currentFont.name}
               onChange={(e) => setCurrentFont(FONTS.find(f => f.name === e.target.value) || FONTS[0])}
            >
               {FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
            </select>

            <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600" title="Histórico"><Icons.Clock className="w-4 h-4" /></button>
            <button onClick={() => setShowDiff(!showDiff)} className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${showDiff ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-500'}`} title="Comparar"><Icons.GitCompare className="w-4 h-4" /></button>
            <button onClick={() => setIsClauseLibOpen(!isClauseLibOpen)} className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${isClauseLibOpen ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-500'}`} title="Banco de Cláusulas"><Icons.BookOpen className="w-4 h-4" /></button>

            <button onClick={() => setIsOutlineOpen(!isOutlineOpen)} className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${isOutlineOpen ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-500'}`} title="Estrutura (Sumário)"><Icons.List className="w-4 h-4" /></button>

            {analysisRisks && analysisRisks.length > 0 && (
                <button onClick={() => setIsRisksOpen(!isRisksOpen)} className={`p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 ${isRisksOpen ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-slate-500'}`} title="Auditoria de Riscos">
                    <Icons.AlertTriangle className="w-4 h-4" />
                    <span className="ml-1 text-[10px] font-bold bg-red-100 text-red-600 px-1 rounded-full">{analysisRisks.length}</span>
                </button>
            )}

            <button onClick={handlePrint} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600" title="Imprimir/PDF"><Icons.Printer className="w-4 h-4" /></button>
         </div>

         <div className="flex space-x-1 items-center">
            <button onClick={toggleSpeech} className={`p-1.5 mr-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${isSpeaking ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} title="Ler em Voz Alta (Revisão)">
                {isSpeaking ? <Icons.Square className="w-4 h-4 fill-current"/> : <Icons.Play className="w-4 h-4"/>}
            </button>

           <button onClick={() => setIsZenMode(!isZenMode)} className={`p-1.5 mr-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${isZenMode ? 'text-emerald-600' : 'text-slate-500'}`} title={isZenMode ? "Sair do Modo Foco" : "Modo Foco"}>
              {isZenMode ? <Icons.Minimize className="w-4 h-4" /> : <Icons.Maximize className="w-4 h-4" />}
           </button>

           {!isEditing && (
             <>
                <AnimatedButton variant="ghost" onClick={handleSmartClean} title="Limpar Formatação (PDF)" icon="Eraser" className="p-2 text-purple-600" />
                <AnimatedButton variant="ghost" onClick={handleFormatABNT} title="Formatar ABNT" icon="AlignLeft" className="p-2 text-blue-600" />
                <AnimatedButton variant="ghost" onClick={handleApplyLGPD} title="Anonimizar (LGPD)" icon="EyeOff" className="p-2" />
                <AnimatedButton variant="ghost" onClick={handleDigitalSignature} title="Assinar Digitalmente" icon="PenTool" className="p-2 text-teal-600" />
                <AnimatedButton variant="ghost" onClick={() => onSaveTemplate?.(editedContent)} title="Salvar como Modelo" icon="FilePlus" className="p-2 text-amber-600" />
                <AnimatedButton variant="secondary" onClick={() => setIsEditing(true)} icon="Edit" label="Editar" className="text-xs px-3 py-1.5" />
             </>
           )}
           {isEditing && (
             <AnimatedButton variant="primary" onClick={handleSaveWrapper} icon="Save" label="Salvar" className="text-xs px-3 py-1.5" />
           )}
           <div className="flex gap-1">
               <AnimatedButton variant="secondary" onClick={handleDownloadDoc} icon="Download" label="Word" className="text-xs px-3 py-1.5 hidden sm:flex" />
               <AnimatedButton variant="secondary" onClick={handlePrint} icon="FileText" label="PDF" className="text-xs px-3 py-1.5 hidden sm:flex" />
           </div>
         </div>
      </div>

      {showVariables && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 p-4 animate-fade-in-down">
              <h4 className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase mb-2 flex items-center"><Icons.Zap className="w-3 h-3 mr-1"/> Variáveis Detectadas (Templates)</h4>
              <div className="grid grid-cols-2 gap-3">
                  {variables.map(v => (
                      <input key={v} type="text" placeholder={`Valor para ${v}`} className="text-xs p-1.5 border rounded dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-amber-500 outline-none" onChange={(e) => setVariableValues({...variableValues, [v]: e.target.value})} />
                  ))}
              </div>
              <div className="mt-3 flex justify-end"><AnimatedButton variant="primary" onClick={handleApplyVariables} label="Preencher Tudo" className="text-xs px-3 py-1 bg-amber-600 hover:bg-amber-700" /></div>
          </div>
      )}

      {isRisksOpen && analysisRisks && (
          <div className="absolute top-[57px] right-0 bottom-0 w-80 bg-red-50/95 dark:bg-slate-900/95 border-l border-red-100 dark:border-slate-800 z-20 backdrop-blur-sm overflow-y-auto p-4 animate-fade-in-left shadow-xl">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center"><Icons.AlertTriangle className="w-4 h-4 mr-2"/> Auditoria de Riscos</h4>
                  <button onClick={() => setIsRisksOpen(false)}><Icons.X className="w-3 h-3 text-slate-400"/></button>
              </div>
              <div className="space-y-4">
                  {analysisRisks.map((risk, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-red-200 dark:border-red-900 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{risk.clausula}</span>
                              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${risk.nivel === 'Alto' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-slate-900'}`}>{risk.nivel}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">{risk.problema}</p>
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                               <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mb-2"><Icons.Sparkles className="w-3 h-3 inline mr-1"/>Sugestão: {risk.sugestao}</p>
                               <AnimatedButton
                                    variant="secondary"
                                    onClick={() => {
                                        navigator.clipboard.writeText(risk.sugestao);
                                        alert("Sugestão copiada! Cole no local correto do texto.");
                                        setIsEditing(true);
                                    }}
                                    className="w-full text-[10px] py-1 h-auto"
                                    label="Copiar Sugestão"
                                    icon="Copy"
                               />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {isOutlineOpen && !isEditing && (
          <div className="absolute top-[57px] left-0 bottom-0 w-64 bg-slate-50/95 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 z-20 backdrop-blur-sm overflow-y-auto p-4 animate-fade-in-right">
              <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estrutura</h4>
                  <button onClick={() => setIsOutlineOpen(false)}><Icons.X className="w-3 h-3 text-slate-400"/></button>
              </div>
              <ul className="space-y-1">
                  {headings.map((h, i) => (
                      <li key={i} style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
                          <button
                              onClick={() => scrollToId(h.id)}
                              className="text-left w-full text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-1 truncate transition-colors"
                          >
                              {h.text}
                          </button>
                      </li>
                  ))}
                  {headings.length === 0 && <li className="text-xs text-slate-400 italic">Nenhum título encontrado. Use # para criar seções.</li>}
              </ul>
          </div>
      )}

      <div className="flex-1 overflow-y-auto legal-scroll p-4 sm:p-8 document-content bg-slate-200/50 dark:bg-slate-900/50" onMouseUp={handleTextSelect}>
        <div ref={documentAreaRef} className={`max-w-[210mm] mx-auto bg-white dark:bg-slate-800 shadow-xl min-h-[297mm] p-[15mm] sm:p-[20mm] relative transition-colors ${currentFont.class}`}>

          <div className="text-center mb-8 pb-4 border-b-2 border-slate-900 dark:border-slate-600">
             <h2 className="font-serif text-xl font-bold uppercase text-slate-900 dark:text-slate-100 tracking-wide">{userProfile?.firmName || "Escritório Jurídico"}</h2>
          </div>

          {showDiff && versions.length > 0 ? <DiffView /> : (
              isEditing ? (
                 <div className="h-full">
                     <SmartEditor
                        content={editedContent}
                        onUpdate={setEditedContent}
                        isEditable={true}
                        suggestion={suggestion || undefined}
                     />
                 </div>
              ) : (
                <div id="document-render-area" className={`prose prose-slate dark:prose-invert max-w-none text-justify text-[12pt] leading-relaxed text-slate-900 dark:text-slate-200 ${currentFont.class}`} style={{ fontFamily: currentFont.name }}>
                    <ReactMarkdown
                        components={{
                            p: ({children}) => <p className="mb-4 indent-12"><TextWithSmartLinks>{String(children)}</TextWithSmartLinks></p>,
                            h1: ({children}) => <h1 id={generateSlug(String(children))} className="font-bold text-lg mb-4 mt-6">{children}</h1>,
                            h2: ({children}) => <h2 id={generateSlug(String(children))} className="font-bold text-md mb-3 mt-5">{children}</h2>,
                            h3: ({children}) => <h3 id={generateSlug(String(children))} className="font-bold text-sm mb-2 mt-4">{children}</h3>,
                            table: ({children}) => <div className="overflow-x-auto my-4 border border-slate-200 rounded-lg"><table className="min-w-full text-sm">{children}</table></div>,
                            thead: ({children}) => <thead className="bg-slate-50 dark:bg-slate-700">{children}</thead>,
                            th: ({children}) => <th className="px-4 py-2 font-bold text-left">{children}</th>,
                            td: ({children}) => <td className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">{children}</td>,
                        }}
                    >
                        {editedContent}
                    </ReactMarkdown>
                </div>
              )
          )}

          <div className="mt-16 pt-8 border-t border-slate-300 dark:border-slate-600 text-center break-inside-avoid">
             <p className="text-[12pt] font-bold text-slate-900 dark:text-slate-100">{userProfile?.name}</p>
             <p className="text-[10pt] text-slate-600 dark:text-slate-400">{userProfile?.oab}</p>
          </div>
        </div>
      </div>

      {isClauseLibOpen && (
          <ClauseLibrary onInsert={(text) => { insertText(text); setIsClauseLibOpen(false); }} onClose={() => setIsClauseLibOpen(false)} />
      )}

      {showRefinePopover && (
          <div className="refine-popover fixed bg-slate-800 text-white p-1.5 rounded-lg shadow-xl z-50 flex space-x-1 items-center animate-fade-in-up" style={{ left: popoverPos.x, top: popoverPos.y, transform: 'translate(-50%, -100%)' }}>
              <span className="text-[10px] font-bold mr-1 px-1 text-emerald-400">IA:</span>
              <button onClick={() => handleRefine('Reescrever mais formalmente')} className="text-xs hover:bg-slate-700 px-2 py-1 rounded flex items-center"><Icons.Feather className="w-3 h-3 mr-1"/> Formal</button>
              <button onClick={() => handleRefine('Resumir este parágrafo')} className="text-xs hover:bg-slate-700 px-2 py-1 rounded flex items-center"><Icons.Minimize2 className="w-3 h-3 mr-1"/> Resumir</button>
              <button onClick={() => handleRefine('Expandir argumentação jurídica')} className="text-xs hover:bg-slate-700 px-2 py-1 rounded flex items-center"><Icons.Maximize2 className="w-3 h-3 mr-1"/> Expandir</button>
              <div className="w-px h-4 bg-slate-600 mx-1"></div>
              <button onClick={handleSearchSelection} className="text-xs hover:bg-slate-700 px-2 py-1 rounded flex items-center text-blue-300"><Icons.Search className="w-3 h-3 mr-1"/> Jusbrasil</button>
          </div>
      )}

      {isHistoryOpen && (
          <div className="absolute top-12 left-6 w-64 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-lg z-20 animate-fade-in-down">
              <div className="p-3 border-b dark:border-slate-700 font-bold text-xs flex justify-between items-center">
                  <span>Histórico</span>
                  <Icons.X className="w-3 h-3 cursor-pointer text-slate-400" onClick={() => setIsHistoryOpen(false)} />
              </div>
              <div className="max-h-60 overflow-y-auto">
                  {versions.length === 0 && <div className="p-4 text-xs text-slate-400 text-center">Nenhuma versão anterior.</div>}
                  {versions.map(v => (
                      <div key={v.id} onClick={() => onRestore?.(v)} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b dark:border-slate-700 last:border-0 group">
                          <div className="text-xs font-bold text-emerald-600 flex justify-between">
                              {v.label}
                              <span className="text-[9px] text-slate-400 font-normal">{v.author}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">{new Date(v.createdAt).toLocaleString()}</div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default DocumentPreview;