import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Buffer polyfill for @react-pdf/renderer in browser
      buffer: 'buffer',
    },
  },
  define: {
    // Make process available (needed by some PDF internals)
    'process.env': {},
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  server: {
    port: 3000,
  },
});
