import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  encryptionKey: CryptoKey | null;
  setEncryptionKey: (key: CryptoKey | null) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    // Monitora auth real do Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.warn("Login com Google falhou.", error);

      // Item: Security Hardening - Disable Demo Mode in Production
      if (import.meta.env.VITE_ENABLE_DEMO_MODE !== 'true') {
          alert("Erro de autenticação. O Modo Demo está desativado neste ambiente.");
          setLoading(false);
          return;
      }

      console.log("Ativando Modo Demo (VITE_ENABLE_DEMO_MODE=true)...");

      // FALLBACK: MODO DEMONSTRAÇÃO
      const demoUser: any = {
        uid: 'demo-user-123456',
        displayName: 'Dr. Advogado Demo',
        email: 'doutor@jusartificial.demo',
        photoURL: 'https://cdn-icons-png.flaticon.com/512/4042/4042356.png', // Ícone de advogado
        emailVerified: true,
        isAnonymous: false,
        metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString()
        },
        providerData: []
      };

      setUser(demoUser);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.log("Logout mock");
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, encryptionKey, setEncryptionKey }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};