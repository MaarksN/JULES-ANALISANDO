import React from 'react';
import * as Icons from 'lucide-react';

interface BreadcrumbsProps {
  items: string[];
  onNavigate?: (index: number) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400">
      <Icons.Home className="w-3.5 h-3.5 mr-2 cursor-pointer hover:text-emerald-500" onClick={() => onNavigate?.(-1)} />
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <Icons.ChevronRight className="w-3 h-3 mx-2 text-slate-300 dark:text-slate-600" />
          <span
            className={`truncate max-w-[150px] ${index === items.length - 1 ? 'font-semibold text-slate-800 dark:text-slate-200' : 'hover:text-emerald-500 cursor-pointer transition-colors'}`}
            onClick={() => index !== items.length - 1 && onNavigate?.(index)}
          >
            {item}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;