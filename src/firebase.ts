import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCq1iN-6ms_YEa39zsx7iooAIBl1iyya-o',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mndf-toolkit-pro.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mndf-toolkit-pro',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mndf-toolkit-pro.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '151667887260',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:151667887260:web:591405417da34882a93159',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-QGYHYCFBPQ'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
