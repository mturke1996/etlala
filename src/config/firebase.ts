import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
