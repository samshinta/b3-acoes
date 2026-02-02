
import React, { useState, useCallback, useEffect } from 'react';
import { performStockAnalysis } from './services/geminiService';
import { AnalysisResult, AppStatus } from './types';
import StockChart from './components/StockChart';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';

const AppContent: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [ticker, setTicker] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [isKeyMissing, setIsKeyMissing] = useState(false);

  // Verificação inicial de sanidade da chave
  useEffect(() => {
    const key = window.process?.env?.API_KEY;
    if (!key || key === 'undefined' || key.length < 10) {
      setIsKeyMissing(true);
    }
  }, []);

  const handleAnalyze = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticker.trim()) return;

    setStatus(AppStatus.LOADING);
    setError(null);

    try {
      const data = await performStockAnalysis(ticker);
      setResult(data);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha na análise quantitativa.');
      setStatus(AppStatus.ERROR);
    }
  }, [ticker]);

  if (isKeyMissing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-rose-500/30">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse"></div>
          
          <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-8 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
            <i className="fa-solid fa-triangle-exclamation text-rose-500 text-3xl"></i>
          </div>
          
          <h2 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tighter">Erro de Variável de Ambiente</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
            O terminal não conseguiu detectar a sua <span className="text-rose-400 font-bold">API KEY</span> do Gemini durante o processo de build. No Cloudflare Pages, variáveis não são lidas em tempo real sem um novo deploy.
          </p>
          
          <div className="bg-slate-950 rounded-2xl p-6 mb-8 border border-slate-800">
            <h4 className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Checklist de Solução:</h4>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white flex-none">1</span>
                <p className="text-xs text-slate-300">Vá em <b>Settings</b> > <b>Variables and Secrets</b>.</p>
              </li>
              <li className="flex gap-4">
                <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white flex-none">2</span>
                <p className="text-xs text-slate-300">Certifique-se de que o nome é <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300 font-bold">VITE_API_KEY</code> (o prefixo VITE_ é obrigatório).</p>
              </li>
              <li className="flex gap-4">
                <span className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center text-[10px] font-bold text-rose-400 flex-none ring-1 ring-rose-500/30">3</span>
                <p className="text-xs text-rose-300 font-bold">Vá na aba "Deployments" e clique em "Create new deployment" ou "Retry" no último build.</p>
              </li>
            </ul>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-white hover:bg-slate-100 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] uppercase tracking-tighter"
          >
            Verificar Novamente
          </button>
          
          <p className="mt-6 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            Documentação: <a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank" className="text-slate-500 hover:text-cyan-500 underline">Obter Chave do Gemini</a>
          </p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <i className="fa-solid fa-circle-notch animate-spin text-cyan-500 text-3xl"></i>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Autenticando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <i className="fa-solid fa-chart-line text-slate-950 text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter italic leading-none">
                QuantAI<span className="text-cyan-400">Predictor</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Dashboard Analítico</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-300 font-bold">{user.displayName || 'Analista'}</p>
              <p className="text-[10px] text-slate-500 font-mono">{user.email}</p>
            </div>
            <button 
              onClick={() => logout()}
              className="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-400 hover:border-rose-400/30 transition-all"
              title="Encerrar Sessão"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
          <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              <input 
                type="text" 
                placeholder="Digite o Ticker (AAPL, PETR4.SA, BTC...)"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all font-bold placeholder:text-slate-700"
              />
            </div>
            <button 
              type="submit"
              disabled={status === AppStatus.LOADING}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 font-black px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/20 active:scale-95"
            >
              {status === AppStatus.LOADING ? (
                <>
                  <i className="fa-solid fa-brain animate-pulse text-lg"></i>
                  PROCESSANDO...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-bolt text-lg"></i>
                  ANALISAR QUANT
                </>
              )}
            </button>
          </form>
        </div>

        {status === AppStatus.ERROR && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl flex items-start gap-4 text-rose-400 animate-in slide-in-from-top-4 duration-300">
            <i className="fa-solid fa-circle-exclamation text-xl mt-1"></i>
            <div>
              <p className="text-sm font-black uppercase tracking-tight mb-1">Erro na Operação</p>
              <p className="text-xs opacity-80 leading-relaxed font-medium">{error}</p>
            </div>
          </div>
        )}

        {result && status === AppStatus.SUCCESS && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-xl overflow-hidden relative">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight italic uppercase leading-none">{result.ticker}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">{result.companyName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-white leading-none tracking-tighter">${result.currentPrice.toFixed(2)}</p>
                    <p className={`text-xs font-black mt-2 uppercase tracking-widest ${result.percentageChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {result.percentageChange >= 0 ? 'Lucro' : 'Queda'} {Math.abs(result.percentageChange).toFixed(2)}%
                    </p>
                  </div>
                </div>
                <StockChart data={result.forecast} />
              </div>

              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
                    <i className="fa-solid fa-wand-magic-sparkles text-cyan-400 text-sm"></i>
                  </div>
                  <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Relatório Quantitativo</h3>
                </div>
                <p className="text-slate-400 leading-relaxed font-medium text-sm">
                  {result.summary}
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className={`p-8 rounded-[2.5rem] border shadow-xl relative overflow-hidden group ${
                result.sentiment === 'Bullish' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 
                result.sentiment === 'Bearish' ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' : 
                'bg-slate-800/50 border-slate-700 text-slate-400'
              }`}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Sentimento de Mercado</p>
                <div className="flex items-center justify-between">
                  <h4 className="text-3xl font-black italic uppercase tracking-tighter">{result.sentiment}</h4>
                  <i className={`fa-solid ${
                    result.sentiment === 'Bullish' ? 'fa-arrow-trend-up' : 
                    result.sentiment === 'Bearish' ? 'fa-arrow-trend-down' : 
                    'fa-minus'
                  } text-4xl opacity-20 group-hover:scale-110 transition-transform duration-500`}></i>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Confiança do Algoritmo</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all duration-1000 ease-out" 
                      style={{ width: `${result.confidenceScore}%` }}
                    />
                  </div>
                  <span className="text-white font-black text-sm">{result.confidenceScore}%</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <i className="fa-brands fa-python text-amber-400 text-lg"></i>
                  <h3 className="text-[11px] font-black text-white uppercase italic tracking-widest">Lógica Computacional</h3>
                </div>
                <pre className="bg-slate-950 rounded-2xl p-5 text-[10px] font-mono text-cyan-300 overflow-x-auto border border-slate-800 scrollbar-thin scrollbar-thumb-slate-800">
                  {result.pythonLogic}
                </pre>
              </div>

              {result.sources && result.sources.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Fontes (Grounding)</p>
                  <div className="space-y-3">
                    {result.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all group"
                      >
                        <span className="text-[11px] font-bold text-slate-400 group-hover:text-cyan-400 truncate max-w-[180px]">{source.title}</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-600 group-hover:text-cyan-500"></i>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <footer className="max-w-7xl mx-auto p-8 text-center">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.5em]">QuantAI Engine v2.5 • Powered by Gemini 3 Pro</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
