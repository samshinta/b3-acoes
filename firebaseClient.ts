
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

/**
 * QuantAI Firebase Client
 * Inicialização centralizada utilizando versões fixas v10.13.2 via esm.sh.
 */

const DEFAULT_CONFIG = {
  apiKey: "AIzaSyBlad28UJmqoynHvfT6lo8G3NFYAlf4QmI",
  authDomain: "b3-acoes.firebaseapp.com",
  projectId: "b3-acoes",
  storageBucket: "b3-acoes.firebasestorage.app",
  messagingSenderId: "293929538616",
  appId: "1:293929538616:web:e87b5bb33229b2f7fa42cd"
};

const getEnv = (key: string): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
    if ((import.meta as any).env && (import.meta as any).env[key]) return (import.meta as any).env[key];
  } catch (e) {}
  return undefined;
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || DEFAULT_CONFIG.apiKey,
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || DEFAULT_CONFIG.authDomain,
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || DEFAULT_CONFIG.projectId,
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || DEFAULT_CONFIG.storageBucket,
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || DEFAULT_CONFIG.messagingSenderId,
  appId: getEnv('VITE_FIREBASE_APP_ID') || DEFAULT_CONFIG.appId
};

export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10);

let auth: Auth | undefined;

if (isFirebaseConfigured) {
  try {
    // Inicializa o app uma única vez ou recupera o existente.
    // O erro 'Component auth has not been registered' acontece quando há conflito de versões
    // entre 'firebase/app' e 'firebase/auth'. O importmap agora garante que ambos sejam 10.13.2.
    const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    auth = getAuth(app);
    
    console.log("✅ QuantAI: Firebase Auth inicializado com sucesso.");
  } catch (error) {
    console.error("❌ QuantAI: Erro crítico na inicialização do Firebase:", error);
  }
} else {
  console.warn("⚠️ QuantAI: Modo Demo ativo. Verifique as variáveis de ambiente.");
}

export { auth };
