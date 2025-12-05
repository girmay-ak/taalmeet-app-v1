'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ColorTheme = 'green' | 'purple';
export type Mode = 'dark' | 'light';

interface ThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  colors: {
    primary: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    gradientFrom: string;
    gradientTo: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorThemes = {
  green: {
    primary: '#1DB954',
    primaryLight: '#1ED760',
    secondary: '#5FB3B3',
    accent: '#4FD1C5',
    gradientFrom: '#1DB954',
    gradientTo: '#1ED760',
  },
  purple: {
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    secondary: '#EC4899',
    accent: '#F472B6',
    gradientFrom: '#8B5CF6',
    gradientTo: '#EC4899',
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize with default values (SSR-safe)
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('green');
  const [mode, setModeState] = useState<Mode>('dark');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedColorTheme = localStorage.getItem('taalmeet-color-theme') as ColorTheme;
      const savedMode = localStorage.getItem('taalmeet-mode') as Mode;
      
      if (savedColorTheme) {
        setColorThemeState(savedColorTheme);
      }
      if (savedMode) {
        setModeState(savedMode);
      }
      setIsHydrated(true);
    }
  }, []);

  const setColorTheme = (newTheme: ColorTheme) => {
    setColorThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('taalmeet-color-theme', newTheme);
    }
  };

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('taalmeet-mode', newMode);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const colors = colorThemes[colorTheme];
    
    // Set color theme variables
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-light', colors.primaryLight);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--gradient-from', colors.gradientFrom);
    root.style.setProperty('--gradient-to', colors.gradientTo);
    
    // Set data attribute for mode
    root.setAttribute('data-mode', mode);
  }, [colorTheme, mode]);

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorTheme, mode, setMode, colors: colorThemes[colorTheme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}