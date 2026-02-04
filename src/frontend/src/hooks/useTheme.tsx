import { createContext, useContext, useState, ReactNode } from 'react';

export type VisualTheme = 'aurora-glow' | 'celestial-calm' | 'sacred-lotus' | 'ethereal-waves' | 'zen-garden';

interface ThemeContextType {
  theme: VisualTheme;
  setTheme: (theme: VisualTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'frequencyverse-visual-theme';
const DEFAULT_THEME: VisualTheme = 'aurora-glow';

// Safe localStorage access with fallback
function getStoredTheme(): VisualTheme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && isValidTheme(stored)) {
      return stored as VisualTheme;
    }
  } catch (error) {
    console.warn('⚠️ [THEME] Failed to read from localStorage:', error);
  }
  return DEFAULT_THEME;
}

function isValidTheme(value: string): boolean {
  return ['aurora-glow', 'celestial-calm', 'sacred-lotus', 'ethereal-waves', 'zen-garden'].includes(value);
}

function saveTheme(theme: VisualTheme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('⚠️ [THEME] Failed to write to localStorage:', error);
  }
}

export function VisualThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<VisualTheme>(getStoredTheme);

  const setTheme = (newTheme: VisualTheme) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
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
