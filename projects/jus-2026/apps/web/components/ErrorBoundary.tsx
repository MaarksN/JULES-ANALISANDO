import React from 'react';
import { FallbackProps } from 'react-error-boundary';
import * as Icons from 'lucide-react';

export const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-50 dark:bg-red-900/10 p-6 text-center">
      <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
        <Icons.AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2">Algo deu errado</h2>
      <p className="text-red-600 dark:text-red-400 mb-6 max-w-md break-words font-mono text-sm bg-white dark:bg-black/20 p-2 rounded">
        {error.message}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors shadow-lg flex items-center"
      >
        <Icons.RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente
      </button>
    </div>
  );
};
