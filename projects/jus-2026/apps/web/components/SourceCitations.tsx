import React from 'react';
import * as Icons from 'lucide-react';

interface SourceCitationsProps {
  sources: string[];
}

const SourceCitations: React.FC<SourceCitationsProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  // Filtrar e limpar URLs para exibição
  const uniqueSources = Array.from(new Set(sources));

  const getDomain = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
        <Icons.Link className="w-3 h-3 mr-1" /> Fontes Citadas
      </p>
      <div className="flex flex-wrap gap-2">
        {uniqueSources.slice(0, 5).map((source, idx) => (
          <a
            key={idx}
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center bg-slate-100 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1.5 transition-colors group text-decoration-none max-w-full"
          >
            <div className="bg-white dark:bg-slate-800 p-0.5 rounded-sm mr-2 shrink-0">
               <img
                 src={`https://www.google.com/s2/favicons?domain=${source}&sz=16`}
                 alt=""
                 className="w-3 h-3 opacity-70 group-hover:opacity-100"
                 onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
               />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[150px] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-medium">
              {getDomain(source)}
            </span>
            <Icons.ExternalLink className="w-3 h-3 ml-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
        {uniqueSources.length > 5 && (
            <span className="text-[10px] text-slate-400 self-center">+{uniqueSources.length - 5} outras</span>
        )}
      </div>
    </div>
  );
};

export default SourceCitations;