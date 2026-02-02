
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

/**
 * O Vite substitui essas strings estaticamente durante o build.
 * Não devemos atribuir import.meta.env a uma variável antes de acessar as propriedades,
 * pois isso quebra a substituição em alguns ambientes de produção.
 */
const getEnvVar = (name: string): string | undefined => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[name];
    }
  } catch (e) {
    return undefined;
  }
  return undefined;
};

// Acesso literal para garantir substituição pelo Vite
const firebaseConfig = {
  // @ts-ignore
  apiKey: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_API_KEY : undefined,
  // @ts-ignore
  authDomain: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : undefined,
  // @ts-ignore
  projectId: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_PROJECT_ID : undefined,
  // @ts-ignore
  storageBucket: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : undefined,
  // @ts-ignore
  messagingSenderId: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID : undefined,
  // @ts-ignore
  appId: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_APP_ID : undefined
};

export const isFirebaseConfigured = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey.length > 20;

let auth: Auth | undefined;

if (isFirebaseConfigured) {
  try {
    const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
  }
}

export { auth };
