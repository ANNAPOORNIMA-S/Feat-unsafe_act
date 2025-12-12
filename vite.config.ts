
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
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
    // Explicitly define process.env.API_KEY so it is replaced with the string value during build/serve
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    optimizeDeps: {
      exclude: ['@google/genai']
    },
    build: {
      rollupOptions: {
        external: ['@google/genai']
      }
    }
  };
});
