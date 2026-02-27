import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { fetchWithRetry } from '../utils/retry';

const AuditLogViewer = ({ userId }: { userId?: string }) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        const load = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetchWithRetry(`${API_URL}/api/audit/${userId}`);
                if (res.ok) setLogs(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [userId]);

    if (loading) return <div className="text-center p-4 text-xs">Carregando logs...</div>;

    return (
        <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded text-xs text-slate-500">
                <Icons.Eye className="w-3 h-3 inline mr-1"/> Registro imutável de atividades para conformidade.
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                    <div key={log.id} className="text-xs p-2 border-b border-slate-100 dark:border-slate-700 font-mono">
                        <span className="text-slate-400 mr-2">{new Date(log.timestamp).toLocaleString()}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 mr-2">{log.action}</span>
                        <span className="text-slate-500 truncate">{JSON.stringify(log.details)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AuditLogViewer; // Internal component usage in SettingsModal
