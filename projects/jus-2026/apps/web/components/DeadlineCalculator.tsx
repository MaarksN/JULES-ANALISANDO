import React, { useState } from 'react';
import * as Icons from 'lucide-react';

interface DeadlineCalculatorProps {
  onClose: () => void;
}

const HOLIDAYS = [
  '01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '12-25'
];

export default function DeadlineCalculator({ onClose }: DeadlineCalculatorProps) {
  const [startDate, setStartDate] = useState('');
  const [days, setDays] = useState(15);
  const [type, setType] = useState<'business' | 'calendar'>('business');
  const [result, setResult] = useState<string | null>(null);
  const [resultDate, setResultDate] = useState<Date | null>(null);

  const calculate = () => {
    if (!startDate) return;

    let currentDate = new Date(startDate);
    // Move to next day to start counting (CPC rule: excludes start day)
    currentDate.setDate(currentDate.getDate() + 1);

    let count = 0;
    while (count < days) {
        const iso = currentDate.toISOString().slice(5, 10);
        const dayOfWeek = currentDate.getDay(); // 0 = Sun, 6 = Sat

        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = HOLIDAYS.includes(iso);

        if (type === 'calendar') {
            count++;
        } else {
            // Business days
            if (!isWeekend && !isHoliday) {
                count++;
            }
        }

        if (count < days) {
             currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    // If ends on non-business day, push forward (Prorogação)
    while(true) {
        const iso = currentDate.toISOString().slice(5, 10);
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = HOLIDAYS.includes(iso);

        if (!isWeekend && !isHoliday) break;
        currentDate.setDate(currentDate.getDate() + 1);
    }

    setResult(currentDate.toLocaleDateString('pt-BR'));
    setResultDate(currentDate);
  };

  const addToGoogleCalendar = () => {
      if (!resultDate) return;

      const title = encodeURIComponent("Prazo Fatal - JusArtificial");
      const details = encodeURIComponent(`Vencimento do prazo de ${days} dias (${type === 'business' ? 'úteis' : 'corridos'}). Iniciado em: ${new Date(startDate).toLocaleDateString('pt-BR')}.`);

      // Formatar datas para YYYYMMDD
      const startStr = resultDate.toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0,8);
      const endStr = new Date(resultDate.getTime() + 86400000).toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0,8);

      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&sprop=name:JusArtificial`;
      window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in-up">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    <Icons.CalendarClock className="w-5 h-5 mr-2 text-emerald-600" />
                    Calculadora de Prazos
                </h3>
                <button onClick={onClose}><Icons.X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Data da Publicação/Intimação</label>
                    <input type="date" className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1">Prazo (dias)</label>
                     <input type="number" className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none" value={days} onChange={e => setDays(Number(e.target.value))} />
                </div>
                <div>
                     <label className="block text-xs font-medium text-slate-500 mb-1">Contagem</label>
                     <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                         <button onClick={() => setType('business')} className={`flex-1 py-1.5 text-xs rounded-md transition-all ${type === 'business' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}>Dias Úteis (CPC)</button>
                         <button onClick={() => setType('calendar')} className={`flex-1 py-1.5 text-xs rounded-md transition-all ${type === 'calendar' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}>Dias Corridos</button>
                     </div>
                </div>

                <button onClick={calculate} className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20">Calcular Vencimento</button>

                {result && (
                    <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800 text-center animate-fade-in-down">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Prazo Fatal</span>
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{result}</div>

                        <button
                            onClick={addToGoogleCalendar}
                            className="mt-3 w-full flex items-center justify-center text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Icons.Calendar className="w-3 h-3 mr-2" /> Adicionar ao Google Agenda
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}