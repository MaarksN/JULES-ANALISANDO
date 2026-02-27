import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: "Bem-vindo ao JusArtificial",
    content: "Sua suíte jurídica de alta performance. Vamos fazer um tour rápido?",
    icon: "Sparkles"
  },
  {
    title: "Agentes Especializados",
    content: "Na barra lateral, escolha entre 'Dra. Redatora', 'Dr. Analista' e outros especialistas para cada tarefa.",
    icon: "Users"
  },
  {
    title: "Ferramentas Úteis",
    content: "Acesse calculadoras de prazos, configurações e histórico de sessões facilmente.",
    icon: "Tool"
  },
  {
    title: "Chat & Documentos",
    content: "Converse com a IA no centro e veja sua minuta sendo construída em tempo real à direita.",
    icon: "Layout"
  },
  {
    title: "Refinamento Inteligente",
    content: "Selecione qualquer texto na minuta para pedir reescritas, correções ou melhorias formais.",
    icon: "Edit3"
  }
];

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      setIsVisible(false);
      onComplete();
    }
  };

  if (!isVisible) return null;

  const StepIcon = (Icons as any)[STEPS[currentStep].icon] || Icons.HelpCircle;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 relative overflow-hidden">

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1.5 bg-slate-100 dark:bg-slate-800 w-full">
           <div
             className="h-full bg-emerald-500 transition-all duration-300"
             style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
           ></div>
        </div>

        <div className="flex flex-col items-center text-center space-y-6 pt-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
             <StepIcon className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-serif">
              {STEPS[currentStep].title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {STEPS[currentStep].content}
            </p>
          </div>

          <div className="flex items-center space-x-2 mt-4">
             {STEPS.map((_, idx) => (
               <div
                 key={idx}
                 className={`w-2 h-2 rounded-full transition-colors ${idx === currentStep ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
               />
             ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center"
          >
            {currentStep === STEPS.length - 1 ? "Começar a Usar" : "Próximo"}
            {currentStep < STEPS.length - 1 && <Icons.ArrowRight className="w-4 h-4 ml-2" />}
          </button>

          <button
            onClick={() => { setIsVisible(false); onComplete(); }}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Pular tour
          </button>
        </div>
      </div>
    </div>
  );
}