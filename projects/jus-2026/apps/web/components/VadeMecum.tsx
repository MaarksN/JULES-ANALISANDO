import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import AnimatedButton from './AnimatedButton';

interface Article {
    id: string;
    code: string;
    article: string;
    text: string;
}

// Base de dados simulada (Top artigos mais usados - Expandida)
const LAW_DB: Article[] = [
    // --- CONSTITUIÇÃO FEDERAL ---
    { id: '1', code: 'CF/88', article: 'Art. 5º', text: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade...' },
    { id: '10', code: 'CF/88', article: 'Art. 133', text: 'O advogado é indispensável à administração da justiça, sendo inviolável por seus atos e manifestações no exercício da profissão, nos limites da lei.' },
    { id: '11', code: 'CF/88', article: 'Art. 37', text: 'A administração pública direta e indireta de qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios obedecerá aos princípios de legalidade, impessoalidade, moralidade, publicidade e eficiência...' },

    // --- CÓDIGO DE PROCESSO CIVIL (CPC/15) ---
    { id: '2', code: 'CPC', article: 'Art. 300', text: 'A tutela de urgência será concedida quando houver elementos que evidenciem a probabilidade do direito e o perigo de dano ou o risco ao resultado útil do processo.' },
    { id: '3', code: 'CPC', article: 'Art. 319', text: 'A petição inicial indicará: I - o juízo a que é dirigida; II - os nomes, os prenomes, o estado civil... III - o fato e os fundamentos jurídicos do pedido...' },
    { id: '9', code: 'CPC', article: 'Art. 85', text: 'A sentença condenará o vencido a pagar honorários ao advogado do vencedor.' },
    { id: '12', code: 'CPC', article: 'Art. 373', text: 'O ônus da prova incumbe: I - ao autor, quanto ao fato constitutivo de seu direito; II - ao réu, quanto à existência de fato impeditivo, modificativo ou extintivo do direito do autor.' },
    { id: '13', code: 'CPC', article: 'Art. 1015', text: 'Cabe agravo de instrumento contra as decisões interlocutórias que versarem sobre: I - tutelas provisórias; II - mérito do processo; III - rejeição da alegação de convenção de arbitragem...' },

    // --- CÓDIGO CIVIL (CC/02) ---
    { id: '4', code: 'CC', article: 'Art. 186', text: 'Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito.' },
    { id: '5', code: 'CC', article: 'Art. 927', text: 'Aquele que, por ato ilícito (arts. 186 e 187), causar dano a outrem, fica obrigado a repará-lo.' },
    { id: '14', code: 'CC', article: 'Art. 421', text: 'A liberdade contratual será exercida nos limites da função social do contrato.' },
    { id: '15', code: 'CC', article: 'Art. 422', text: 'Os contratantes são obrigados a guardar, assim na conclusão do contrato, como em sua execução, os princípios de probidade e boa-fé.' },

    // --- CÓDIGO DE DEFESA DO CONSUMIDOR (CDC) ---
    { id: '6', code: 'CDC', article: 'Art. 6º', text: 'São direitos básicos do consumidor: ... VI - a efetiva prevenção e reparação de danos patrimoniais e morais, individuais, coletivos e difusos; VIII - a facilitação da defesa de seus direitos, inclusive com a inversão do ônus da prova...' },
    { id: '7', code: 'CDC', article: 'Art. 14', text: 'O fornecedor de serviços responde, independentemente da existência de culpa, pela reparação dos danos causados aos consumidores por defeitos relativos à prestação dos serviços...' },
    { id: '16', code: 'CDC', article: 'Art. 42', text: 'Na cobrança de débitos, o consumidor inadimplente não será exposto a ridículo, nem será submetido a qualquer tipo de constrangimento ou ameaça. Parágrafo único. O consumidor cobrado em quantia indevida tem direito à repetição do indébito, por valor igual ao dobro...' },

    // --- CLT ---
    { id: '8', code: 'CLT', article: 'Art. 477', text: 'Na extinção do contrato de trabalho, o empregador deverá proceder à anotação na Carteira de Trabalho e Previdência Social, comunicar a dispensa aos órgãos competentes e realizar o pagamento das verbas rescisórias...' },
    { id: '17', code: 'CLT', article: 'Art. 482', text: 'Constituem justa causa para rescisão do contrato de trabalho pelo empregador: a) ato de improbidade; b) incontinência de conduta ou mau procedimento; e) desídia no desempenho das respectivas funções...' },

    // --- JUIZADOS ESPECIAIS (LEI 9.099/95) ---
    { id: '18', code: 'L.9099', article: 'Art. 2º', text: 'O processo orientar-se-á pelos critérios da oralidade, simplicidade, informalidade, economia processual e celeridade, buscando, sempre que possível, a conciliação ou a transação.' },
    { id: '19', code: 'L.9099', article: 'Art. 9º', text: 'Nas causas de valor até vinte salários mínimos, as partes comparecerão pessoalmente, podendo ser assistidas por advogado; nas de valor superior, a assistência é obrigatória.' }
];

interface VadeMecumProps {
    onInsert: (text: string) => void;
    onClose: () => void;
}

const VadeMecum: React.FC<VadeMecumProps> = ({ onInsert, onClose }) => {
    const [filter, setFilter] = useState('');
    const [selectedCode, setSelectedCode] = useState<string>('Todos');

    const codes = ['Todos', 'CF/88', 'CPC', 'CC', 'CDC', 'CLT', 'L.9099'];

    const filteredArticles = LAW_DB.filter(item =>
        (selectedCode === 'Todos' || item.code === selectedCode) &&
        (item.article.toLowerCase().includes(filter.toLowerCase()) || item.text.toLowerCase().includes(filter.toLowerCase()))
    );

    const handleSearchExternal = () => {
        const query = filter || selectedCode;
        window.open(`https://www.google.com/search?q=${encodeURIComponent('Lei Planalto ' + query)}`, '_blank');
    };

    return (
        <div className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800 z-30 flex flex-col animate-fade-in-right">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    <Icons.Book className="w-4 h-4 mr-2 text-emerald-600" /> Vade Mecum
                </h3>
                <button onClick={onClose}><Icons.X className="w-4 h-4 text-slate-400 hover:text-red-500" /></button>
            </div>

            <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                <div className="relative">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Ex: Art. 300 ou Tutela"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                        autoFocus
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin no-scrollbar">
                    {codes.map(code => (
                        <button
                            key={code}
                            onClick={() => setSelectedCode(code)}
                            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors border ${selectedCode === code ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-500'}`}
                        >
                            {code}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
                {filteredArticles.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-xs text-slate-400 mb-4">Artigo não encontrado na base rápida.</p>
                        <AnimatedButton
                            variant="secondary"
                            onClick={handleSearchExternal}
                            icon="ExternalLink"
                            label="Buscar no Planalto"
                            className="w-full text-xs"
                        />
                    </div>
                )}

                {filteredArticles.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors group shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400">{item.code} - {item.article}</h4>
                            <button
                                onClick={() => onInsert(`"${item.text}" (${item.code}, ${item.article}).`)}
                                className="text-slate-400 hover:text-emerald-600"
                                title="Inserir Citação"
                            >
                                <Icons.PlusCircle className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 font-serif leading-relaxed text-justify">
                            {item.text}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onInsert(`conforme dispõe o ${item.article} do ${item.code}`)}
                                className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                            >
                                Citar "conforme..."
                            </button>
                            <button
                                onClick={() => onInsert(`"${item.text}"`)}
                                className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                            >
                                Copiar Texto
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                 <button onClick={handleSearchExternal} className="w-full flex items-center justify-center text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    <Icons.Search className="w-3 h-3 mr-1"/> Pesquisar na Web
                 </button>
            </div>
        </div>
    );
};

export default VadeMecum;