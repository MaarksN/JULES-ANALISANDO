import React from 'react';

const SkeletonLoader = () => (
    <div className="max-w-[85%] rounded-2xl p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm w-full">
        <div className="flex items-center space-x-2 mb-4">
            <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse"></div>
        </div>
    </div>
);

export default SkeletonLoader;