/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Green Theme (Primary Brand from old project)
        primary: {
          DEFAULT: '#1DB954',
          light: '#1ED760',
          dark: '#1AA34A',
          darker: '#158A3D',
          darkest: '#107031',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#1DB954', // Main brand color
          600: '#1AA34A',
          700: '#158A3D',
          800: '#107031',
          900: '#14532d',
        },
        // Purple Theme (Alternative)
        secondary: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
          darker: '#6D28D9',
          darkest: '#5B21B6',
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#8B5CF6', // Alternative theme color
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4c1d95',
        },
        // Accent Colors
        accent: {
          green: '#4FD1C5',
          purple: '#F472B6',
          blue: '#5FB3B3',
        },
        // Semantic Colors
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        // Status Colors
        status: {
          online: '#10B981',
          away: '#F59E0B',
          busy: '#EF4444',
          offline: '#6B7280',
        },
      },
    },
  },
  plugins: [],
};

