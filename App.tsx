import React, { useState, useCallback, useEffect } from 'react';
import { performStockAnalysis } from './services/geminiService';
import { AnalysisResult, AppStatus } from './types';
import StockChart from './components/StockChart';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';

/**
 * QuantAI Predictor - v2.7.1
 */

const AppContent: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [ticker, setTicker] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Verificação robusta da existência da chave Gemini
  useEffect(() => {
    const checkApiKey = async () => {
      // Prioridade total para a variável de ambiente injetada
      if (process.env.API_KEY && process.env.API_KEY !== 'undefined' && process.env.API_KEY.length > 5) {
        setHasApiKey(true);
        return;
      }

      const aiStudio = (window as any).aistudio;
      if (aiStudio) {
        try {
          const selected = await aiStudio.hasSelectedApiKey();
          setHasApiKey(selected);
        } catch (e) {
          setHasApiKey(false);
        }
      } else {
        setHasApiKey(false);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      try {
        await aiStudio.openSelectKey();
        // REGRA: Assume sucesso imediatamente para destravar o UI
        setHasApiKey(true);
      } catch (e) {
        console.error("Erro ao abrir seletor:", e);
      }
    }
  };

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
      if (err.message?.includes("Requested entity was not found") || err.message?.includes("API_KEY")) {
        setHasApiKey(false);
      }
      setError(err.message || 'Falha na análise quantitativa.');
      setStatus(AppStatus.ERROR);
    }
  }, [ticker]);

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

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
            <i className="fa-solid fa-key text-amber-500 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-black text-white mb-4 italic uppercase tracking-tighter">Chave API Necessária</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Para realizar previsões com o <b>Gemini 3 Pro</b> e executar lógica <b>Python</b>, selecione uma chave API vinculada a um projeto com faturamento ativo.
          </p>
          <button 
            onClick={handleSelectKey}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3"
          >
            <i className="fa-solid fa-plug"></i>
            CONFIGURAR CHAVE API
          </button>
          <p className="mt-6 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
            Consulte a <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-cyan-500 underline">documentação de faturamento</a>
          </p>
        </div>
      </div>
    );
  }

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
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Python Enhanced Dashboard</p>
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
                placeholder="Ex: PETR4.SA, AAPL, BTC"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all font-bold placeholder:text-slate-700"
              />
            </div>
            <button 
              type="submit"
              disabled={status === AppStatus.LOADING}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 font-black px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/20"
            >
              {status === AppStatus.LOADING ? (
                <>
                  <i className="fa-solid fa-microchip animate-spin text-lg"></i>
                  EXECUTANDO PYTHON...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-bolt text-lg"></i>
                  ANALISAR AGORA
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
                <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Sentimento IA</p>
                <div className="flex items-center justify-between">
                  <h4 className="text-3xl font-black italic uppercase tracking-tighter">{result.sentiment}</h4>
                  <i className={`fa-solid ${
                    result.sentiment === 'Bullish' ? 'fa-arrow-trend-up' : 
                    result.sentiment === 'Bearish' ? 'fa-arrow-trend-down' : 
                    'fa-minus'
                  } text-4xl opacity-20 transition-transform duration-500`}></i>
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
                  <h3 className="text-[11px] font-black text-white uppercase italic tracking-widest">Lógica Python Aplicada</h3>
                </div>
                <pre className="bg-slate-950 rounded-2xl p-5 text-[10px] font-mono text-cyan-300 overflow-x-auto border border-slate-800">
                  {result.pythonLogic}
                </pre>
              </div>

              {result.sources && result.sources.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Fontes de Grounding</p>
                  <div className="space-y-3">
                    {result.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all group"
                      >
                        <span className="text-[11px] font-bold text-slate-400 group-hover:text-cyan-400 truncate max-w-[180px]">{source.title}</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-600"></i>
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
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.5em]">QuantAI Predictor v2.7.1 • Powered by Gemini 3 Pro & Python Interpreter</p>
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