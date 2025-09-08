import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'classic-light' | 'classic-dark' | 'ocean' | 'sunset' | 'forest';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { name: Theme; label: string; primary: string; secondary: string }[];
}

export const themes = [
  { name: 'classic-light' as Theme, label: 'Classic Light', primary: '#3b82f6', secondary: '#e2e8f0' },
  { name: 'classic-dark' as Theme, label: 'Classic Dark', primary: '#60a5fa', secondary: '#1e293b' },
  { name: 'ocean' as Theme, label: 'Ocean', primary: '#0891b2', secondary: '#0e7490' },
  { name: 'sunset' as Theme, label: 'Sunset', primary: '#f97316', secondary: '#ea580c' },
  { name: 'forest' as Theme, label: 'Forest', primary: '#059669', secondary: '#047857' },
];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'classic-light',
      themes,
      setTheme: (theme: Theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);