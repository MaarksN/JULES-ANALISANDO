import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { AgentType } from '../types';
import { AGENTS } from '../constants';
import { sendMessageToGemini } from '../services/gemini';
import AnimatedButton from './AnimatedButton';

interface TimelineEvent {
    date: string;
    title: string;
    description: string;
}

interface TimelineGeneratorProps {
    onClose: () => void;
    onInsert: (markdown: string) => void;
}

export default function TimelineGenerator({ onClose, onInsert }: TimelineGeneratorProps) {
    const [inputText, setInputText] = useState('');
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!inputText.trim()) return;
        setIsLoading(true);

        try {
            const agent = AGENTS[AgentType.PETITION]; // Usa o agente de petição pois é bom com fatos
            const prompt = `Analise o texto abaixo e extraia os eventos cronológicos para uma linha do tempo jurídica.

            TEXTO DOS FATOS:
            "${inputText}"

            RETORNE APENAS UM JSON NO SEGUINTE FORMATO (SEM MARKDOWN, SEM TEXTO EXTRA):
            [
                { "date": "DD/MM/AAAA", "title": "Título Curto", "description": "Descrição resumida do fato." }
            ]

            Ordene cronologicamente. Se a data não for precisa, use "Data Aprox." ou o mês/ano.`;

            const response = await sendMessageToGemini(agent, [], prompt, []);

            // Extract JSON
            const jsonMatch = response.text.match(/\[.*\]/s);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                setEvents(parsed);
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao gerar linha do tempo. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatForDocument = () => {
        // Gera uma tabela Markdown bonita para inserir na petição
        let md = `\n**CRONOLOGIA DOS FATOS**\n\n`;
        md += `| Data | Evento | Descrição |\n`;
        md += `| :--- | :--- | :--- |\n`;
        events.forEach(e => {
            md += `| **${e.date}** | ${e.title} | ${e.description} |\n`;
        });
        md += `\n`;
        onInsert(md);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in-up p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">

                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <Icons.CalendarDays className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">Gerador de Linha do Tempo</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Transforme fatos narrativos em visualização cronológica.</p>
                        </div>
                    </div>
                    <button onClick={onClose}><Icons.X className="w-6 h-6 text-slate-400 hover:text-red-500" /></button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Input Area */}
                    <div className="w-full md:w-1/3 p-4 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2">Cole os Fatos Aqui</label>
                        <textarea
                            className="flex-1 w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 resize-none focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed"
                            placeholder="Ex: No dia 10/01 o cliente comprou o carro. Em 15/01 o motor fundiu. Em 20/01 a concessionária negou reparo..."
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                        />
                        <div className="mt-4">
                            <AnimatedButton
                                onClick={handleGenerate}
                                variant="primary"
                                label="Gerar Timeline"
                                icon="Sparkles"
                                isLoading={isLoading}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Visualization Area */}
                    <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-slate-950 relative">
                        {events.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                                <Icons.Clock className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-sm">Aguardando geração...</p>
                            </div>
                        ) : (
                            <div className="max-w-xl mx-auto">
                                <div className="absolute top-0 right-0 p-4">
                                     <AnimatedButton
                                        onClick={formatForDocument}
                                        variant="secondary"
                                        label="Inserir no Documento"
                                        icon="ArrowRightCircle"
                                        className="shadow-lg"
                                    />
                                </div>

                                <h3 className="text-center font-serif font-bold text-xl mb-8 text-slate-800 dark:text-white">Cronologia do Caso</h3>

                                <div className="relative border-l-2 border-blue-200 dark:border-blue-900 ml-3 space-y-8 pb-8">
                                    {events.map((evt, idx) => (
                                        <div key={idx} className="relative pl-8 group">
                                            {/* Dot */}
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-slate-950 shadow-sm group-hover:scale-125 transition-transform"></div>

                                            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                                                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{evt.date}</span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200 text-md">{evt.title}</span>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 shadow-sm group-hover:shadow-md transition-all">
                                                {evt.description}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}