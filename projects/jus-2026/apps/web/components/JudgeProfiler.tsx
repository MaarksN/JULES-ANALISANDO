import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { AgentType } from '../types';
import { AGENTS } from '../constants';
import { sendMessageToGemini } from '../services/gemini';
import AnimatedButton from './AnimatedButton';
import { JudgeProfileCard, JudgeProfile } from './RichMessageRenderers';

interface JudgeProfilerProps {
  onClose: () => void;
  onSaveToContext: (profile: JudgeProfile) => void;
}

export default function JudgeProfiler({ onClose, onSaveToContext }: JudgeProfilerProps) {
  const [judgeName, setJudgeName] = useState('');
  const [court, setCourt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<JudgeProfile | null>(null);
  const [analysisText, setAnalysisText] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgeName.trim()) return;

    setIsLoading(true);
    setProfile(null);
    setAnalysisText('');

    try {
        const agent = AGENTS[AgentType.JUDGE_ANALYST];
        const prompt = `Analise o perfil do magistrado: ${judgeName} (${court || 'Tribunal não informado'}).

        RETORNE APENAS O JSON NO FORMATO ESPECIFICADO NA SUA INSTRUÇÃO DE SISTEMA (:::JUDGE_PROFILE:::).
        Inclua também uma breve análise textual antes do JSON.`;

        const response = await sendMessageToGemini(agent, [], prompt, []);

        // Extract JSON
        const jsonMatch = response.text.match(/:::JUDGE_PROFILE::: ({.*?})\s*:::?/s) || response.text.match(/{.*}/s);

        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            setProfile(parsed);
            // Remove o JSON do texto para mostrar só a análise
            setAnalysisText(response.text.replace(jsonMatch[0], '').replace(/:::JUDGE_PROFILE:::/g, '').trim());
        } else {
            setAnalysisText(response.text);
        }
    } catch (err) {
        setAnalysisText("Erro ao analisar perfil. Tente novamente.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in-up p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
               <Icons.Gavel className="w-6 h-6" />
            </div>
            <div>
               <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif">Perfil de Magistrado</h2>
               <p className="text-sm text-slate-500 dark:text-slate-400">Jurimetria estratégica via IA.</p>
            </div>
          </div>
          <button onClick={onClose}><Icons.X className="w-6 h-6 text-slate-400 hover:text-red-500" /></button>
        </div>

        {/* Form */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nome do Juiz / Ministro</label>
                    <input
                        type="text"
                        placeholder="Ex: Alexandre de Moraes"
                        className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                        value={judgeName}
                        onChange={(e) => setJudgeName(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="sm:w-48">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tribunal (Opcional)</label>
                    <input
                        type="text"
                        placeholder="Ex: STF, TJSP"
                        className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                        value={court}
                        onChange={(e) => setCourt(e.target.value)}
                    />
                </div>
                <div className="flex items-end">
                    <AnimatedButton
                        type="submit"
                        variant="primary"
                        label="Investigar"
                        icon="Search"
                        isLoading={isLoading}
                        className="w-full sm:w-auto py-3 bg-purple-600 hover:bg-purple-700"
                    />
                </div>
            </form>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/50">
            {!profile && !analysisText && !isLoading && (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 opacity-60 text-center">
                    <Icons.Search className="w-12 h-12 mb-3" />
                    <p>Digite o nome para revelar tendências de julgamento,</p>
                    <p>taxa de favorabilidade e dicas estratégicas.</p>
                </div>
            )}

            {analysisText && (
                <div className="mb-6 prose prose-sm dark:prose-invert max-w-none">
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Análise Preliminar:</h4>
                    <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-400 leading-relaxed">{analysisText}</p>
                </div>
            )}

            {profile && (
                <div className="animate-fade-in-up">
                    <JudgeProfileCard profile={profile} />

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => { onSaveToContext(profile); onClose(); }}
                            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg"
                        >
                            <Icons.CheckCircle className="w-4 h-4" />
                            <span>Usar na Estratégia do Caso</span>
                        </button>
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}