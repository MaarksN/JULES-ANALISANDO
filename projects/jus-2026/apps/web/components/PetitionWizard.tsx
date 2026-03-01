import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import AnimatedButton from './AnimatedButton';

interface PetitionWizardProps {
  onClose: () => void;
  onSubmit: (prompt: string) => void;
}

const STEPS = [
  { id: 'basics', title: 'Dados Básicos', icon: 'FileText' },
  { id: 'parties', title: 'Partes', icon: 'Users' },
  { id: 'facts', title: 'Fatos e Provas', icon: 'AlignLeft' },
  { id: 'strategy', title: 'Estratégia', icon: 'Target' }
];

export default function PetitionWizard({ onClose, onSubmit }: PetitionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    actionType: '',
    jurisdiction: '', // Cível, Trabalhista, Federal...
    clientName: '',
    clientRole: 'Autor', // Autor ou Réu
    opposingName: '',
    facts: '',
    evidences: '',
    desiredOutcome: '',
    priority: 'Normal' // Normal, Urgente (Liminar)
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(curr => curr + 1);
    else generatePrompt();
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(curr => curr - 1);
  };

  const generatePrompt = () => {
    const prompt = `
[CONTEXTO ESTRUTURADO PARA ELABORAÇÃO DE PEÇA]

1. TIPO DE PEÇA: ${formData.actionType}
2. COMPETÊNCIA PREFERENCIAL: ${formData.jurisdiction || 'A definir pela IA'}
3. PRIORIDADE: ${formData.priority} ${formData.priority === 'Urgente' ? '(Incluir pedido de Tutela de Urgência/Liminar)' : ''}

4. PARTES:
   - Cliente (${formData.clientRole}): ${formData.clientName}
   - Parte Contrária: ${formData.opposingName}

5. NARRATIVA DOS FATOS:
   ${formData.facts}

6. PROVAS DISPONÍVEIS:
   ${formData.evidences || 'Provas documentais padrão anexa.'}

7. OBJETIVOS E PEDIDOS:
   ${formData.desiredOutcome}

INSTRUÇÃO: Com base nos dados acima, redija a peça processual completa, incluindo endereçamento, qualificação (com placeholders), fatos detalhados, fundamentação jurídica robusta (cite artigos e súmulas) e pedidos finais.
    `.trim();

    onSubmit(prompt);
  };

  const StepIcon = (Icons as any)[STEPS[currentStep].icon] || Icons.Circle;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in-up p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 rounded-t-2xl">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
               <StepIcon className="w-6 h-6" />
            </div>
            <div>
               <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif">Assistente de Petição</h2>
               <p className="text-sm text-slate-500 dark:text-slate-400">Passo {currentStep + 1} de {STEPS.length}: {STEPS[currentStep].title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500"><Icons.X className="w-6 h-6" /></button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">

            {/* Step 1: Basics */}
            {currentStep === 0 && (
                <div className="space-y-6 animate-fade-in-right">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Qual o nome da ação ou peça?</label>
                        <input
                            type="text"
                            placeholder="Ex: Ação de Indenização por Danos Morais, Contestação, Habeas Corpus..."
                            className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-lg"
                            value={formData.actionType}
                            onChange={e => handleChange('actionType', e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Competência (Opcional)</label>
                            <select
                                className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.jurisdiction}
                                onChange={e => handleChange('jurisdiction', e.target.value)}
                            >
                                <option value="">IA decide</option>
                                <option value="Cível Comum">Cível Comum</option>
                                <option value="JEC (Juizado Especial)">JEC (Juizado Especial)</option>
                                <option value="Trabalhista">Trabalhista</option>
                                <option value="Família">Família</option>
                                <option value="Federal">Federal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Urgência</label>
                            <div className="flex space-x-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => handleChange('priority', 'Normal')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.priority === 'Normal' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-400'}`}
                                >
                                    Normal
                                </button>
                                <button
                                    onClick={() => handleChange('priority', 'Urgente')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.priority === 'Urgente' ? 'bg-red-500 shadow text-white' : 'text-slate-400'}`}
                                >
                                    Urgente
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Parties */}
            {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in-right">
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Seu Cliente é:</label>
                            <div className="flex space-x-2">
                                <button onClick={() => handleChange('clientRole', 'Autor')} className={`flex-1 py-2 border rounded-lg ${formData.clientRole === 'Autor' ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 dark:text-slate-400'}`}>Autor</button>
                                <button onClick={() => handleChange('clientRole', 'Réu')} className={`flex-1 py-2 border rounded-lg ${formData.clientRole === 'Réu' ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 dark:text-slate-400'}`}>Réu</button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nome do Cliente</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={formData.clientName}
                            onChange={e => handleChange('clientName', e.target.value)}
                            placeholder="Nome Completo ou Razão Social"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nome da Parte Contrária</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={formData.opposingName}
                            onChange={e => handleChange('opposingName', e.target.value)}
                            placeholder="Quem está sendo processado?"
                        />
                    </div>
                </div>
            )}

            {/* Step 3: Facts */}
            {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in-right">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Narrativa dos Fatos</label>
                        <p className="text-xs text-slate-500 mb-2">Descreva o ocorrido cronologicamente. Quanto mais detalhes, melhor.</p>
                        <textarea
                            className="w-full h-40 p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                            value={formData.facts}
                            onChange={e => handleChange('facts', e.target.value)}
                            placeholder="Ex: No dia 10/01/2024, o autor firmou contrato com a ré..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Provas Principais (Opcional)</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={formData.evidences}
                            onChange={e => handleChange('evidences', e.target.value)}
                            placeholder="Ex: Contrato assinado, Prints de WhatsApp, Boletim de Ocorrência..."
                        />
                    </div>
                </div>
            )}

            {/* Step 4: Strategy */}
            {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in-right">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">O que você quer pedir? (Pedidos)</label>
                        <textarea
                            className="w-full h-32 p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                            value={formData.desiredOutcome}
                            onChange={e => handleChange('desiredOutcome', e.target.value)}
                            placeholder="Ex: Condenação em danos morais de R$ 10.000, nulidade da cláusula contratual..."
                        />
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                        <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-2 flex items-center"><Icons.Sparkles className="w-4 h-4 mr-2"/> Resumo da Solicitação</h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                            A IA irá gerar uma <strong>{formData.actionType || 'Petição'}</strong> para <strong>{formData.clientName || 'o Cliente'}</strong> contra <strong>{formData.opposingName || 'a Parte Contrária'}</strong>.
                            {formData.priority === 'Urgente' && ' Incluirá capítulo de Tutela de Urgência.'}
                        </p>
                    </div>
                </div>
            )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between bg-white dark:bg-slate-900 rounded-b-2xl">
            <button
                onClick={handleBack}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                Voltar
            </button>
            <div className="flex space-x-2">
                 {STEPS.map((_, i) => (
                     <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                 ))}
            </div>
            <AnimatedButton
                onClick={handleNext}
                variant="primary"
                label={currentStep === STEPS.length - 1 ? "Gerar Minuta" : "Próximo"}
                icon={currentStep === STEPS.length - 1 ? "Wand2" : "ArrowRight"}
                className="px-6"
            />
        </div>

      </div>
    </div>
  );
}