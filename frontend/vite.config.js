import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
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
    port: 3212,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3211',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:3211',
        ws: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    server: { deps: { inline: ['msw'] } },
    // give jsdom an absolute base URL so relative fetches (/api/v1/...) work
    environmentOptions: { jsdom: { url: 'http://localhost:3212/' } },
    setupFiles: ['./src/test/setup.js'],
    css: false,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/utils/**',
        'src/store/slices/**',
        'src/hooks/useOfflineMutation.js',
        'src/lib/authRefresh.js',
      ],
      thresholds: {
        // exit criteria: >=70% coverage on auth/offline/permission logic
        'src/utils/permissions.js': { lines: 70 },
        'src/store/slices/offlineQueueSlice.js': { lines: 70 },
        'src/store/slices/authSlice.js': { lines: 70 },
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
          utils: ['date-fns', '@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
  },
});
