import React from 'react';
import * as Icons from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon = "Inbox", actionLabel, onAction }) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-full">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                {React.createElement((Icons as any)[icon] || Icons.Inbox, { className: "w-12 h-12 text-slate-400" })}
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors shadow-md flex items-center"
                >
                    <Icons.Plus className="w-4 h-4 mr-2" /> {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
