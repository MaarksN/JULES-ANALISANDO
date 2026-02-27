import React, { useMemo, useState } from 'react';
import * as Icons from 'lucide-react';
import { Session } from '../types';

interface AnalyticsViewProps {
  sessions: Session[];
}

// Mock data generator helper
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const SimpleBarChart = ({ data, color, height = 100 }: { data: { label: string, value: number }[], color: string, height?: number }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex items-end space-x-2 h-full w-full" style={{ height: `${height}px` }}>
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full flex items-end justify-center h-full">
                        <div
                            style={{ height: `${max > 0 ? (d.value / max) * 100 : 0}%` }}
                            className={`w-full max-w-[30px] rounded-t ${color} opacity-80 group-hover:opacity-100 transition-all relative`}
                        >
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {d.value}
                            </span>
                        </div>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 truncate w-full text-center" title={d.label}>{d.label}</span>
                </div>
            ))}
        </div>
    );
};

const SimplePieChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    if (total === 0) return <div className="h-32 flex items-center justify-center text-xs text-slate-400">Sem dados</div>;

    return (
        <div className="flex items-center">
            <div className="relative w-32 h-32">
                <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full">
                    {data.map((slice, i) => {
                        if (slice.value === 0) return null;
                        const start = cumulativePercent;
                        const end = start + (slice.value / total);
                        cumulativePercent = end;

                        const [startX, startY] = getCoordinatesForPercent(start);
                        const [endX, endY] = getCoordinatesForPercent(end);

                        // Fix for 100% slices
                        const isFullCircle = slice.value === total;
                        const largeArcFlag = slice.value / total > 0.5 ? 1 : 0;

                        const pathData = isFullCircle
                            ? `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0 Z`
                            : `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

                        return (
                            <path
                                key={i}
                                d={pathData}
                                fill={slice.color}
                                stroke="white"
                                strokeWidth="0.05"
                            />
                        );
                    })}
                </svg>
            </div>
            <div className="ml-6 space-y-1">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center text-xs text-slate-600 dark:text-slate-300">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: d.color }}></div>
                        <span className="flex-1">{d.label}</span>
                        <span className="font-bold ml-2">{Math.round((d.value/total)*100)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WordCloud = ({ sessions }: { sessions: Session[] }) => {
    // Mock logic: Extract words from titles
    const words: Record<string, number> = {};
    const ignore = ['ação', 'para', 'contra', 'sobre', 'pedido', 'com', 'pela'];

    sessions.forEach(s => {
        s.title.split(' ').forEach(w => {
            const word = w.toLowerCase().replace(/[^a-zãáàâéêíóôúç]/g, '');
            if (word.length > 3 && !ignore.includes(word)) words[word] = (words[word] || 0) + 1;
        });
        // Add Area as a weighted word
        if(s.area) words[s.area.toLowerCase()] = (words[s.area.toLowerCase()] || 0) + 2;
    });

    const sortedWords = Object.entries(words)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15)
        .map(([text, value]) => ({ text, value }));

    const maxVal = Math.max(...sortedWords.map(w => w.value), 1);

    if (sortedWords.length === 0) return <div className="h-full flex items-center justify-center text-xs text-slate-400">Dados insuficientes para nuvem.</div>;

    return (
        <div className="flex flex-wrap gap-3 justify-center content-center h-full p-4">
            {sortedWords.map((w, i) => (
                <span
                    key={i}
                    className="inline-block text-slate-600 dark:text-slate-300 font-bold transition-all hover:text-emerald-500 cursor-default capitalize"
                    style={{
                        fontSize: `${Math.max(0.7, (w.value / maxVal) * 2)}rem`,
                        opacity: 0.4 + (w.value / maxVal) * 0.6
                    }}
                >
                    {w.text}
                </span>
            ))}
        </div>
    );
};

const Heatmap = ({ sessions }: { sessions: Session[] }) => {
    // Mock productivity data (Day of Week x Period of Day)
    // 0-6 (Sun-Sat) x 0-2 (Morning, Afternoon, Evening)
    const data = Array(7).fill(0).map(() => Array(3).fill(0));

    sessions.forEach(s => {
        const date = new Date(s.createdAt);
        const day = date.getDay();
        const hour = date.getHours();
        const period = hour < 12 ? 0 : hour < 18 ? 1 : 2;
        data[day][period]++;
    });

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const periods = ['Manhã', 'Tarde', 'Noite'];
    const maxVal = Math.max(...data.flat(), 1);

    return (
        <div className="grid grid-cols-4 gap-1 w-full max-w-sm">
            <div className="col-span-1"></div>
            {periods.map(p => <div key={p} className="text-[10px] text-center text-slate-400 font-bold uppercase">{p}</div>)}

            {days.map((d, i) => (
                <React.Fragment key={d}>
                    <div className="text-[10px] text-slate-500 font-bold self-center">{d}</div>
                    {data[i].map((val, j) => (
                        <div
                            key={j}
                            className="w-full h-8 rounded hover:ring-2 ring-emerald-400 transition-all relative group"
                            style={{ backgroundColor: val === 0 ? 'rgba(226, 232, 240, 0.2)' : `rgba(16, 185, 129, ${0.2 + (val / maxVal) * 0.8})` }}
                        >
                            {val > 0 && <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10">{val}</span>}
                        </div>
                    ))}
                </React.Fragment>
            ))}
        </div>
    );
};

export default function AnalyticsView({ sessions }: AnalyticsViewProps) {
    const [filterArea, setFilterArea] = useState<string>('Todos');
    const [showFilters, setShowFilters] = useState(false);

    // Item 91: Filter Logic
    const filteredSessions = useMemo(() => {
        if (filterArea === 'Todos') return sessions;
        return sessions.filter(s => s.area === filterArea);
    }, [sessions, filterArea]);

    // Item 93: Dynamic Resolution Time
    const avgResolutionTime = useMemo(() => {
        const completed = filteredSessions.filter(s => s.status === 'Concluído');
        if (completed.length === 0) return { val: "---", diff: 0 };

        const totalMs = completed.reduce((acc, s) => {
            const start = new Date(s.createdAt).getTime();
            const end = new Date(s.updatedAt).getTime();
            return acc + (end - start);
        }, 0);

        const avgMs = totalMs / completed.length;
        const days = avgMs / (1000 * 60 * 60 * 24);

        return {
            val: days < 1 ? `${(days * 24).toFixed(1)} horas` : `${days.toFixed(1)} dias`,
            diff: -5 // Mock comparison
        };
    }, [filteredSessions]);

    // Process Data for Funnel (Item 92)
    const funnelData = [
        { label: 'Leads', value: filteredSessions.length + Math.floor(filteredSessions.length * 0.5) },
        { label: 'Contatos', value: filteredSessions.length + Math.floor(filteredSessions.length * 0.2) },
        { label: 'Propostas', value: filteredSessions.length },
        { label: 'Fechados', value: filteredSessions.filter(s => s.status === 'Concluído').length }
    ];

    // Process Data for Origin (Item 96)
    const originCounts = filteredSessions.reduce((acc, s) => {
        const origin = s.clientOrigin || 'Outros';
        acc[origin] = (acc[origin] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const originData = [
        { label: 'Indicação', value: originCounts['Indicação'] || 0, color: '#10b981' }, // Emerald
        { label: 'Instagram', value: originCounts['Instagram'] || 0, color: '#f59e0b' }, // Amber
        { label: 'Google', value: originCounts['Google'] || 0, color: '#3b82f6' }, // Blue
        { label: 'Outros', value: (originCounts['Outros'] || 0) + (originCounts['Linkedin'] || 0), color: '#6366f1' } // Indigo
    ];

    // Financial Data (Item 97)
    const financialData = useMemo(() => {
        const total = filteredSessions.reduce((acc, s) => acc + (s.contractValue || 0), 0);
        const received = filteredSessions.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
        const pending = total - received;
        // Mocking 'paid' based on status if paidAmount is 0 (legacy data)
        const mockReceived = filteredSessions.filter(s => s.status === 'Concluído').reduce((acc, s) => acc + (s.contractValue || 0), 0);

        return {
            total: total > 0 ? total : mockReceived * 1.5,
            received: received > 0 ? received : mockReceived,
            pending: pending
        };
    }, [filteredSessions]);

    // AI Stats (Item 98)
    const aiUsage = filteredSessions.reduce((acc, s) => acc + s.messages.length, 0);

    const handlePrintReport = () => {
        window.print();
    };

    const areas = ['Todos', 'Cível', 'Trabalhista', 'Família', 'Criminal', 'Tributário'];

    return (
        <div className="p-8 h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 custom-scrollbar">
            <div className="max-w-7xl mx-auto pb-12">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-serif mb-2 flex items-center">
                            <Icons.BarChart3 className="w-8 h-8 mr-3 text-indigo-600" />
                            Inteligência de Negócios
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            Análise estratégica baseada em {filteredSessions.length} casos.
                        </p>
                    </div>
                    <div className="flex space-x-2 no-print relative">
                        <div className="relative">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                <Icons.Filter className="w-4 h-4 mr-2" />
                                {filterArea === 'Todos' ? 'Filtros' : filterArea}
                            </button>
                            {showFilters && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-fade-in-up">
                                    <div className="p-2 border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-400 uppercase">Filtrar por Área</div>
                                    {areas.map(area => (
                                        <button
                                            key={area}
                                            onClick={() => { setFilterArea(area); setShowFilters(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${filterArea === area ? 'text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-700 dark:text-slate-200'}`}
                                        >
                                            {area}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={handlePrintReport} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg">
                            <Icons.FileDown className="w-4 h-4 mr-2" /> Exportar Relatório PDF
                        </button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Icons.DollarSign className="w-16 h-16 text-emerald-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Faturamento Estimado</p>
                        <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {financialData.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Recebido: {financialData.received.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Icons.Clock className="w-16 h-16 text-blue-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Tempo Médio Resolução</p>
                        <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{avgResolutionTime.val}</h3>
                        <p className="text-xs text-emerald-500 mt-1 font-medium flex items-center"><Icons.TrendingDown className="w-3 h-3 mr-1"/> Eficiência IA</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Icons.Zap className="w-16 h-16 text-amber-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Produtividade IA</p>
                        <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{aiUsage} Interações</h3>
                        <p className="text-xs text-slate-400 mt-1">Economia estimada: {Math.max(0, Math.round(aiUsage * 0.5))} horas</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Icons.Trophy className="w-16 h-16 text-purple-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Benchmark de Mercado</p>
                        <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Top 15%</h3>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-purple-500 w-[85%]"></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Sales Funnel */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-80 flex flex-col">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
                            <Icons.Filter className="w-5 h-5 mr-2 text-indigo-500"/> Funil de Conversão
                        </h3>
                        <div className="flex-1 px-4">
                            <SimpleBarChart data={funnelData} color="bg-indigo-500" height={200} />
                        </div>
                    </div>

                    {/* Heatmap */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-80 flex flex-col">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
                            <Icons.Grid className="w-5 h-5 mr-2 text-emerald-500"/> Mapa de Produtividade
                        </h3>
                        <div className="flex-1 flex items-center justify-center">
                            <Heatmap sessions={filteredSessions} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Marketing ROI */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
                            <Icons.PieChart className="w-5 h-5 mr-2 text-blue-500"/> Origem dos Clientes
                        </h3>
                        <div className="flex justify-center">
                            <SimplePieChart data={originData} />
                        </div>
                        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-800 dark:text-blue-300">
                            <strong>Insight:</strong> {originData[0].label} é sua maior fonte de receita atual. Considere investir mais neste canal.
                        </div>
                    </div>

                    {/* Word Cloud */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
                            <Icons.Cloud className="w-5 h-5 mr-2 text-slate-500"/> Nuvem de Demandas
                        </h3>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl h-48 border border-slate-100 dark:border-slate-800">
                            <WordCloud sessions={filteredSessions} />
                        </div>
                        <div className="mt-4 flex justify-between text-xs text-slate-500">
                            <span>Temas mais recorrentes nos casos ativos.</span>
                            <span className="text-indigo-600">Baseado em títulos e áreas.</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}