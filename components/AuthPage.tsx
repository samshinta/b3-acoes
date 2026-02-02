
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthPage: React.FC = () => {
  const { signIn, signUp, resetPassword, error, user, resendVerification, checkVerification, logout, isDemoMode, loginAsGuest } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer para o botão de reenvio
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Limpa mensagens ao trocar de modo
  useEffect(() => {
    setSuccessMsg(null);
  }, [isLogin, isResetting]);

  // Tela de verificação
  if (user && !user.emailVerified) {
    const handleCheck = async () => {
      setVerifying(true);
      try {
        await checkVerification();
      } finally {
        setTimeout(() => setVerifying(false), 800);
      }
    };

    const handleResend = async () => {
      if (resendTimer > 0) return;
      try {
        await resendVerification();
        setSuccessMsg('Novo link enviado com sucesso!');
        setResendTimer(60);
        setTimeout(() => setSuccessMsg(null), 5000);
      } catch (err) {
        setSuccessMsg('Erro ao enviar. Tente novamente em instantes.');
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
            <i className={`fa-solid ${verifying ? 'fa-circle-notch animate-spin text-cyan-400' : 'fa-envelope-circle-check text-cyan-500'} text-3xl`}></i>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verifique seu E-mail</h1>
          <p className="text-slate-400 mb-2 text-sm">Enviamos um link de ativação para:</p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 mb-6 inline-block">
            <span className="text-cyan-400 font-mono font-bold text-sm">{user.email}</span>
          </div>
          
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-8 text-left">
            <h4 className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2">
              <i className="fa-solid fa-lightbulb"></i>
              Dica Importante
            </h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Não recebeu? Verifique as pastas de <b>Spam</b> ou <b>Promoções</b>.
            </p>
          </div>
          
          <div className="space-y-3">
            <button onClick={handleCheck} disabled={verifying} className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2">
              {verifying ? 'Consultando Servidor...' : 'Já Confirmei o E-mail'}
            </button>
            <button onClick={handleResend} disabled={resendTimer > 0} className={`w-full font-bold py-3 rounded-xl transition-all text-sm border flex items-center justify-center gap-2 ${resendTimer > 0 ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'}`}>
              <i className="fa-solid fa-paper-plane"></i>
              {resendTimer > 0 ? `Aguarde ${resendTimer}s` : 'Reenviar Link Agora'}
            </button>
            <div className="pt-4 flex flex-col gap-2">
              <button onClick={() => logout()} className="text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-all uppercase tracking-widest">
                <i className="fa-solid fa-pen-to-square mr-2"></i>
                Editar E-mail / Corrigir Erro
              </button>
            </div>
          </div>
          {successMsg && <p className="mt-4 text-emerald-400 text-xs font-bold animate-pulse">{successMsg}</p>}
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    try {
      if (isResetting) {
        await resetPassword(email);
        setSuccessMsg('Link de redefinição enviado! Verifique seu e-mail.');
      } else if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        setSuccessMsg('Conta criada! Verifique seu e-mail.');
      }
    } catch (err) {
      // Erro tratado pelo contexto
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl border-t-4 border-t-cyan-500/50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
            <i className="fa-solid fa-chart-line text-slate-950 text-2xl"></i>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic">
            QuantAI<span className="text-cyan-400">Predictor</span>
          </h1>
          <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-[0.3em] font-black">
            {isResetting ? 'Recuperação de Acesso' : isLogin ? 'Análise de Alta Precisão' : 'Registro de Novo Analista'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-700"
              placeholder="seu@email.com"
            />
          </div>

          {!isResetting && (
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Senha</label>
                {isLogin && (
                  <button 
                    type="button"
                    onClick={() => setIsResetting(true)}
                    className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 transition-colors uppercase"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-700"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-[11px] font-medium flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-[11px] font-bold flex items-center gap-2">
              <i className="fa-solid fa-circle-check"></i>
              {successMsg}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20"
          >
            {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : (isResetting ? 'ENVIAR LINK DE RECUPERAÇÃO' : isLogin ? 'ENTRAR AGORA' : 'CRIAR CONTA')}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          {isResetting ? (
            <button
              onClick={() => setIsResetting(false)}
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors font-bold uppercase tracking-widest"
            >
              Voltar ao Login
            </button>
          ) : (
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors font-bold uppercase tracking-widest"
            >
              {isLogin ? 'Novo por aqui? Cadastre-se' : 'Já possui conta? Faça Login'}
            </button>
          )}
        </div>

        {isDemoMode && !isResetting && (
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4 font-bold">Modo Offline Detectado</p>
            <button
              onClick={loginAsGuest}
              className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold py-3 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <i className="fa-solid fa-user-secret"></i>
              Acessar Modo Demonstração
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
