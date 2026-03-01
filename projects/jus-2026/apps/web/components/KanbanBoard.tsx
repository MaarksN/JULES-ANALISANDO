import React from 'react';
import * as Icons from 'lucide-react';
import { List, ListProps } from 'react-window';
import { Session, AgentType } from '../types';
import { AGENTS } from '../constants';

type ListChildComponentProps = Parameters<ListProps['rowComponent']>[0];

interface KanbanBoardProps {
    sessions: Session[];
    onSelectSession: (session: Session) => void;
    onDeleteSession: (id: string) => void;
    onUpdateSession: (id: string, updates: Partial<Session>) => void;
}

const STATUS_COLUMNS = [
    { id: 'Em Aberto', label: 'Em Redação', color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-900' },
    { id: 'Revisão', label: 'Em Revisão', color: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-900' },
    { id: 'Concluído', label: 'Pronto', color: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-emerald-200 dark:border-emerald-900' }
];

const CARD_HEIGHT = 140; // Altura fixa para virtualização

const KanbanBoard: React.FC<KanbanBoardProps> = ({ sessions, onSelectSession, onDeleteSession, onUpdateSession }) => {

    // Função auxiliar para determinar a coluna atual de uma sessão
    const getSessionStatus = (session: Session) => {
        if (session.status === 'Concluído') return 'Concluído';
        if (session.title.includes('Revisão') || session.agentId === AgentType.CONTRACT_REVIEW) return 'Revisão';
        return 'Em Aberto';
    };

    const handleMove = (e: React.MouseEvent, session: Session, direction: 'next' | 'prev') => {
        e.stopPropagation();
        const currentStatus = getSessionStatus(session);
        let nextStatus = currentStatus;

        if (currentStatus === 'Em Aberto') {
            nextStatus = direction === 'next' ? 'Revisão' : 'Em Aberto';
        } else if (currentStatus === 'Revisão') {
            nextStatus = direction === 'next' ? 'Concluído' : 'Em Aberto';
        } else if (currentStatus === 'Concluído') {
            nextStatus = direction === 'prev' ? 'Revisão' : 'Concluído';
        }

        if (nextStatus !== currentStatus) {
            let updates: Partial<Session> = { status: nextStatus === 'Concluído' ? 'Concluído' : 'Em Aberto' };

            if (nextStatus === 'Revisão' && !session.title.includes('Revisão')) {
                updates.title = `[Revisão] ${session.title}`;
            } else if (nextStatus === 'Em Aberto' && session.title.includes('[Revisão] ')) {
                updates.title = session.title.replace('[Revisão] ', '');
            }

            onUpdateSession(session.id, updates);
        }
    };

    // Componente de Linha para Virtualização
    const Row = ({ index, style, data }: ListChildComponentProps) => {
        const session = data[index];
        const currentColId = getSessionStatus(session);

        return (
            <div style={{ ...style, height: style.height as number - 10, left: 0, right: 0 }} className="px-1">
                <div
                    onClick={() => onSelectSession(session)}
                    className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group relative h-full"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                                {React.createElement((Icons as any)[AGENTS[session.agentId]?.icon] || Icons.FileText, { className: "w-3.5 h-3.5" })}
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{AGENTS[session.agentId]?.name}</span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Icons.Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1 line-clamp-2 leading-tight pr-6">
                        {session.title.replace('[Revisão] ', '')}
                    </h4>
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] text-slate-400 flex items-center">
                            <Icons.Clock className="w-3 h-3 mr-1" />
                            {new Date(session.updatedAt).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Move Controls */}
                    <div className="absolute bottom-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {currentColId !== 'Em Aberto' && (
                            <button
                                onClick={(e) => handleMove(e, session, 'prev')}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600"
                                title="Mover para Trás"
                            >
                                <Icons.ChevronLeft className="w-4 h-4" />
                            </button>
                        )}
                        {currentColId !== 'Concluído' && (
                            <button
                                onClick={(e) => handleMove(e, session, 'next')}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600"
                                title="Mover para Frente"
                            >
                                <Icons.ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex space-x-4 h-full overflow-x-auto pb-4">
            {STATUS_COLUMNS.map(col => {
                const columnSessions = sessions.filter(s => getSessionStatus(s) === col.id);

                return (
                    <div key={col.id} className={`flex-1 min-w-[280px] max-w-sm rounded-xl flex flex-col ${col.bg} border ${col.border}`}>
                        <div className="p-3 flex justify-between items-center border-b border-slate-200/50 dark:border-slate-700/50 shrink-0">
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{col.label}</span>
                            </div>
                            <span className="text-xs bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 shadow-sm">
                                {columnSessions.length}
                            </span>
                        </div>

                        <div className="flex-1 p-2">
                            {columnSessions.length === 0 ? (
                                <div className="text-center py-8 opacity-40">
                                    <Icons.Inbox className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                                    <span className="text-xs text-slate-500">Vazio</span>
                                </div>
                            ) : (
                                <List
                                    height={500} // Altura fixa provisória (ideal: AutoSizer)
                                    rowCount={columnSessions.length}
                                    rowHeight={CARD_HEIGHT}
                                    rowComponent={Row}
                                    rowProps={columnSessions as any}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KanbanBoard;