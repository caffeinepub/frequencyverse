import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type VisualTheme = 'aurora-glow' | 'celestial-calm' | 'sacred-lotus' | 'ethereal-waves' | 'zen-garden';

interface ThemeContextType {
  theme: VisualTheme;
  setTheme: (theme: VisualTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'frequencyverse-visual-theme';

export function VisualThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<VisualTheme>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored as VisualTheme) || 'aurora-glow';
  });

  const setTheme = (newTheme: VisualTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useVisualTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useVisualTheme must be used within a VisualThemeProvider');
  }
  return context;
}
