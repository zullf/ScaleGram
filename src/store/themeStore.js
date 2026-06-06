import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  themeMode: 'light',
  setThemeMode: (themeMode) => set({ themeMode }),
  toggleThemeMode: () =>
    set((state) => ({
      themeMode: state.themeMode === 'light' ? 'dark' : 'light',
    })),
}));
