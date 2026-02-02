
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebaseClient';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
  signUp: (email: string, pass: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  checkVerification: () => Promise<void>;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER = {
  email: 'convidado@quantai.demo',
  emailVerified: true,
  displayName: 'Analista Convidado',
  uid: 'demo-user-123'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const loginAsGuest = () => {
    setUser(MOCK_USER);
  };

  const signUp = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      setError("Variáveis VITE_FIREBASE_* não detectadas no Cloudflare.");
      return;
    }
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }
    } catch (err: any) {
      setError(translateError(err.code));
      throw err;
    }
  };

  const signIn = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      setError("Configuração do Firebase ausente.");
      return;
    }
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setError(translateError(err.code));
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured || !auth) {
      setError("Configuração do Firebase ausente.");
      return;
    }
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(translateError(err.code));
      throw err;
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setUser(null);
  };

  const resendVerification = async () => {
    if (isFirebaseConfigured && auth?.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const checkVerification = async () => {
    if (isFirebaseConfigured && auth?.currentUser) {
      await auth.currentUser.reload();
      const refreshedUser = auth.currentUser;
      if (refreshedUser) {
        setUser({
          ...refreshedUser,
          emailVerified: refreshedUser.emailVerified
        });
      }
    }
  };

  const translateError = (code: string) => {
    switch (code) {
      case 'auth/email-already-in-use': return 'Este e-mail já está em uso.';
      case 'auth/invalid-email': return 'E-mail inválido.';
      case 'auth/weak-password': return 'Senha muito fraca (mínimo 6 caracteres).';
      case 'auth/user-not-found': return 'Nenhum usuário encontrado com este e-mail.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'E-mail ou senha incorretos.';
      case 'auth/too-many-requests': return 'Muitas tentativas. Tente mais tarde.';
      default: return 'Ocorreu um erro na autenticação.';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, error, isDemoMode: !isFirebaseConfigured,
      signUp, signIn, resetPassword, logout, resendVerification, checkVerification, loginAsGuest 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};
