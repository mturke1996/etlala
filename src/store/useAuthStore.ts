import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'مستخدم النظام', // الافتراضي
            photoURL: firebaseUser.photoURL || undefined,
          };

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          let errorMessage = 'فشل تسجيل الدخول';
          if (error.code === 'auth/invalid-credential') {
            errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
          } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'محاولات كثيرة خاطئة. يرجى المحاولة لاحقاً';
          }
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await firebaseSignOut(auth);
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          set({ error: 'فشل تسجيل الخروج', isLoading: false });
        }
      },

      checkAuth: () => {
        set({ isLoading: true });
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'مستخدم النظام',
              photoURL: firebaseUser.photoURL || undefined,
            };
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        });
        return unsubscribe;
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
