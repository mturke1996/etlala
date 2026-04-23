import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export type AppModule = 'stats' | 'clients' | 'invoices' | 'payments' | 'debts' | 'expenses' | 'users' | 'workers' | 'balances' | 'letters';

/** آخر إعدادات قفل مُتزامنة مع القرص — تُملأ عند وصول onSnapshot ليعيد التحميل يعرض القوائم/الصلاحيات مباشرة دون انتظار الشبكة */
const APP_LOCK_CONFIG_CACHE = 'etlala-app-lock-config-v1';

const readAppLockConfigCache = () => {
  try {
    const raw = localStorage.getItem(APP_LOCK_CONFIG_CACHE);
    if (!raw) return null;
    const c = JSON.parse(raw) as {
      isLocked?: boolean;
      ownerId?: string | null;
      unlockedModules?: AppModule[];
      exemptUsers?: string[];
    };
    if (!Array.isArray(c.unlockedModules)) return null;
    return {
      isLocked: !!c.isLocked,
      ownerId: c.ownerId ?? null,
      unlockedModules: c.unlockedModules,
      exemptUsers: Array.isArray(c.exemptUsers) ? c.exemptUsers : [],
    };
  } catch {
    return null;
  }
};

const writeAppLockConfigCache = (data: {
  isLocked: boolean;
  ownerId: string | null;
  unlockedModules: AppModule[];
  exemptUsers: string[];
}) => {
  try {
    localStorage.setItem(APP_LOCK_CONFIG_CACHE, JSON.stringify(data));
  } catch {
    // ignore
  }
};

export interface AppLockState {
  pinCode: string;
  isLocked: boolean;
  isAppLockReady: boolean; // true once Firestore settings loaded
  ownerId: string | null;
  unlockedModules: AppModule[];
  unlockedUsers: string[]; // persisted per user id
  exemptUsers: string[]; // users who have full access without PIN
  
  initAppLockSync: () => () => void;
  
  setPinCode: (pin: string) => Promise<void>;
  removePinCode: () => Promise<void>;
  setUnlockedModules: (modules: AppModule[]) => Promise<void>;
  setExemptUsers: (userIds: string[]) => Promise<void>;
  unlockSession: (pin: string) => boolean;
  lockSession: () => void;
  canAccess: (module: AppModule) => boolean;
  isSessionUnlocked: () => boolean;
}

const SETTINGS_DOC = 'appLock';
const pushToFirestore = async (data: any) => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error("Failed to sync app lock to firestore", error);
  }
};

const lockSnapshot = readAppLockConfigCache();

export const useAppLockStore = create<AppLockState>()(
  persist(
    (set, get) => ({
      pinCode: '',
      isLocked: lockSnapshot?.isLocked ?? false,
      isAppLockReady: lockSnapshot != null,
      ownerId: lockSnapshot?.ownerId ?? null,
      unlockedModules: lockSnapshot?.unlockedModules ?? (['expenses', 'workers'] as AppModule[]),
      exemptUsers: lockSnapshot?.exemptUsers ?? [],
      unlockedUsers: [],

      initAppLockSync: () => {
        const docRef = doc(db, 'settings', SETTINGS_DOC);
        const unsubscribe = onSnapshot(docRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const isLocked = data.isLocked || false;
            const ownerId = data.ownerId || null;
            const unlockedModules = (data.unlockedModules || ['expenses', 'workers']) as AppModule[];
            const exemptUsers = (data.exemptUsers || []) as string[];
            set({
              pinCode: data.pinCode || '',
              isLocked,
              isAppLockReady: true,
              ownerId,
              unlockedModules,
              exemptUsers,
            });
            writeAppLockConfigCache({
              isLocked,
              ownerId,
              unlockedModules,
              exemptUsers,
            });
          } else {
            // No settings doc: no lock configured, still mark ready
            set({ isAppLockReady: true });
            writeAppLockConfigCache({
              isLocked: false,
              ownerId: null,
              unlockedModules: ['expenses', 'workers'],
              exemptUsers: [],
            });
          }
        });
        return unsubscribe;
      },

      setPinCode: async (pin) => {
        const userId = useAuthStore.getState().user?.id;
        const payload = { 
          pinCode: pin, 
          isLocked: true, 
          ownerId: userId || null 
        };
        await pushToFirestore(payload);
        if (userId) {
          set((state) => ({ unlockedUsers: Array.from(new Set([...state.unlockedUsers, userId])) }));
        }
      },
      removePinCode: async () => {
        await pushToFirestore({ pinCode: '', isLocked: false, ownerId: null, exemptUsers: [] });
        set({ unlockedUsers: [] });
      },
      setUnlockedModules: async (modules) => {
        await pushToFirestore({ unlockedModules: modules });
      },
      setExemptUsers: async (userIds) => {
        await pushToFirestore({ exemptUsers: userIds });
      },
      unlockSession: (pin) => {
        if (pin === get().pinCode) {
          const userId = useAuthStore.getState().user?.id;
          if (userId) {
            set((state) => ({ unlockedUsers: Array.from(new Set([...state.unlockedUsers, userId])) }));
          }
          return true;
        }
        return false;
      },
      lockSession: () => {
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          set((state) => ({ unlockedUsers: state.unlockedUsers.filter(id => id !== userId) }));
        }
      },
      canAccess: (module) => {
        const { isLocked, isAppLockReady, ownerId, unlockedModules, unlockedUsers, exemptUsers } = get();
        const userId = useAuthStore.getState().user?.id;
        // While app lock settings are still loading, block restricted modules to prevent flash
        if (!isAppLockReady) {
          return unlockedModules.includes(module);
        }
        if (!isLocked) return true; // everything allowed if no pin
        if (userId && userId === ownerId) return true; // Admin/Owner always has full access
        if (userId && exemptUsers.includes(userId)) return true; // Exempt users have full access
        if (userId && unlockedUsers.includes(userId)) return true; // User unlocked session
        return unlockedModules.includes(module); // otherwise only if explicitly unlocked
      },
      isSessionUnlocked: () => {
        const { isLocked, isAppLockReady, ownerId, unlockedUsers, exemptUsers } = get();
        const userId = useAuthStore.getState().user?.id;
        if (!isAppLockReady) return false; // Not ready yet, assume locked
        if (!isLocked) return true;
        if (userId && userId === ownerId) return true;
        if (userId && exemptUsers.includes(userId)) return true;
        return !!userId && unlockedUsers.includes(userId);
      }
    }),
    {
      name: 'app-lock-storage',
      partialize: (state) => ({ 
        unlockedUsers: state.unlockedUsers
      }), // ONLY persist the current device's unlocked session state
    }
  )
);
