import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import AnimatedButton from './AnimatedButton';

interface LegalToolsProps {
  onClose: () => void;
}

const HOLIDAYS = [
  '01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '12-25'
];

type ToolTab = 'deadlines' | 'monetary' | 'fees';

export default function LegalTools({ onClose }: LegalToolsProps) {
  const [activeTab, setActiveTab] = useState<ToolTab>('deadlines');

  // State: Deadlines
  const [deadlineData, setDeadlineData] = useState({ date: '', days: 15, type: 'business' });
  const [deadlineResult, setDeadlineResult] = useState<{date: string, raw: Date} | null>(null);

  // State: Monetary
  const [monetaryData, setMonetaryData] = useState({ value: '', date: '', index: 'IGPM' });
  const [monetaryResult, setMonetaryResult] = useState<string | null>(null);

  // State: Fees
  const [feesData, setFeesData] = useState({ value: '', percent: 20 });
  const [feesResult, setFeesResult] = useState<string | null>(null);

  // --- LOGIC: DEADLINES ---
  const calculateDeadline = () => {
    if (!deadlineData.date) return;

    let currentDate = new Date(deadlineData.date);
    // Move to next day to start counting (CPC rule: excludes start day)
    currentDate.setDate(currentDate.getDate() + 1);

    let count = 0;
    while (count < deadlineData.days) {
        const iso = currentDate.toISOString().slice(5, 10);
        const dayOfWeek = currentDate.getDay(); // 0 = Sun, 6 = Sat

        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = HOLIDAYS.includes(iso);

        if (deadlineData.type === 'calendar') {
            count++;
        } else {
            // Business days
            if (!isWeekend && !isHoliday) {
                count++;
            }
        }

        if (count < deadlineData.days) {
             currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    // Prorogação (se cair em feriado/fds)
    while(true) {
        const iso = currentDate.toISOString().slice(5, 10);
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = HOLIDAYS.includes(iso);

        if (!isWeekend && !isHoliday) break;
        currentDate.setDate(currentDate.getDate() + 1);
    }

    setDeadlineResult({
        date: currentDate.toLocaleDateString('pt-BR'),
        raw: currentDate
    });
  };

  const addToGoogleCalendar = () => {
      if (!deadlineResult) return;
      const title = encodeURIComponent("Prazo Fatal - JusArtificial");
      const details = encodeURIComponent(`Vencimento do prazo de ${deadlineData.days} dias. Iniciado em: ${new Date(deadlineData.date).toLocaleDateString('pt-BR')}.`);
      const startStr = deadlineResult.raw.toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0,8);
      const endStr = new Date(deadlineResult.raw.getTime() + 86400000).toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0,8);
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}`;
      window.open(url, '_blank');
  };

  // --- LOGIC: MONETARY ---
  const calculateMonetary = () => {
      // Simulação de cálculo (em produção conectaria a uma API de índices)
      const val = parseFloat(monetaryData.value);
      if (isNaN(val)) return;

      // Lógica Mock: Inflação média simulada de 0.5% ao mês desde a data
      const start = new Date(monetaryData.date);
      const now = new Date();
      const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());

      const rate = 0.005; // 0.5% a.m.
      const corrected = val * Math.pow((1 + rate), months);

      setMonetaryResult(corrected.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  };

  // --- LOGIC: FEES ---
  const calculateFees = () => {
      const val = parseFloat(feesData.value);
      if (isNaN(val)) return;
      const total = val * (feesData.percent / 100);
      setFeesResult(total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in-up p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden max-h-[90vh]">

            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center text-lg font-serif">
                    <Icons.Briefcase className="w-5 h-5 mr-2 text-emerald-600" />
                    Ferramentas Jurídicas
                </h3>
                <button onClick={onClose}><Icons.X className="w-6 h-6 text-slate-400 hover:text-red-500" /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button onClick={() => setActiveTab('deadlines')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'deadlines' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/30' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Icons.CalendarClock className="w-4 h-4 inline mr-2"/> Prazos
                </button>
                <button onClick={() => setActiveTab('monetary')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'monetary' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/30' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Icons.TrendingUp className="w-4 h-4 inline mr-2"/> Correção
                </button>
                <button onClick={() => setActiveTab('fees')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'fees' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/30' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Icons.Percent className="w-4 h-4 inline mr-2"/> Honorários
                </button>
            </div>

            <div className="p-6 overflow-y-auto">
                {/* TAB: DEADLINES */}
                {activeTab === 'deadlines' && (
                    <div className="space-y-5 animate-fade-in-right">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Data da Publicação</label>
                            <input type="date" className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500" value={deadlineData.date} onChange={e => setDeadlineData({...deadlineData, date: e.target.value})} />
                        </div>
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Prazo (Dias)</label>
                                <input type="number" className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500" value={deadlineData.days} onChange={e => setDeadlineData({...deadlineData, days: Number(e.target.value)})} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Contagem</label>
                                <select
                                    className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={deadlineData.type}
                                    onChange={e => setDeadlineData({...deadlineData, type: e.target.value})}
                                >
                                    <option value="business">Dias Úteis (CPC)</option>
                                    <option value="calendar">Dias Corridos</option>
                                </select>
                            </div>
                        </div>
                        <AnimatedButton onClick={calculateDeadline} variant="primary" label="Calcular Vencimento" className="w-full py-3" />

                        {deadlineResult && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 text-center">
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Prazo Fatal</span>
                                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{deadlineResult.date}</div>
                                <button onClick={addToGoogleCalendar} className="text-xs text-slate-500 hover:text-emerald-600 mt-2 underline">Adicionar à Agenda</button>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: MONETARY */}
                {activeTab === 'monetary' && (
                    <div className="space-y-5 animate-fade-in-right">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-xs text-amber-700 dark:text-amber-400 mb-2">
                            <Icons.AlertCircle className="w-3 h-3 inline mr-1"/>
                            Cálculo estimativo para Valor da Causa. Em liquidação de sentença, consulte um contador.
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Valor Original (R$)</label>
                            <input type="number" placeholder="0,00" className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500" value={monetaryData.value} onChange={e => setMonetaryData({...monetaryData, value: e.target.value})} />
                        </div>
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Data Inicial</label>
                                <input type="date" className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500" value={monetaryData.date} onChange={e => setMonetaryData({...monetaryData, date: e.target.value})} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Índice</label>
                                <select
                                    className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={monetaryData.index}
                                    onChange={e => setMonetaryData({...monetaryData, index: e.target.value})}
                                >
                                    <option value="IGPM">IGP-M (FGV)</option>
                                    <option value="IPCA">IPCA (IBGE)</option>
                                    <option value="INPC">INPC (IBGE)</option>
                                </select>
                            </div>
                        </div>
                        <AnimatedButton onClick={calculateMonetary} variant="primary" label="Atualizar Valor" className="w-full py-3" />

                        {monetaryResult && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Valor Corrigido (Est.)</span>
                                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">{monetaryResult}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: FEES */}
                {activeTab === 'fees' && (
                    <div className="space-y-5 animate-fade-in-right">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Valor da Causa / Condenação (R$)</label>
                            <input type="number" className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500" value={feesData.value} onChange={e => setFeesData({...feesData, value: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Percentual de Honorários (%)</label>
                            <div className="flex items-center space-x-2">
                                <input type="range" min="10" max="30" step="1" className="flex-1 accent-emerald-500" value={feesData.percent} onChange={e => setFeesData({...feesData, percent: Number(e.target.value)})} />
                                <span className="w-12 text-center font-bold text-slate-700 dark:text-white">{feesData.percent}%</span>
                            </div>
                        </div>
                        <AnimatedButton onClick={calculateFees} variant="primary" label="Calcular Honorários" className="w-full py-3" />

                        {feesResult && (
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800 text-center">
                                <span className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">Valor dos Honorários</span>
                                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mt-1">{feesResult}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}