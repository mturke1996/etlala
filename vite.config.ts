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

  // ─── Build Optimizations ──────────────────────────────────
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,

    // Target modern browsers for smaller output
    target: 'es2020',

    // Minification
    minify: 'esbuild',

    // Smart chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // React core - rarely changes
          'vendor-react': ['react', 'react-dom'],

          // Router - separate chunk
          'vendor-router': ['react-router-dom'],

          // MUI core - large but stable
          'vendor-mui': ['@mui/material', '@mui/icons-material'],

          // Firebase - large, separate cache
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],

          // State management & data
          'vendor-state': ['zustand', '@tanstack/react-query', 'react-hook-form', 'zod', '@hookform/resolvers'],

          // Charts & utilities
          'vendor-utils': ['recharts', 'dayjs', 'framer-motion', 'xlsx'],
        },
      },
    },

    // CSS code splitting
    cssCodeSplit: true,

    // Source maps only in dev
    sourcemap: false,
  },
});
