import { create } from 'zustand';
import type { ThemeMode } from '../theme';

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  // Check local storage or system preference
  const savedTheme = localStorage.getItem('theme-mode') as ThemeMode;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  
  return {
    mode: savedTheme || systemTheme, // Default to system preference if no saved theme
    
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
