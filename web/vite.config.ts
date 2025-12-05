
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
        '@/shared': path.resolve(__dirname, '..'),
        // Map @/lib to web's lib for supabase (shared services will use web's supabase)
        '@/lib': path.resolve(__dirname, './src/lib'),
        // Map @/utils and @/types to parent for shared services
        '@/utils': path.resolve(__dirname, '../utils'),
        '@/types': path.resolve(__dirname, '../types'),
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