/**
 * React Native Theme Provider
 * 
 * Provides theme context for the entire app
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemeColors, ColorTheme, ColorMode } from './colors';

interface ThemeContextType {
  theme: ColorTheme;
  mode: ColorMode;
  setTheme: (theme: ColorTheme) => void;
  setMode: (mode: ColorMode) => void;
  colors: ReturnType<typeof getThemeColors>;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@taalmeet/theme';
const MODE_STORAGE_KEY = '@taalmeet/mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ColorTheme>('green');
  const [mode, setModeState] = useState<ColorMode>('dark');

  // Load saved preferences
  React.useEffect(() => {
    AsyncStorage.multiGet([THEME_STORAGE_KEY, MODE_STORAGE_KEY]).then((values) => {
      const savedTheme = values[0][1] as ColorTheme | null;
      const savedMode = values[1][1] as ColorMode | null;
      
      if (savedTheme && (savedTheme === 'green' || savedTheme === 'purple')) {
        setThemeState(savedTheme);
      }
      if (savedMode && (savedMode === 'dark' || savedMode === 'light')) {
        setModeState(savedMode);
      }
    });
  }, []);

  const setTheme = async (newTheme: ColorTheme) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const setMode = async (newMode: ColorMode) => {
    setModeState(newMode);
    await AsyncStorage.setItem(MODE_STORAGE_KEY, newMode);
  };

  const toggleMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const themeColors = getThemeColors(theme, mode);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        setTheme,
        setMode,
        toggleMode,
        colors: themeColors,
      }}>
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

