import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'platinum-light' 
  | 'obsidian-dark' 
  | 'royal-blue' 
  | 'emerald-luxury' 
  | 'rose-gold' 
  | 'deep-ocean' 
  | 'champagne' 
  | 'midnight-purple'
  | 'classic-light' 
  | 'classic-dark' 
  | 'ocean' 
  | 'sunset' 
  | 'forest';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { 
    name: Theme; 
    label: string; 
    description: string;
    primary: string; 
    secondary: string;
    category: 'premium' | 'classic';
  }[];
}

export const themes = [
  // Premium Themes
  { 
    name: 'platinum-light' as Theme, 
    label: 'Platinum Light', 
    description: 'Premium minimalist design with subtle purple accents',
    primary: '#6366f1', 
    secondary: '#f1f5f9',
    category: 'premium' as const
  },
  { 
    name: 'obsidian-dark' as Theme, 
    label: 'Obsidian Dark', 
    description: 'Luxurious dark theme with golden highlights',
    primary: '#fbbf24', 
    secondary: '#1f2937',
    category: 'premium' as const
  },
  { 
    name: 'royal-blue' as Theme, 
    label: 'Royal Blue', 
    description: 'Sophisticated and trustworthy corporate design',
    primary: '#3b82f6', 
    secondary: '#dbeafe',
    category: 'premium' as const
  },
  { 
    name: 'emerald-luxury' as Theme, 
    label: 'Emerald Luxury', 
    description: 'Rich green sophistication for premium brands',
    primary: '#059669', 
    secondary: '#d1fae5',
    category: 'premium' as const
  },
  { 
    name: 'rose-gold' as Theme, 
    label: 'Rosé Gold', 
    description: 'Elegant and modern with warm metallic tones',
    primary: '#e11d48', 
    secondary: '#fce7f3',
    category: 'premium' as const
  },
  { 
    name: 'deep-ocean' as Theme, 
    label: 'Deep Ocean', 
    description: 'Premium nautical theme with deep blue mysteries',
    primary: '#0891b2', 
    secondary: '#164e63',
    category: 'premium' as const
  },
  { 
    name: 'champagne' as Theme, 
    label: 'Champagne', 
    description: 'Luxurious neutral with golden celebration vibes',
    primary: '#d97706', 
    secondary: '#fef3c7',
    category: 'premium' as const
  },
  { 
    name: 'midnight-purple' as Theme, 
    label: 'Midnight Purple', 
    description: 'Rich and mysterious with magical purple depths',
    primary: '#a855f7', 
    secondary: '#581c87',
    category: 'premium' as const
  },
  
  // Classic Themes
  { 
    name: 'classic-light' as Theme, 
    label: 'Classic Light', 
    description: 'Clean and traditional light theme',
    primary: '#3b82f6', 
    secondary: '#e2e8f0',
    category: 'classic' as const
  },
  { 
    name: 'classic-dark' as Theme, 
    label: 'Classic Dark', 
    description: 'Traditional dark theme for comfort',
    primary: '#60a5fa', 
    secondary: '#1e293b',
    category: 'classic' as const
  },
  { 
    name: 'ocean' as Theme, 
    label: 'Ocean', 
    description: 'Refreshing blue ocean waves',
    primary: '#0891b2', 
    secondary: '#0e7490',
    category: 'classic' as const
  },
  { 
    name: 'sunset' as Theme, 
    label: 'Sunset', 
    description: 'Warm orange sunset glow',
    primary: '#f97316', 
    secondary: '#ea580c',
    category: 'classic' as const
  },
  { 
    name: 'forest' as Theme, 
    label: 'Forest', 
    description: 'Natural green forest serenity',
    primary: '#059669', 
    secondary: '#047857',
    category: 'classic' as const
  },
];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'platinum-light',
      themes,
      setTheme: (theme: Theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
        
        // Optional: Add smooth transition class
        document.documentElement.style.setProperty('--theme-transition', 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)');
      },
      
      // Helper methods
      getPremiumThemes: () => get().themes.filter(t => t.category === 'premium'),
      getClassicThemes: () => get().themes.filter(t => t.category === 'classic'),
      getCurrentTheme: () => get().themes.find(t => t.name === get().theme),
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
          
          // Apply smooth transitions after hydration
          setTimeout(() => {
            document.documentElement.style.setProperty('--theme-transition', 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)');
          }, 100);
        }
      },
    }
  )
);

// Theme utilities
export const getThemePreview = (theme: Theme) => {
  const themeData = themes.find(t => t.name === theme);
  return {
    primary: themeData?.primary || '#3b82f6',
    secondary: themeData?.secondary || '#e2e8f0',
    label: themeData?.label || theme,
    description: themeData?.description || '',
  };
};

export const isDarkTheme = (theme: Theme) => {
  return ['obsidian-dark', 'deep-ocean', 'midnight-purple', 'classic-dark'].includes(theme);
};

export const isPremiumTheme = (theme: Theme) => {
  return themes.find(t => t.name === theme)?.category === 'premium';
};