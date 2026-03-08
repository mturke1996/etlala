import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

// Firebase configuration - Etlala
export const firebaseConfig = {
  apiKey: "AIzaSyAu21I6fAD1dz0_jFbVhopNMuU5YI8_XSM",
  authDomain: "etlala-a9ace.firebaseapp.com",
  projectId: "etlala-a9ace",
  storageBucket: "etlala-a9ace.firebasestorage.app",
  messagingSenderId: "256742530346",
  appId: "1:256742530346:web:8a3e072dc59574db08d253",
  measurementId: "G-GX640WWET9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with persistent local cache
// This caches Firestore data locally for faster loads and offline support
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export default app;
