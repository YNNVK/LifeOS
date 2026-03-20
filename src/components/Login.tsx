import React, { useState } from 'react';
import { LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export const Login = () => {
  const { signIn } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setError(null);
    try {
      await signIn();
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError("Le popup a été bloqué par votre navigateur. Veuillez autoriser les popups pour ce site.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignore this one as it usually means a previous request was cancelled
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("La fenêtre de connexion a été fermée avant la fin de l'authentification.");
      } else {
        setError("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl mb-6">
            <Sparkles size={48} className="text-purple-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            LifeOS
          </h1>
          <p className="text-white/50 text-lg">
            Votre système d'exploitation quotidien optimisé par l'IA.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[40px] shadow-2xl">
          <h2 className="text-2xl font-bold mb-8 text-center">Bienvenue</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <button 
            onClick={handleSignIn}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-4 py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            )}
            {isLoggingIn ? "Connexion en cours..." : "Se connecter avec Google"}
          </button>
          
          <p className="mt-8 text-center text-xs text-white/30 leading-relaxed">
            En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
        </div>

        <div className="mt-12 flex justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/20">Sécurisé</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/20">Privé</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/20">IA Native</span>
          </div>
        </div>
      </div>
    </div>
  );
};
