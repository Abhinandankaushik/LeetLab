import { create } from 'zustand';

const THEME_KEY = 'leetlab-theme';

export const useThemeStore = create((set, get) => ({
  theme: 'light',

  initializeTheme: () => {
    const persisted = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextTheme = persisted || (systemPrefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', nextTheme);
    set({ theme: nextTheme });
  },

  toggleTheme: () => {
    const current = get().theme;
    const nextTheme = current === 'dark' ? 'light' : 'dark';

    localStorage.setItem(THEME_KEY, nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    set({ theme: nextTheme });
  },
}));
