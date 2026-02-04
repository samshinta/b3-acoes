
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Environment variables are accessed via process.env in this environment to resolve TypeScript ImportMeta errors
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Verifica se a configuração mínima existe (API Key)
export const isFirebaseConfigured = !!firebaseConfig.apiKey && (firebaseConfig.apiKey as string).length > 10;

let auth: Auth | undefined;

if (isFirebaseConfigured) {
  try {
    const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (error) {
    console.error("Falha ao inicializar Firebase:", error);
  }
} else {
  console.warn("Firebase não configurado. As variáveis VITE_FIREBASE_* não foram detectadas.");
}

export { auth };
