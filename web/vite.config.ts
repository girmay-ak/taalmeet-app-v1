
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: [
        // Source directory
        { find: '@', replacement: path.resolve(__dirname, './src') },
        // Shared code from parent directory - must be more specific
        { find: /^@\/shared\/(.*)$/, replacement: path.resolve(__dirname, '../$1') },
        // Map @/lib to web's lib for supabase (shared services will use web's supabase)
        { find: /^@\/lib\/(.*)$/, replacement: path.resolve(__dirname, './src/lib/$1') },
        { find: /^@\/lib$/, replacement: path.resolve(__dirname, './src/lib') },
        // Map @/utils and @/types to parent for shared services
        { find: /^@\/utils\/(.*)$/, replacement: path.resolve(__dirname, '../utils/$1') },
        { find: /^@\/utils$/, replacement: path.resolve(__dirname, '../utils') },
        { find: /^@\/types\/(.*)$/, replacement: path.resolve(__dirname, '../types/$1') },
        { find: /^@\/types$/, replacement: path.resolve(__dirname, '../types') },
      ],
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