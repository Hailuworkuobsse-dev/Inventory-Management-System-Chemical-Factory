import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src'),
      '@components': path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src/components'),
      '@features': path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src/features'),
      '@hooks': path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src/hooks'),
      '@layouts': path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src/layouts'),
      '@lib': path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src/lib'),
      '@routes': path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src/routes'),
      '@services': path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src/services'),
      '@store': path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src/store'),
      '@styles': path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src/styles'),
      '@utils': path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src/utils'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:5000',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          utils: ['axios', 'date-fns', '@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
  },
});
