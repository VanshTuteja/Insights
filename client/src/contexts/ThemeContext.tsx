import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'classic-light' | 'classic-dark' | 'ocean' | 'sunset' | 'forest';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { name: Theme; label: string; primary: string; secondary: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = [
  { name: 'classic-light' as Theme, label: 'Classic Light', primary: '#3b82f6', secondary: '#e2e8f0' },
  { name: 'classic-dark' as Theme, label: 'Classic Dark', primary: '#60a5fa', secondary: '#1e293b' },
  { name: 'ocean' as Theme, label: 'Ocean', primary: '#0891b2', secondary: '#0e7490' },
  { name: 'sunset' as Theme, label: 'Sunset', primary: '#f97316', secondary: '#ea580c' },
  { name: 'forest' as Theme, label: 'Forest', primary: '#059669', secondary: '#047857' },
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('classic-light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('job-finder-theme') as Theme;
    if (savedTheme && themes.find(t => t.name === savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('job-finder-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};