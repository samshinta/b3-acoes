
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

/**
 * Recuperação robusta de variáveis de ambiente.
 * Verifica process.env (padrão da plataforma para segredos) e import.meta.env (padrão Vite).
 */
const getSafeEnv = (key: string): string | undefined => {
  // 1. Tenta process.env (comum em ambientes de CI/CD e shims de nuvem)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  // 2. Tenta import.meta.env (padrão do bundler Vite para substituição estática)
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[key]) {
      return metaEnv[key];
    }
  } catch (e) {}

  // 3. Tenta via window.process (alguns ambientes injetam aqui)
  try {
    const winProcess = (window as any).process;
    if (winProcess && winProcess.env && winProcess.env[key]) {
      return winProcess.env[key];
    }
  } catch (e) {}

  return undefined;
};

const firebaseConfig = {
  apiKey: getSafeEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getSafeEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getSafeEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getSafeEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getSafeEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getSafeEnv('VITE_FIREBASE_APP_ID')
};

// Log de diagnóstico no console para ajudar o usuário a identificar o que está faltando
if (!firebaseConfig.apiKey) {
  console.group("🛠 QuantAI Debug: Configuração Firebase");
  console.error("ERRO CRÍTICO: VITE_FIREBASE_API_KEY não localizada.");
  console.info("DICA: Certifique-se de que as chaves no Cloudflare começam com 'VITE_'.");
  
  if (typeof process !== 'undefined' && process.env) {
    const keysFound = Object.keys(process.env).filter(k => k.startsWith('VITE_'));
    console.log("Variáveis VITE_* encontradas no process.env:", keysFound.length > 0 ? keysFound : "Nenhuma");
  } else {
    console.log("process.env não está disponível neste contexto.");
  }
  console.groupEnd();
}

// Verifica se a configuração mínima necessária para o Auth existe
export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10);

let auth: Auth | undefined;

if (isFirebaseConfigured) {
  try {
    // Inicializa apenas se não houver apps ativos para evitar erro de re-inicialização
    const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    console.log("✅ QuantAI: Firebase inicializado com sucesso.");
  } catch (error) {
    console.error("❌ QuantAI: Falha ao inicializar Firebase:", error);
  }
} else {
  console.warn("⚠️ QuantAI: Operando em modo limitado. Verifique as chaves de ambiente no Cloudflare.");
}

export { auth };
