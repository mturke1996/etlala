import { create } from 'zustand';
import type { ThemeMode } from '../theme';

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const raw = localStorage.getItem('theme-mode');
  const savedTheme = raw === 'light' || raw === 'dark' ? raw : null;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  return {
    mode: savedTheme ?? systemTheme,
    
    toggleTheme: () =>
      set((state) => {
        const newMode = state.mode === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme-mode', newMode);
        return { mode: newMode };
      }),
      
    setTheme: (mode: ThemeMode) => {
      localStorage.setItem('theme-mode', mode);
      set({ mode });
    },
  };
});
