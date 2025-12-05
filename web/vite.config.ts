
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        // Source directory
        '@': path.resolve(__dirname, './src'),
        // Shared code from parent directory
        '@/shared/services': path.resolve(__dirname, '../services'),
        '@/shared/hooks': path.resolve(__dirname, '../hooks'),
        '@/shared/types': path.resolve(__dirname, '../types'),
        '@/shared/lib': path.resolve(__dirname, '../lib'),
        '@/shared/utils': path.resolve(__dirname, '../utils'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  });