import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { Session } from '../types';
import { AGENTS } from '../constants';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
    sessions: Session[];
    onSelectSession: (session: Session) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, sessions, onSelectSession }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery('');
        }
    }, [isOpen]);

    const filteredSessions = query.trim() === ''
        ? sessions.slice(0, 5)
        : sessions.filter(s =>
            s.title.toLowerCase().includes(query.toLowerCase()) ||
            s.lastDocument?.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 8);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-down"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                    <Icons.Search className="w-5 h-5 text-slate-400 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar casos, clientes ou documentos..."
                        className="flex-1 bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button onClick={onClose} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">ESC</button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {filteredSessions.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            Nenhum resultado encontrado para "{query}".
                        </div>
                    ) : (
                        <div>
                            <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50">
                                {query ? 'Resultados' : 'Recentes'}
                            </div>
                            {filteredSessions.map(session => (
                                <button
                                    key={session.id}
                                    onClick={() => { onSelectSession(session); onClose(); }}
                                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-b border-slate-50 dark:border-slate-800 last:border-0 flex items-center group transition-colors"
                                >
                                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg mr-3 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 group-hover:text-emerald-600 transition-colors">
                                        {React.createElement((Icons as any)[AGENTS[session.agentId]?.icon] || Icons.FileText, { className: "w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600" })}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                                            {session.title}
                                        </div>
                                        <div className="text-xs text-slate-500 flex items-center mt-0.5">
                                            <span className="truncate max-w-[200px]">{AGENTS[session.agentId]?.name}</span>
                                            <span className="mx-1.5">•</span>
                                            <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <Icons.ArrowRight className="w-4 h-4 ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;