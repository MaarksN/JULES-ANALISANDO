import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { AgentType, Session, Template } from '../types';
import { AGENTS } from '../constants';
import { QUICK_TEMPLATES } from '../data/templates';
import Marketplace from './Marketplace';
import KanbanBoard from './KanbanBoard';
import AnalyticsView from './AnalyticsView'; // Nova Importação
import EmptyState from './EmptyState';
import NotificationBell from './NotificationBell'; // Nova Importação
import { useAuth } from '../contexts/AuthContext';
import { useTemplates } from '../hooks/useTemplates';
import { crawlProcess, ProcessData } from '../services/crawler';
import { createCheckoutSession } from '../services/payment'; // Item: Payment

interface DashboardProps {
  onSelectAgent: (agent: AgentType, prompt?: string) => void;
  userName?: string;
  sessions?: Session[];
  onResumeSession?: (session: Session) => void;
  onDeleteSession?: (id: string) => void;
  onUpdateSession?: (id: string, updates: Partial<Session>) => void;
  onOpenWizard: () => void;
}

const AnalyticsChart = ({ sessions }: { sessions: Session[] }) => {
    const days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('pt-BR', { weekday: 'short' });
    }).reverse();

    const data = days.map(day => ({
        day,
        value: Math.floor(Math.random() * 2) + sessions.filter(s => new Date(s.updatedAt).toLocaleDateString('pt-BR', { weekday: 'short' }) === day).length
    }));

    const max = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icons.BarChart2 className="w-24 h-24 text-purple-600" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center font-serif text-lg">
                <Icons.Activity className="w-5 h-5 mr-2 text-purple-600"/> Produtividade Semanal
            </h3>
            <div className="flex items-end justify-between h-32 space-x-3 px-2">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group/bar">
                        <div
                            style={{ height: `${(d.value/max)*100}%` }}
                            className="w-full bg-gradient-to-t from-purple-500 to-purple-400 dark:from-purple-700 dark:to-purple-500 rounded-t-lg group-hover/bar:from-gold-500 group-hover/bar:to-gold-400 transition-all relative shadow-md"
                        >
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-white dark:bg-slate-700 px-2 py-1 rounded shadow">{d.value}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wide">{d.day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({
    onSelectAgent,
    userName = "Dr. Advogado",
    sessions = [],
    onResumeSession,
    onDeleteSession,
    onUpdateSession,
    onOpenWizard
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'analytics'>('overview'); // Tab Analytics
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [templateSource, setTemplateSource] = useState<'system' | 'user'>('system');
  const [crawlerResult, setCrawlerResult] = useState<ProcessData | null>(null);
  const [isCrawling, setIsCrawling] = useState(false);

  // Hook Data Pattern (Item 4)
  const { templates: userTemplates, removeTemplate } = useTemplates(user?.uid);

  // Item 66: Onboarding Progressivo (Dica de Kanban)
  useEffect(() => {
      if (viewMode === 'kanban' && !localStorage.getItem('jusartificial_kanban_hint')) {
          alert("Dica: Arraste os cards para mudar o status do processo!");
          localStorage.setItem('jusartificial_kanban_hint', 'seen');
      }
  }, [viewMode]);

  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm("Excluir este modelo?")) {
          await removeTemplate(id);
      }
  };

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.lastDocument && s.lastDocument.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = [
    { label: "Documentos Gerados", value: sessions.filter(s => s.lastDocument).length.toString(), icon: "FileText", color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Casos Ativos", value: sessions.length.toString(), icon: "Briefcase", color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Horas Economizadas", value: (sessions.reduce((acc, s) => acc + s.messages.length, 0) * 0.5).toFixed(1), icon: "Clock", color: "text-gold-600", bg: "bg-gold-100" },
  ];

  if (activeTab === 'marketplace') {
      return (
          <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
              <div className="px-8 pt-6">
                 <button onClick={() => setActiveTab('overview')} className="flex items-center text-sm text-slate-500 hover:text-purple-600 mb-4 transition-colors">
                     <Icons.ArrowLeft className="w-4 h-4 mr-1"/> Voltar ao Dashboard
                 </button>
              </div>
              <Marketplace />
          </div>
      );
  }

  // Render BI View
  if (activeTab === 'analytics') {
      return (
          <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
              <div className="px-8 pt-6">
                 <button onClick={() => setActiveTab('overview')} className="flex items-center text-sm text-slate-500 hover:text-purple-600 mb-4 transition-colors">
                     <Icons.ArrowLeft className="w-4 h-4 mr-1"/> Voltar ao Dashboard
                 </button>
              </div>
              <AnalyticsView sessions={sessions} />
          </div>
      );
  }

  return (
    <div className="flex-1 h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto p-8 font-sans transition-colors">
      <div className="max-w-7xl mx-auto space-y-10 pb-12">

        {/* Header Hero */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-8 gap-6 animate-fade-in-down">
          <div>
            <div className="flex items-center text-gold-600 dark:text-gold-500 mb-1">
                <Icons.Sun className="w-4 h-4 mr-2" />
                <span className="text-xs font-bold uppercase tracking-widest">Bom dia</span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100">Olá, {userName}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Seu escritório digital está pronto para alta performance.</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-80">
                <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar casos ou Digite CNJ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={async (e) => {
                        if (e.key === 'Enter' && /\d{7}-\d{2}/.test(searchTerm)) {
                            setIsCrawling(true);
                            try {
                                const data = await crawlProcess(searchTerm);
                                setCrawlerResult(data);
                                setSearchTerm('');
                            } catch (err: any) {
                                alert(err.message);
                            } finally {
                                setIsCrawling(false);
                            }
                        }
                    }}
                    className="w-full pl-12 pr-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white shadow-sm transition-all disabled:opacity-50"
                    disabled={isCrawling}
                />
                {isCrawling && <Icons.Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-purple-600"/>}
             </div>
             <button onClick={() => setActiveTab('analytics')} className="p-3 bg-white dark:bg-slate-800 text-indigo-600 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors shadow-sm" title="BI e Análises">
                 <Icons.BarChart3 className="w-6 h-6" />
             </button>
             <button onClick={() => setActiveTab('marketplace')} className="p-3 bg-white dark:bg-slate-800 text-purple-600 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors shadow-sm" title="Ir para Marketplace">
                 <Icons.ShoppingBag className="w-6 h-6" />
             </button>
             <NotificationBell userId={user?.uid} />
             <button
                onClick={async () => {
                    const { url } = await createCheckoutSession('pro_monthly');
                    window.open(url, '_blank');
                }}
                className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all"
                title="Upgrade Premium"
             >
                 <Icons.Crown className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Crawler Result Modal (Simple Inline) */}
        {crawlerResult && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-emerald-200 dark:border-emerald-900 mb-8 animate-fade-in-down relative">
                <button onClick={() => setCrawlerResult(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Icons.X className="w-5 h-5"/></button>
                <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center">
                    <Icons.CheckCircle className="w-5 h-5 mr-2"/> Processo Encontrado: {crawlerResult.cnj}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div><span className="font-bold">Partes:</span> {crawlerResult.partes.autor} x {crawlerResult.partes.reu}</div>
                    <div><span className="font-bold">Tribunal:</span> {crawlerResult.tribunal}</div>
                    <div><span className="font-bold">Última Movimentação:</span> {crawlerResult.movimentacoes[0].descricao} ({crawlerResult.movimentacoes[0].data})</div>
                </div>
                <button className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">Importar para Meus Casos</button>
            </div>
        )}

        {!searchTerm && (
            <>
            {/* Quick Actions & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Main Action Card */}
                <div className="md:col-span-1 bg-gradient-to-br from-purple-800 to-blue-900 rounded-2xl p-6 text-white shadow-xl shadow-purple-900/20 flex flex-col justify-between group cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden" onClick={onOpenWizard}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                            <Icons.Sparkles className="w-6 h-6 text-gold-400 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold font-serif mb-1">Iniciar Nova Tarefa</h3>
                        <p className="text-purple-200 text-sm leading-relaxed">Use o guia inteligente passo a passo.</p>
                    </div>
                    <div className="mt-4 flex items-center text-sm font-bold text-gold-400 group-hover:text-white transition-colors">
                        Começar Agora <Icons.ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                </div>

                {/* Stats Cards */}
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500`}>
                             {React.createElement((Icons as any)[stat.icon], { className: `w-16 h-16 ${stat.color.replace('text-', 'text-')}` })}
                        </div>
                        <div className={`w-10 h-10 rounded-lg ${stat.bg} dark:bg-opacity-20 flex items-center justify-center mb-3`}>
                            {React.createElement((Icons as any)[stat.icon], { className: `w-5 h-5 ${stat.color}` })}
                        </div>
                        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-serif">{stat.value}</p>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-64">
                <div className="lg:col-span-2 h-full">
                    <AnalyticsChart sessions={sessions} />
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center font-serif text-lg">
                        <Icons.Calendar className="w-5 h-5 mr-2 text-blue-600"/> Próximos Prazos
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {[1,2].map(i => (
                            <div key={i} className="flex items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 font-bold text-xs p-2 rounded-lg text-center min-w-[48px] mr-4 border border-red-100 dark:border-red-900/30">
                                    <span className="block text-[10px] uppercase">OUT</span>
                                    <span className="text-lg leading-none">28</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Contestação - Proc. 10023</p>
                                    <p className="text-xs text-slate-500">Vara Cível - Fatal</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif">Acesso Rápido (Agentes)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {Object.values(AGENTS).map((agent) => (
                    <button key={agent.id} onClick={() => onSelectAgent(agent.id)} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-purple-500 hover:shadow-lg transition-all text-left group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-100 to-transparent dark:from-slate-700 rounded-bl-full opacity-50 transition-opacity"></div>
                        <div className="mb-4 bg-slate-50 dark:bg-slate-900 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors shadow-sm">
                           {React.createElement((Icons as any)[agent.icon], { className: "w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-white transition-colors" })}
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">{agent.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{agent.description}</p>
                    </button>
                    ))}
                </div>
            </div>
            </>
        )}

        <div>
           <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif">
                  {searchTerm ? `Resultados para "${searchTerm}"` : 'Gestão de Casos'}
               </h2>
               <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 text-xs">
                    <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-md transition-all flex items-center ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow text-purple-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Icons.List className="w-3.5 h-3.5 mr-2"/> Lista
                    </button>
                    <button onClick={() => setViewMode('kanban')} className={`px-4 py-2 rounded-md transition-all flex items-center ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 shadow text-purple-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Icons.LayoutDashboard className="w-3.5 h-3.5 mr-2"/> Quadro
                    </button>
               </div>
           </div>

           {viewMode === 'kanban' && !searchTerm ? (
               <KanbanBoard sessions={sessions} onSelectSession={onResumeSession!} onDeleteSession={onDeleteSession!} onUpdateSession={onUpdateSession!} />
           ) : (
               <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[300px]">
                 {filteredSessions.length === 0 ? (
                     <EmptyState
                        title="Nenhum caso encontrado"
                        description={searchTerm ? `Não encontramos nada para "${searchTerm}"` : "Você ainda não iniciou nenhum atendimento."}
                        actionLabel={!searchTerm ? "Novo Caso" : undefined}
                        onAction={!searchTerm ? onOpenWizard : undefined}
                     />
                 ) : (
                     filteredSessions.map((item) => (
                        <div key={item.id} onClick={() => onResumeSession?.(item)} className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group">
                            <div className="flex items-center">
                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg mr-4 text-slate-500 group-hover:text-purple-600 transition-colors">
                                    <Icons.FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block mb-1">{item.title}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                                        <Icons.Clock className="w-3 h-3 mr-1"/> {new Date(item.updatedAt).toLocaleDateString()}
                                        <span className="mx-2">•</span>
                                        {AGENTS[item.agentId]?.name}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                               <span className={`text-xs px-3 py-1 rounded-full font-bold ${item.status === 'Concluído' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>{item.status}</span>
                               <button onClick={(e) => { e.stopPropagation(); onDeleteSession?.(item.id); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Icons.Trash2 className="w-4 h-4" /></button>
                               <Icons.ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
                            </div>
                        </div>
                     ))
                 )}
               </div>
           )}
        </div>
      </div>
    </div>
  );
};
export default Dashboard;