/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Don't transpile Expo packages since we're using stubs
  transpilePackages: [],
  
  // Webpack configuration for path aliases and Expo module stubs
  webpack: (config, { isServer }) => {
    // Expo module stubs for web compatibility
    const expoStubs = {
      'expo-notifications': path.resolve(__dirname, './src/lib/stubs/expo-notifications.js'),
      'expo-constants': path.resolve(__dirname, './src/lib/stubs/expo-constants.js'),
      'expo-device': path.resolve(__dirname, './src/lib/stubs/expo-device.js'),
      'expo-modules-core': path.resolve(__dirname, './src/lib/stubs/expo-modules-core.js'),
      'expo-location': path.resolve(__dirname, './src/lib/stubs/expo-location.js'),
      'expo-file-system': path.resolve(__dirname, './src/lib/stubs/expo-file-system.js'),
      'expo-file-system/legacy': path.resolve(__dirname, './src/lib/stubs/expo-file-system.js'),
      'react-native': path.resolve(__dirname, './src/lib/stubs/react-native.js'),
    };

    // Configure module resolution - Expo stubs must come first
    // Use stubs for both client and server to avoid SSR issues
    config.resolve.alias = {
      // Expo module stubs (must come first to override node_modules)
      // These work for both client and server-side rendering
      ...expoStubs,
      // Preserve existing aliases
      ...config.resolve.alias,
      // Path aliases
      '@': path.resolve(__dirname, './src'),
      '@/services': path.resolve(__dirname, '../services'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/utils': path.resolve(__dirname, '../utils'),
      '@/types': path.resolve(__dirname, '../types'),
      '@/shared': path.resolve(__dirname, '../services'),
      '@/shared/hooks': path.resolve(__dirname, '../hooks'),
      '@/shared/types': path.resolve(__dirname, '../types'),
      '@/shared/lib': path.resolve(__dirname, '../lib'),
    };

    // Define __DEV__ global for React Native compatibility
    const webpack = require('webpack');
    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
      })
    );

    return config;
  },

  // Environment variables
  env: {
    // Vite uses import.meta.env, Next.js uses process.env
    // We'll handle this in the config files
  },
};

module.exports = nextConfig;

