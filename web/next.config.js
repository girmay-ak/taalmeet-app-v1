/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Webpack configuration for path aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
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
    return config;
  },

  // Environment variables
  env: {
    // Vite uses import.meta.env, Next.js uses process.env
    // We'll handle this in the config files
  },
};

module.exports = nextConfig;

