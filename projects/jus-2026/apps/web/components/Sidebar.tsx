import React, { useMemo, useState, useEffect } from 'react';
import { AgentType, Session } from '../types';
import { AGENTS } from '../constants';
import * as Icons from 'lucide-react';
import GlobalSearch from './GlobalSearch';

interface SidebarProps {
  currentAgent: AgentType | null;
  onSelectAgent: (agent: AgentType) => void;
  onReset: () => void;
  onGoToDashboard: () => void;
  onOpenSettings: () => void;
  recentSessions?: Session[];
  onSelectSession?: (session: Session) => void;
  onUpdateSession?: (id: string, updates: Partial<Session>) => void;
  currentSessionId?: string | null;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenLegalTools?: () => void;
  onOpenJurisprudence?: () => void;
  onOpenJudgeProfiler?: () => void;
  onOpenComparison?: () => void;
  onOpenTimeline?: () => void;
  onOpenVadeMecum?: () => void;
  onOpenVoiceConsultant?: () => void;
  isCollapsed?: boolean;
}

const ClockWidget = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="px-6 py-4 border-b border-purple-800/50 bg-purple-900/30 backdrop-blur-sm text-center">
            <div className="text-2xl font-serif font-bold text-white tracking-widest tabular-nums">
                {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-purple-300 uppercase tracking-wider font-bold mt-1">
                {time.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({
    currentAgent,
    onSelectAgent,
    onReset,
    onGoToDashboard,
    onOpenSettings,
    recentSessions = [],
    onSelectSession,
    currentSessionId,
    isDarkMode,
    onToggleDarkMode,
    onOpenLegalTools,
    onOpenJurisprudence,
    onOpenJudgeProfiler,
    onOpenComparison,
    onOpenTimeline,
    onOpenVadeMecum,
    onOpenVoiceConsultant,
    isCollapsed = false,
    onUpdateSession
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (e: React.MouseEvent, session: Session) => {
      e.stopPropagation();
      setEditingSessionId(session.id);
      setEditTitle(session.title);
  };

  const handleSaveEdit = (sessionId: string) => {
      if (editTitle.trim() && onUpdateSession) {
          onUpdateSession(sessionId, { title: editTitle.trim() });
      }
      setEditingSessionId(null);
  };

  const groupedSessions = useMemo(() => {
    const groups: { [key: string]: Session[] } = { 'Hoje': [], 'Ontem': [], 'Antigos': [] };
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    recentSessions.forEach(session => {
      const date = new Date(session.updatedAt);
      if (date.toDateString() === today.toDateString()) groups['Hoje'].push(session);
      else if (date.toDateString() === yesterday.toDateString()) groups['Ontem'].push(session);
      else groups['Antigos'].push(session);
    });
    return groups;
  }, [recentSessions]);

  if (isCollapsed) return null;

  return (
    <>
    <div className="w-72 bg-gradient-to-b from-purple-950 via-purple-900 to-blue-950 text-slate-100 flex flex-col h-screen border-r border-purple-800/50 shadow-2xl sidebar shrink-0 z-50">

      {/* Brand & Clock */}
      <div className="flex flex-col bg-purple-950/50">
          <div className="p-6 flex items-center space-x-3 cursor-pointer hover:bg-white/5 transition-colors" onClick={onGoToDashboard}>
            <div className="bg-gradient-to-br from-gold-400 to-gold-600 p-2 rounded-lg shadow-lg shadow-gold-500/20">
                <Icons.Scale className="w-6 h-6 text-purple-950" />
            </div>
            <div>
                <h1 className="font-serif font-bold text-xl text-white tracking-tight leading-none">JusArtificial</h1>
                <p className="text-[10px] text-gold-400 font-bold uppercase tracking-widest mt-1">Suíte Premium</p>
            </div>
          </div>
          <ClockWidget />
      </div>

      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-6">
        <div>
            <button onClick={() => setIsSearchOpen(true)} className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl mb-3 bg-white/5 text-purple-200 hover:text-white hover:bg-white/10 transition-all border border-white/10 hover:border-gold-500/50 group">
            <Icons.Search className="w-4 h-4 group-hover:text-gold-400 transition-colors" />
            <span className="text-sm font-medium">Buscar (Ctrl+K)</span>
            </button>

            <button onClick={onGoToDashboard} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-purple-200 hover:text-white transition-colors">
            <Icons.LayoutDashboard className="w-5 h-5" />
            <span className="text-sm font-medium">Visão Geral</span>
            </button>
        </div>

        <div>
            <p className="px-3 text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-2 opacity-80">Especialistas IA</p>
            <div className="space-y-1">
                {Object.values(AGENTS).map((agent) => (
                <button key={agent.id} onClick={() => onSelectAgent(agent.id)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group ${currentAgent === agent.id && !currentSessionId ? 'bg-gradient-to-r from-gold-500/20 to-transparent border-l-2 border-gold-500 text-white' : 'text-purple-200 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}>
                    {React.createElement((Icons as any)[agent.icon] || Icons.HelpCircle, { className: `w-4 h-4 ${currentAgent === agent.id ? 'text-gold-400' : 'text-purple-400 group-hover:text-gold-400'}` })}
                    <span className="text-sm">{agent.name}</span>
                </button>
                ))}
            </div>
        </div>

        <div>
            <p className="px-3 text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-2 opacity-80">Acesso Rápido</p>
            <div className="grid grid-cols-2 gap-2 px-1">
                <button onClick={onOpenVadeMecum} className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-white/10 text-purple-200 hover:text-white border border-white/5 hover:border-gold-500/30 transition-all">
                    <Icons.Book className="w-5 h-5 mb-1 text-gold-500" /> <span className="text-[10px] font-bold">Vade Mecum</span>
                </button>
                <button onClick={onOpenJurisprudence} className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-white/10 text-purple-200 hover:text-white border border-white/5 hover:border-gold-500/30 transition-all">
                    <Icons.BookOpen className="w-5 h-5 mb-1 text-gold-500" /> <span className="text-[10px] font-bold">Precedentes</span>
                </button>
                <button onClick={onOpenJudgeProfiler} className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-white/10 text-purple-200 hover:text-white border border-white/5 hover:border-gold-500/30 transition-all">
                    <Icons.Gavel className="w-5 h-5 mb-1 text-gold-500" /> <span className="text-[10px] font-bold">Perfil Juiz</span>
                </button>
                <button onClick={onOpenTimeline} className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-white/10 text-purple-200 hover:text-white border border-white/5 hover:border-gold-500/30 transition-all">
                    <Icons.CalendarDays className="w-5 h-5 mb-1 text-gold-500" /> <span className="text-[10px] font-bold">Cronologia</span>
                </button>
            </div>
        </div>

        <div>
            <p className="px-3 text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-2 opacity-80">Histórico Recente</p>
            <div className="space-y-3 pl-1">
                {Object.entries(groupedSessions).map(([label, sessions]) => sessions.length > 0 && (
                    <div key={label}>
                        <p className="px-2 text-[9px] text-purple-400 mb-1 uppercase font-bold">{label}</p>
                        {sessions.map(s => (
                            <div key={s.id} className="relative group">
                                {editingSessionId === s.id ? (
                                    <input
                                        autoFocus
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        onBlur={() => handleSaveEdit(s.id)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(s.id)}
                                        className="w-full px-2 py-1.5 text-xs rounded bg-white/10 text-white outline-none border border-gold-500"
                                    />
                                ) : (
                                    <button onClick={() => onSelectSession?.(s)} className={`w-full flex items-center px-3 py-1.5 rounded text-xs text-left truncate transition-colors border-l-2 group ${currentSessionId === s.id ? 'border-gold-500 text-white bg-white/5' : 'border-transparent text-purple-300 hover:text-white hover:bg-white/5'}`}>
                                        <span className="truncate font-medium flex-1 pr-6">{s.title}</span>
                                    </button>
                                )}
                                {editingSessionId !== s.id && (
                                    <button
                                        onClick={(e) => handleStartEdit(e, s)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-opacity p-1"
                                        title="Renomear"
                                    >
                                        <Icons.Edit2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
      </nav>

      {/* Action Buttons */}
      <div className="p-4 border-t border-purple-800/50 bg-purple-950 space-y-3">
        {currentAgent && (
            <button onClick={onReset} className="w-full flex items-center justify-center space-x-2 border border-white/20 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg py-2.5 text-xs font-bold transition-all uppercase tracking-wide">
                <Icons.PlusCircle className="w-3 h-3" /> <span>Novo Chat</span>
            </button>
        )}

        <button onClick={onOpenVoiceConsultant} className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-500 hover:to-pink-500 rounded-lg py-3 text-xs font-bold transition-all shadow-lg hover:shadow-red-900/50 group uppercase tracking-wide">
            <Icons.Mic className="w-4 h-4 animate-pulse" />
            <span>Consultor de Voz</span>
        </button>

        <div className="grid grid-cols-3 gap-1 pt-2">
            <button onClick={onOpenComparison} className="p-2 rounded hover:bg-white/10 text-purple-300 hover:text-white flex justify-center" title="Comparar"><Icons.GitCompare className="w-4 h-4" /></button>
            <button onClick={onOpenLegalTools} className="p-2 rounded hover:bg-white/10 text-purple-300 hover:text-white flex justify-center" title="Calculadoras"><Icons.Calculator className="w-4 h-4" /></button>
            <button onClick={onOpenSettings} className="p-2 rounded hover:bg-white/10 text-purple-300 hover:text-white flex justify-center" title="Configurações"><Icons.Settings className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
    <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        sessions={recentSessions}
        onSelectSession={onSelectSession!}
    />
    </>
  );
};

export default Sidebar;