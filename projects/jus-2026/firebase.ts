import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Substitua com suas credenciais do Firebase Console
// Em produção, use variáveis de ambiente (import.meta.env.VITE_...)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "SUA_API_KEY_AQUI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "seu-projeto.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "seu-projeto",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "seu-projeto.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Item 16: Offline Persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Persistence failed: Multiple tabs open.');
    } else if (err.code == 'unimplemented') {
        console.warn('Persistence not supported by browser.');
    }
});
