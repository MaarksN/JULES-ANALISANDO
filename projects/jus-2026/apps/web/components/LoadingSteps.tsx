import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

const STEPS = [
    "Lendo contexto do escritório...",
    "Consultando base legal (CPC/CF)...",
    "Analisando jurisprudência do STJ...",
    "Verificando súmulas aplicáveis...",
    "Redigindo minuta final..."
];

const LoadingSteps = () => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % STEPS.length);
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700 w-fit animate-pulse">
            <Icons.Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
            <span className="font-medium">{STEPS[currentStep]}</span>
        </div>
    );
};

export default LoadingSteps;