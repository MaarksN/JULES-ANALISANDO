import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { AgentType } from '../types';

interface IntentWizardProps {
  onClose: () => void;
  onComplete: (agentId: AgentType, prompt: string) => void;
}

const STEPS = [
    {
        id: 'category',
        title: 'O que você deseja fazer hoje?',
        options: [
            { id: 'petition', label: 'Criar Petição / Peça', icon: 'PenTool', agent: AgentType.PETITION },
            { id: 'review', label: 'Revisar Contrato', icon: 'FileSearch', agent: AgentType.CONTRACT_REVIEW },
            { id: 'research', label: 'Pesquisar Jurisprudência', icon: 'Scale', agent: AgentType.JURISPRUDENCE },
            { id: 'strategy', label: 'Análise Estratégica', icon: 'Target', agent: AgentType.DEVIL_ADVOCATE }
        ]
    },
    {
        id: 'area',
        title: 'Qual a área do Direito?',
        options: [
            { id: 'civil', label: 'Cível / Consumidor', icon: 'Users' },
            { id: 'trabalhista', label: 'Trabalhista', icon: 'Briefcase' },
            { id: 'familia', label: 'Família e Sucessões', icon: 'Heart' },
            { id: 'tributario', label: 'Tributário / Empresarial', icon: 'Landmark' },
            { id: 'penal', label: 'Penal', icon: 'Shield' }
        ]
    },
    {
        id: 'details',
        title: 'Descreva brevemente o caso',
        type: 'input'
    }
];

export default function IntentWizard({ onClose, onComplete }: IntentWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selections, setSelections] = useState<any>({});
    const [inputText, setInputText] = useState('');

    const handleSelect = (option: any) => {
        setSelections({ ...selections, [STEPS[currentStep].id]: option });
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleFinish = () => {
        const category = selections['category'];
        const area = selections['area'];

        let prompt = '';
        if (category.id === 'petition') {
            prompt = `Atue como especialista em Direito ${area.label}. Crie uma peça processual completa sobre o seguinte caso: ${inputText}. Fundamente com CPC e jurisprudência atual.`;
        } else if (category.id === 'review') {
            prompt = `Atue como especialista em Direito ${area.label}. Revise o seguinte texto/contrato focando em riscos e cláusulas abusivas: ${inputText}`;
        } else {
            prompt = `Realize uma pesquisa ou análise estratégica na área ${area.label} sobre: ${inputText}`;
        }

        onComplete(category.agent, prompt);
        onClose();
    };

    const currentStepConfig = STEPS[currentStep];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-purple-950/80 backdrop-blur-md animate-fade-in-up p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-gold-500/30 flex flex-col overflow-hidden relative">

                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                {/* Header */}
                <div className="p-8 text-center border-b border-slate-100 dark:border-slate-800 relative z-10">
                    <h2 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-blue-800 dark:from-purple-400 dark:to-blue-400 mb-2">
                        Guia Jurídico Inteligente
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        Passo {currentStep + 1} de {STEPS.length}
                    </p>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 mt-6 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-500 ease-out"
                            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto relative z-10">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-center">
                        {currentStepConfig.title}
                    </h3>

                    {currentStepConfig.type === 'input' ? (
                        <div className="space-y-6">
                            <textarea
                                className="w-full h-40 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-lg focus:border-purple-500 focus:ring-0 transition-all resize-none shadow-inner"
                                placeholder="Descreva os fatos, cole o texto ou explique o que precisa..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                autoFocus
                            />
                            <button
                                onClick={handleFinish}
                                disabled={!inputText.trim()}
                                className="w-full py-4 bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-purple-900/20 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <Icons.Sparkles className="w-5 h-5 mr-2 animate-pulse" /> Gerar com IA
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {currentStepConfig.options?.map((opt: any) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleSelect(opt)}
                                    className="flex items-center p-6 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-gold-500 dark:hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/10 transition-all group text-left"
                                >
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg mr-4 group-hover:bg-gold-100 dark:group-hover:bg-gold-900/20 transition-colors">
                                        {React.createElement((Icons as any)[opt.icon], { className: "w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:text-gold-600 dark:group-hover:text-gold-400" })}
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-lg group-hover:text-purple-700 dark:group-hover:text-purple-300">
                                        {opt.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center relative z-10">
                    {currentStep > 0 ? (
                        <button onClick={() => setCurrentStep(currentStep - 1)} className="text-slate-500 hover:text-purple-600 font-medium flex items-center">
                            <Icons.ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                        </button>
                    ) : (
                        <div></div>
                    )}
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 text-sm">Cancelar</button>
                </div>
            </div>
        </div>
    );
}