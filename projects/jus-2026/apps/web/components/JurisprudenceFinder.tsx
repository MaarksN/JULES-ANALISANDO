import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { AgentType } from '../types';
import { AGENTS } from '../constants';
import AnimatedButton from './AnimatedButton';
import { fetchWithRetry } from '../utils/retry';

interface JurisprudenceFinderProps {
  onClose: () => void;
  onInsert: (text: string) => void;
  userContext?: string;
}

interface JurisResult {
    id: string;
    tribunal: string;
    data: string;
    relator: string;
    ementa: string;
    inteiroTeor: string;
    tipo: 'Favorável' | 'Desfavorável' | 'Neutro';
}

export default function JurisprudenceFinder({ onClose, onInsert, userContext }: JurisprudenceFinderProps) {
  const [query, setQuery] = useState('');
  const [tribunal, setTribunal] = useState('STJ');
  const [results, setResults] = useState<JurisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
        // Use Backend Crawler API instead of Client-Side GenAI
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await fetchWithRetry(`${API_URL}/api/jurisprudence?query=${encodeURIComponent(query + ' ' + tribunal)}`);

        if (!res.ok) throw new Error("Falha na busca.");

        const data = await res.json();
        setResults(data);

    } catch (err) {
        console.error(err);
        setError("Erro ao buscar jurisprudência. Verifique sua conexão.");
    } finally {
        setIsLoading(false);
    }
  };

  const formatCitation = (item: JurisResult) => {
      // Formato ABNT Jurídico Padrão
      return `\n> "${item.ementa}"\n> (${item.tribunal}. Relator: ${item.relator}. Data de Julgamento: ${item.data}).\n`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in-up p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
               <Icons.Scale className="w-5 h-5" />
            </div>
            <div>
               <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">Buscador de Jurisprudência</h2>
               <p className="text-xs text-slate-500 dark:text-slate-400">Pesquise e cite precedentes sem sair do editor.</p>
            </div>
          </div>
          <button onClick={onClose}><Icons.X className="w-6 h-6 text-slate-400 hover:text-red-500" /></button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSearch} className="flex gap-4">
                <div className="w-32">
                    <select
                        className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        value={tribunal}
                        onChange={(e) => setTribunal(e.target.value)}
                    >
                        <option value="STJ">STJ</option>
                        <option value="STF">STF</option>
                        <option value="TJSP">TJSP</option>
                        <option value="TJRJ">TJRJ</option>
                        <option value="TJMG">TJMG</option>
                        <option value="TRT">TRT</option>
                    </select>
                </div>
                <div className="flex-1 relative">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Ex: Dano moral extravio de bagagem..."
                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>
                <AnimatedButton
                    type="submit"
                    variant="primary"
                    label="Pesquisar"
                    isLoading={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 w-32"
                />
            </form>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/50">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100">
                    <Icons.AlertCircle className="w-5 h-5 mx-auto mb-2"/>
                    {error}
                </div>
            )}

            {!isLoading && results.length === 0 && !error && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <Icons.BookOpen className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-700" />
                    <p>Digite um termo para buscar precedentes.</p>
                </div>
            )}

            <div className="space-y-4">
                {results.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded mr-2">
                                    {item.tribunal}
                                </span>
                                <span className="text-xs text-slate-500">{item.data}</span>
                            </div>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onInsert(formatCitation(item))}
                                    className="flex items-center text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Icons.Plus className="w-3 h-3 mr-1" /> Citar no Doc
                                </button>
                            </div>
                        </div>

                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{item.relator}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic mb-4 leading-relaxed border-l-2 border-indigo-200 pl-3">
                            "{item.ementa}"
                        </p>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                item.tipo === 'Favorável' ? 'text-green-600 bg-green-50' :
                                item.tipo === 'Desfavorável' ? 'text-red-600 bg-red-50' :
                                'text-slate-500 bg-slate-100'
                            }`}>
                                Tendência: {item.tipo}
                            </span>
                            <button className="text-xs text-indigo-600 hover:underline flex items-center">
                                Ler Inteiro Teor <Icons.ExternalLink className="w-3 h-3 ml-1"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[10px] text-slate-400">
                Busca realizada via Crawler Simulado (Demo). Em produção, conecte à API Jusbrasil/DataJud.
            </p>
        </div>

      </div>
    </div>
  );
}