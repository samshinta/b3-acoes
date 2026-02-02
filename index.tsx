
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * ENVIRONMENT SHIM - CRITICAL
 * O SDK do Gemini exige process.env.API_KEY para funcionar.
 * Este bloco garante que o objeto 'process' exista globalmente no navegador.
 */
// @ts-ignore
window.process = window.process || { env: {} };
// @ts-ignore
window.process.env = window.process.env || {};

/**
 * CAPTURA ROBUSTA
 * O Vite substitui strings como 'import.meta.env.VITE_API_KEY' estaticamente durante o build.
 */
try {
  // @ts-ignore
  const vKey = import.meta.env.VITE_API_KEY;
  // @ts-ignore
  const aKey = import.meta.env.API_KEY;

  const finalKey = vKey || aKey;

  if (finalKey && finalKey !== 'undefined' && finalKey !== 'null' && finalKey.length > 5) {
    // @ts-ignore
    window.process.env.API_KEY = finalKey;
    console.log("QuantAI: Contexto de ambiente carregado.");
  }
} catch (e) {
  console.warn("QuantAI: Falha ao mapear import.meta.env");
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
