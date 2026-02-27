import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { deriveKeyFromPassword, generateSalt, bufferToString } from '../utils/encryption';

interface MasterPasswordModalProps {
    onUnlock: (key: CryptoKey) => void;
}

export default function MasterPasswordModal({ onUnlock }: MasterPasswordModalProps) {
    const { user } = useAuth();
    const [password, setPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setError('');

        try {
            // Em produção real, buscaríamos o SALT do usuário no Firestore (userProfile)
            // Aqui simulamos que, se não existe, criamos um novo (First Login Logic)
            let userSalt = localStorage.getItem(`salt_${user?.uid}`);

            let salt: Uint8Array;
            if (!userSalt) {
                salt = generateSalt();
                localStorage.setItem(`salt_${user?.uid}`, bufferToString(salt));
            } else {
                salt = Uint8Array.from(atob(userSalt), c => c.charCodeAt(0));
            }

            const key = await deriveKeyFromPassword(password, salt);

            // Tenta desbloquear testando a chave (simulação: descriptografar algo ou apenas salvar em memória)
            onUnlock(key);
        } catch (err: any) {
            setError("Erro ao gerar chaves. Tente novamente.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950 text-white backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
                <div className="mx-auto bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                    <Icons.LockKeyhole className="w-8 h-8 text-emerald-500" />
                </div>

                <h2 className="text-2xl font-serif font-bold mb-2">Cofre Zero-Knowledge</h2>
                <p className="text-slate-400 text-sm mb-8">
                    Sua senha mestra nunca é enviada aos nossos servidores. <br/>
                    Ela é usada apenas localmente para descriptografar seus dados.
                </p>

                <form onSubmit={handleUnlock} className="space-y-4">
                    <div className="relative">
                        <Icons.Key className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite sua Senha Mestra"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder-slate-600"
                            autoFocus
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs">{error}</p>}

                    <button
                        type="submit"
                        disabled={!password || isProcessing}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Desbloqueando...' : 'Acessar Escritório'}
                    </button>
                </form>

                <p className="mt-6 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                    Criptografia AES-256-GCM (Client-Side)
                </p>
            </div>
        </div>
    );
}
