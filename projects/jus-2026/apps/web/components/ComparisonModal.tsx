import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { computeDiff, DiffPart } from '../utils/diffLogic';
import AnimatedButton from './AnimatedButton';
import { AGENTS } from '../constants';
import { AgentType } from '../types';
import { sendMessageToGemini } from '../services/gemini';

interface ComparisonModalProps {
  onClose: () => void;
}

export default function ComparisonModal({ onClose }: ComparisonModalProps) {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [diffResult, setDiffResult] = useState<DiffPart[] | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCompare = () => {
      const diff = computeDiff(textA, textB);
      setDiffResult(diff);
      setAiAnalysis('');
  };

  const handleAiAnalysis = async () => {
      if (!textA || !textB) return;
      setIsAnalyzing(true);
      try {
          const agent = AGENTS[AgentType.COMPARISON];
          const prompt = `Compare os dois textos abaixo e aponte os riscos das alterações feitas.

          TEXTO ORIGINAL:
          "${textA.slice(0, 5000)}"

          TEXTO ALTERADO:
          "${textB.slice(0, 5000)}"

          Foque em: Supressão de direitos, alteração de valores/prazos e inclusão de obrigações.`;

          const response = await sendMessageToGemini(agent, [], prompt, []);
          setAiAnalysis(response.text);
      } catch (e) {
          setAiAnalysis("Erro ao analisar com IA.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Icons.GitCompare className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Comparador de Versões</h2>
                <p className="text-xs text-slate-500">Cole as versões para identificar alterações.</p>
             </div>
          </div>
          <button onClick={onClose}><Icons.X className="w-6 h-6 text-slate-400 hover:text-red-500" /></button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

            {!diffResult ? (
                // Input Mode
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 h-full">
                    <div className="p-4 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2">Versão Original (A)</label>
                        <textarea
                            className="flex-1 w-full p-4 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 resize-none focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed"
                            placeholder="Cole o texto original aqui..."
                            value={textA}
                            onChange={e => setTextA(e.target.value)}
                        />
                    </div>
                    <div className="p-4 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2">Nova Versão (B)</label>
                        <textarea
                            className="flex-1 w-full p-4 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 resize-none focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed"
                            placeholder="Cole o texto alterado aqui..."
                            value={textB}
                            onChange={e => setTextB(e.target.value)}
                        />
                    </div>
                </div>
            ) : (
                // Result Mode
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-900">
                        <div className="prose prose-sm max-w-none dark:prose-invert font-mono text-sm leading-7">
                            {diffResult.map((part, index) => {
                                if (part.type === 'eq') return <span key={index} className="text-slate-500 dark:text-slate-400">{part.value}</span>;
                                if (part.type === 'add') return <span key={index} className="bg-green-200 dark:bg-green-900/60 text-green-900 dark:text-green-100 px-1 rounded mx-0.5 font-bold decoration-clone box-decoration-clone">{part.value}</span>;
                                if (part.type === 'del') return <span key={index} className="bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-100 line-through px-1 rounded mx-0.5 opacity-60 decoration-clone box-decoration-clone">{part.value}</span>;
                                return null;
                            })}
                        </div>
                    </div>
                    {aiAnalysis && (
                        <div className="h-64 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 overflow-y-auto animate-fade-in-up">
                            <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center">
                                <Icons.Bot className="w-4 h-4 mr-2"/> Análise de Riscos da IA
                            </h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{aiAnalysis}</p>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
            {diffResult ? (
                <>
                    <button onClick={() => { setDiffResult(null); setAiAnalysis(''); }} className="text-slate-500 hover:text-slate-700 text-sm font-medium">Voltar para Edição</button>
                    <div className="flex space-x-3">
                         <div className="flex items-center space-x-3 text-xs text-slate-500 mr-4">
                            <span className="flex items-center"><span className="w-3 h-3 bg-red-200 dark:bg-red-900/60 rounded mr-1"></span> Removido</span>
                            <span className="flex items-center"><span className="w-3 h-3 bg-green-200 dark:bg-green-900/60 rounded mr-1"></span> Adicionado</span>
                         </div>
                         <AnimatedButton
                            onClick={handleAiAnalysis}
                            variant="secondary"
                            label="Analisar Riscos com IA"
                            icon="Sparkles"
                            isLoading={isAnalyzing}
                         />
                    </div>
                </>
            ) : (
                <div className="w-full flex justify-end">
                    <AnimatedButton
                        onClick={handleCompare}
                        variant="primary"
                        label="Comparar Documentos"
                        icon="GitCompare"
                        disabled={!textA || !textB}
                        className="px-8"
                    />
                </div>
            )}
        </div>

      </div>
    </div>
  );
}