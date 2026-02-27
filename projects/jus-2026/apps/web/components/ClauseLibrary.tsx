import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import AnimatedButton from './AnimatedButton';

interface Clause {
    id: string;
    title: string;
    category: string;
    content: string;
}

const CLAUSES: Clause[] = [
    { id: '1', category: 'Geral', title: 'Foro de Eleição (SP)', content: 'As partes elegem o foro da Comarca de São Paulo/SP para dirimir quaisquer dúvidas oriundas deste contrato, com renúncia expressa a qualquer outro.' },
    { id: '2', category: 'Geral', title: 'Confidencialidade', content: 'As partes comprometem-se a manter o mais absoluto sigilo sobre quaisquer dados ou informações confidenciais a que tiverem acesso em razão deste contrato.' },
    { id: '3', category: 'Trabalhista', title: 'Não Vínculo (PJ)', content: 'A CONTRATADA prestará os serviços de forma autônoma, sem subordinação jurídica, cumprimento de horário ou pessoalidade, não gerando vínculo empregatício.' },
    { id: '4', category: 'LGPD', title: 'Tratamento de Dados', content: 'As partes declaram estar em conformidade com a Lei nº 13.709/2018 (LGPD), comprometendo-se a adotar medidas técnicas para proteção de dados pessoais.' },
    { id: '5', category: 'Imobiliário', title: 'Multa Rescisória (Aluguel)', content: 'Em caso de rescisão antecipada, pagará a Locatária a multa de 3 (três) aluguéis vigentes, proporcionalmente ao tempo restante do contrato.' }
];

interface ClauseLibraryProps {
    onInsert: (text: string) => void;
    onClose: () => void;
}

const ClauseLibrary: React.FC<ClauseLibraryProps> = ({ onInsert, onClose }) => {
    const [filter, setFilter] = useState('');
    const [category, setCategory] = useState<string>('Todos');

    const categories = ['Todos', ...Array.from(new Set(CLAUSES.map(c => c.category)))];

    const filteredClauses = CLAUSES.filter(c =>
        (category === 'Todos' || c.category === category) &&
        (c.title.toLowerCase().includes(filter.toLowerCase()) || c.content.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-30 flex flex-col animate-fade-in-down">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    <Icons.BookOpen className="w-4 h-4 mr-2 text-emerald-600" /> Banco de Cláusulas
                </h3>
                <button onClick={onClose}><Icons.X className="w-4 h-4 text-slate-400 hover:text-red-500" /></button>
            </div>

            <div className="p-4 space-y-4">
                <div className="relative">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar cláusula..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${category === cat ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
                {filteredClauses.map(clause => (
                    <div key={clause.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors group shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">{clause.title}</h4>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500">{clause.category}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-3 font-serif italic">"{clause.content}"</p>
                        <AnimatedButton
                            variant="secondary"
                            onClick={() => onInsert(clause.content)}
                            className="w-full text-xs py-1.5 h-8"
                            icon="Plus"
                            label="Inserir"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClauseLibrary;