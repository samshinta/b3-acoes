
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

/**
 * QuantAI Firebase Client - Fix Version Registry
 */

const getEnv = (key: string): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
    if ((import.meta as any).env && (import.meta as any).env[key]) return (import.meta as any).env[key];
  } catch (e) {}
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

export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5);

let auth: Auth | undefined;

if (isFirebaseConfigured) {
  try {
    // Garante que o app seja inicializado antes do Auth
    const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Com o importmap corrigido (v10.13.2 fixo), getAuth registrará o componente sem erros
    auth = getAuth(app);
    console.log("✅ QuantAI: Firebase Auth registrado com sucesso.");
  } catch (error) {
    console.error("❌ QuantAI: Erro na inicialização do Firebase:", error);
  }
}

export { auth };
