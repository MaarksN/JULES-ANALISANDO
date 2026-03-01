import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import AnimatedButton from './AnimatedButton';
import { fetchWithRetry } from '../utils/retry';

interface MarketplaceAgent {
    id: string;
    name: string;
    description: string;
    price: number | string;
    author: string;
    type?: string;
    rating?: number;
    icon?: string;
}

const Marketplace = () => {
    const [agents, setAgents] = useState<MarketplaceAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [installedIds, setInstalledIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetchWithRetry(`${API_URL}/api/marketplace/agents`);
                if (res.ok) {
                    const data = await res.json();
                    setAgents(data);
                }
            } catch (e) {
                console.error("Failed to load marketplace:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAgents();
    }, []);

    const handleInstall = (id: string) => {
        // Mock install
        setInstalledIds(prev => [...prev, id]);
        alert("Agente instalado com sucesso! (Simulação)");
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Carregando Marketplace...</div>;
    }

    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-serif mb-2">Marketplace</h2>
                        <p className="text-slate-500 dark:text-slate-400">Expanda as capacidades do seu escritório com agentes e kits da comunidade.</p>
                    </div>
                    <div className="flex space-x-2 mt-4 md:mt-0">
                        <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Meus Itens</button>
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Criar Agente</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {agents.map(item => {
                        const isInstalled = installedIds.includes(item.id);
                        return (
                        <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all group">
                            <div className="h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center relative">
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm">
                                    {React.createElement((Icons as any)[item.icon || 'Box'] || Icons.Box, { className: "w-6 h-6 text-emerald-600" })}
                                </div>
                                <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider bg-slate-900/10 dark:bg-white/10 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">{item.type || 'Agente'}</span>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-900 dark:text-white">{item.name}</h3>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 line-clamp-2">{item.description}</p>

                                <div className="flex items-center text-amber-400 text-xs mb-4">
                                    <Icons.Star className="w-3 h-3 fill-current" />
                                    <span className="ml-1 font-bold text-slate-700 dark:text-slate-300">{item.rating || 'New'}</span>
                                    <span className="mx-1 text-slate-300">•</span>
                                    <span className="text-slate-400">{item.author}</span>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                        {typeof item.price === 'number' ? `R$ ${item.price.toFixed(2)}` : item.price}
                                    </span>
                                    <AnimatedButton
                                        variant={isInstalled ? "secondary" : "primary"}
                                        className="text-xs px-3 py-1.5"
                                        label={isInstalled ? "Instalado" : "Obter"}
                                        disabled={isInstalled}
                                        onClick={() => handleInstall(item.id)}
                                    />
                                </div>
                            </div>
                        </div>
                    )})}
                </div>

                <div className="mt-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-8 text-center border border-emerald-100 dark:border-emerald-800">
                    <Icons.Zap className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">Quer vender seus Agentes?</h3>
                    <p className="text-emerald-600 dark:text-emerald-400 mb-6 max-w-lg mx-auto">Desenvolvedores e advogados experientes podem monetizar seus prompts e autômatos na nossa loja oficial.</p>
                    <button className="text-emerald-700 dark:text-emerald-300 font-bold hover:underline">Saiba como ser um parceiro &rarr;</button>
                </div>
            </div>
        </div>
    );
};

export default Marketplace;