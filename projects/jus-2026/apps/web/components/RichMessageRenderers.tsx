import React from 'react';
import * as Icons from 'lucide-react';

// --- JURISPRUDÊNCIA ---

export interface JurisprudenceItem {
    tribunal: string;
    data: string;
    relator: string;
    ementa: string;
    inteiroTeor: string;
    tipo: 'Favorável' | 'Desfavorável' | 'Neutro';
}

export const JurisprudenceCard = ({ items }: { items: JurisprudenceItem[] }) => {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Ementa copiada!");
    };

    return (
        <div className="space-y-3 my-4">
            {items.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm hover:border-emerald-500 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-2 py-1 rounded uppercase">{item.tribunal}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.tipo === 'Favorável' ? 'border-green-200 text-green-700 bg-green-50' : item.tipo === 'Desfavorável' ? 'border-red-200 text-red-700 bg-red-50' : 'border-slate-200 text-slate-600'}`}>
                                {item.tipo}
                            </span>
                        </div>
                        <span className="text-xs text-slate-400">{item.data}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{item.relator}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic mb-3 line-clamp-3">"{item.ementa}"</p>

                    <div className="flex space-x-2">
                        <button onClick={() => copyToClipboard(item.ementa)} className="flex items-center text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                            <Icons.Copy className="w-3 h-3 mr-1"/> Copiar Ementa
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- PERFIL DE JUIZ ---

export interface JudgeProfile {
    nome: string;
    perfil: string;
    favorabilidade: number;
    topicosChave: string[];
    dicaOuro: string;
}

export const JudgeProfileCard = ({ profile }: { profile: JudgeProfile }) => {
    return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 my-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Icons.Gavel className="w-24 h-24" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400">
                        <Icons.User className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white font-serif">{profile.nome}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded uppercase">{profile.perfil}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                         <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Favorabilidade</span>
                         <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                             <div className="h-full bg-gradient-to-r from-red-500 to-green-500" style={{ width: `${profile.favorabilidade}%` }}></div>
                         </div>
                         <div className="text-right text-xs mt-1 font-bold text-slate-600 dark:text-slate-300">{profile.favorabilidade}%</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                         <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Dica de Ouro</span>
                         <p className="text-xs text-amber-600 dark:text-amber-400 font-medium leading-tight">{profile.dicaOuro}</p>
                    </div>
                </div>

                <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-2">Tópicos Recorrentes</span>
                    <div className="flex flex-wrap gap-2">
                        {profile.topicosChave.map((topic, i) => (
                            <span key={i} className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">#{topic}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- RELATÓRIO DE RISCOS (CONTRATOS) ---

export interface ContractRisk {
    clausula: string;
    nivel: 'Alto' | 'Médio' | 'Baixo';
    problema: string;
    sugestao: string;
    fundamento?: string;
}

export const RiskReportCard = ({ risks }: { risks: ContractRisk[] }) => {
    const highRisks = risks.filter(r => r.nivel === 'Alto').length;
    const mediumRisks = risks.filter(r => r.nivel === 'Médio').length;

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden my-4 bg-white dark:bg-slate-800 shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    <Icons.AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                    Análise de Riscos
                </h3>
                <div className="flex space-x-2 text-xs">
                    <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold dark:bg-red-900/30 dark:text-red-300">{highRisks} Críticos</span>
                    <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-bold dark:bg-yellow-900/30 dark:text-yellow-300">{mediumRisks} Médios</span>
                </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {risks.map((risk, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{risk.clausula}</span>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                risk.nivel === 'Alto' ? 'bg-red-100 text-red-600' :
                                risk.nivel === 'Médio' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-green-100 text-green-600'
                            }`}>
                                Risco {risk.nivel}
                            </span>
                        </div>
                        <p className="text-xs text-red-600 dark:text-red-400 mb-2 font-medium flex items-start">
                            <Icons.XCircle className="w-3 h-3 mr-1.5 mt-0.5 shrink-0" />
                            {risk.problema}
                        </p>
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded border border-emerald-100 dark:border-emerald-900/30">
                            <p className="text-xs text-emerald-800 dark:text-emerald-300 flex items-start">
                                <Icons.CheckCircle className="w-3 h-3 mr-1.5 mt-0.5 shrink-0" />
                                {risk.sugestao}
                            </p>
                            {risk.fundamento && (
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-1 ml-4.5">
                                    Base: {risk.fundamento}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- ADVOGADO DO DIABO (ESTRATÉGIA) ---

export interface StrategyWeakness {
    ponto: string;
    gravidade: 'Fatal' | 'Grave' | 'Moderada';
    analise: string;
    contraArgumento: string;
}

export const StrategyCritiqueCard = ({ weaknesses }: { weaknesses: StrategyWeakness[] }) => {
    return (
        <div className="my-4 space-y-3">
             <div className="p-3 bg-slate-800 text-white rounded-lg flex items-center shadow-lg">
                <Icons.Ghost className="w-5 h-5 mr-3 text-purple-400" />
                <span className="font-bold text-sm">Pontos de Fragilidade Detectados</span>
             </div>
             {weaknesses.map((w, i) => (
                 <div key={i} className="border-l-4 border-purple-500 bg-white dark:bg-slate-800 pl-4 py-3 pr-3 shadow-sm rounded-r-lg">
                     <div className="flex justify-between items-center mb-1">
                         <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{w.ponto}</h4>
                         <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                             w.gravidade === 'Fatal' ? 'bg-black text-red-500' :
                             w.gravidade === 'Grave' ? 'bg-red-100 text-red-600' :
                             'bg-orange-100 text-orange-600'
                         }`}>{w.gravidade}</span>
                     </div>
                     <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{w.analise}</p>
                     <div className="flex items-start text-xs text-purple-700 dark:text-purple-300 font-medium">
                         <Icons.Shield className="w-3 h-3 mr-1.5 mt-0.5" />
                         Contramedida: {w.contraArgumento}
                     </div>
                 </div>
             ))}
        </div>
    );
};