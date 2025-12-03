/**
 * TaalMeet Color System
 * 
 * Based on Figma design specifications
 * Supports both Green and Purple themes with Dark/Light modes
 */

export const colors = {
  // Green Theme (Primary Brand)
  green: {
    primary: '#1DB954',
    primaryLight: '#1ED760',
    secondary: '#5FB3B3',
    accent: '#4FD1C5',
    dark: '#1AA34A',
    darker: '#158A3D',
    darkest: '#107031',
  },
  
  // Purple Theme (Alternative)
  purple: {
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    secondary: '#EC4899',
    accent: '#F472B6',
    dark: '#7C3AED',
    darker: '#6D28D9',
    darkest: '#5B21B6',
  },
  
  // Dark Mode
  dark: {
    background: {
      primary: '#0F0F0F',
      secondary: '#1A1A1A',
      tertiary: '#222222',
      hover: '#2A2A2A',
    },
    border: {
      default: '#2A2A2A',
      light: '#3A3A3A',
      focus: '#4A4A4A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E5E5E5',
      muted: '#9CA3AF',
      dark: '#6B7280',
    },
  },
  
  // Light Mode
  light: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
      hover: '#E5E7EB',
    },
    border: {
      default: '#E5E7EB',
      dark: '#D1D5DB',
      focus: '#9CA3AF',
    },
    text: {
      primary: '#111827',
      secondary: '#374151',
      muted: '#6B7280',
      dark: '#9CA3AF',
    },
  },
  
  // Semantic Colors
  semantic: {
    success: '#10B981',
    successLight: '#34D399',
    successDark: '#059669',
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    warningDark: '#D97706',
    error: '#EF4444',
    errorLight: '#F87171',
    errorDark: '#DC2626',
    info: '#3B82F6',
    infoLight: '#60A5FA',
    infoDark: '#2563EB',
  },
  
  // Status Colors
  status: {
    online: '#10B981',
    away: '#F59E0B',
    busy: '#EF4444',
    offline: '#6B7280',
  },
};

export type ColorTheme = 'green' | 'purple';
export type ColorMode = 'dark' | 'light';

/**
 * Get theme colors based on theme and mode
 */
export function getThemeColors(theme: ColorTheme = 'green', mode: ColorMode = 'dark') {
  const themeColors = colors[theme];
  const modeColors = colors[mode];
  
  return {
    ...themeColors,
    ...modeColors,
    semantic: colors.semantic,
    status: colors.status,
    mode,
    theme,
  };
}

