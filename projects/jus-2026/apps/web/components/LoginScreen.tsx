import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false); // Item 53

  const handleLogin = async () => {
      if (!acceptedTerms) {
          alert("Você deve aceitar os termos de uso para continuar.");
          return;
      }
      setIsLoggingIn(true);
      // O AuthContext já trata o erro e faz fallback para Demo User se necessário
      await signInWithGoogle();
      setIsLoggingIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border border-white/10 animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold-500/20 transform rotate-3">
            <Icons.Scale className="w-10 h-10 text-purple-950" />
          </div>
          <h1 className="text-3xl font-bold text-white font-serif mb-2 tracking-tight">JusArtificial</h1>
          <p className="text-purple-200 font-light text-lg">Seu escritório digital de alta performance.</p>
        </div>

        <div className="space-y-4">
          {/* Item 53: Disclaimer de IA */}
          <div className="mb-4 text-left bg-black/20 p-3 rounded-lg border border-white/10">
              <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-gold-500 rounded border-slate-500"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                      Concordo que a JusArtificial é uma ferramenta de auxílio.
                      <strong className="text-white block mt-1">A responsabilidade final pelo conteúdo peticionado é inteiramente do advogado licenciado.</strong>
                  </span>
              </label>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoggingIn || !acceptedTerms}
            className={`w-full flex items-center justify-center space-x-3 font-bold py-4 px-6 border border-slate-200 rounded-xl shadow-xl transition-all duration-200 group transform hover:scale-[1.02] ${acceptedTerms ? 'bg-white hover:bg-slate-50 text-slate-900' : 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-70'}`}
          >
            {isLoggingIn ? (
                <Icons.Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
            )}
            <span>{isLoggingIn ? 'Autenticando...' : 'Entrar com Google'}</span>
            {!isLoggingIn && <Icons.ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 text-purple-600" />}
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
            <div className="flex items-center justify-center space-x-2 text-gold-400/80 mb-2">
                <Icons.ShieldCheck className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest font-bold">Ambiente Seguro</span>
            </div>
            <p className="text-[10px] text-slate-400">
                Caso o login falhe, o Modo Demonstração será ativado automaticamente.
            </p>
        </div>
      </div>
    </div>
  );
}