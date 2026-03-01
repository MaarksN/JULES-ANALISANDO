import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { fetchWithRetry } from '../utils/retry';

const NotificationBell = ({ userId }: { userId?: string }) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const fetchNotifs = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetchWithRetry(`${API_URL}/api/notifications/${userId}`);
                if (res.ok) setNotifications(await res.json());
            } catch (e) {
                // Silent fail
            }
        };
        fetchNotifs();
        const timer = setInterval(fetchNotifs, 60000); // Poll every minute
        return () => clearInterval(timer);
    }, [userId]);

    const handleRead = async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            await fetchWithRetry(`${API_URL}/api/notifications/read/${id}`, { method: 'POST' });
        } catch(e) {}
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="p-3 bg-white dark:bg-slate-800 text-slate-500 hover:text-emerald-600 rounded-xl border border-slate-200 dark:border-slate-700 transition-all relative">
                <Icons.Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-fade-in-up">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-200">
                        Notificações
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-400">
                                Tudo tranquilo por aqui.
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className="p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex justify-between group">
                                    <div>
                                        <div className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-1">{n.title}</div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{n.message}</div>
                                    </div>
                                    <button onClick={() => handleRead(n.id)} className="text-slate-300 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                                        <Icons.Check className="w-4 h-4"/>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
