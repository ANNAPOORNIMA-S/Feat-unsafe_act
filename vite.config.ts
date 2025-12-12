import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      // Directs the import to the CDN URL, bypassing node_modules resolution
      '@google/genai': 'https://esm.sh/@google/genai@^1.32.0'
    }
  },
  // Polyfill process.env to avoid runtime errors if accessed directly
  define: {
    'process.env': process.env
  },
  optimizeDeps: {
    exclude: ['@google/genai']
  },
  build: {
    rollupOptions: {
      external: ['@google/genai']
    }
  }
});