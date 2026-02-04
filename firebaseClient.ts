
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

/**
 * Utilitário para buscar variáveis de ambiente de forma robusta.
 * Tenta import.meta.env (Vite) e process.env (Node/Cloudflare)
 */
const getEnv = (key: string): string | undefined => {
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv[key]) return metaEnv[key];
  if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  return undefined;
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

// Log de depuração (apenas se a API Key estiver faltando)
if (!firebaseConfig.apiKey) {
  console.group("DEBUG: Firebase Configuration Missing");
  console.warn("Verifique se as seguintes variáveis foram configuradas no painel do Cloudflare:");
  Object.keys(firebaseConfig).forEach(key => {
    const envKey = `VITE_FIREBASE_${key.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase()}`;
    const value = (firebaseConfig as any)[key];
    console.log(`${envKey}: ${value ? '✅ OK' : '❌ AUSENTE'}`);
  });
  console.groupEnd();
}

// Verifica se a configuração mínima existe (API Key)
export const isFirebaseConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10;

let auth: Auth | undefined;

if (isFirebaseConfigured) {
  try {
    const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (error) {
    console.error("Falha ao inicializar Firebase:", error);
  }
}

export { auth };
