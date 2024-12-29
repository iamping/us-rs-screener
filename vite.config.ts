import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/us-rs-screener',
  server: {
    proxy: {
      '/api': {
        target: 'https://iamping.github.io/us-rs-screener/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/historical-api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/historical-api/, '')
      }
    }
  },
  build: {
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
      output: {
        manualChunks: function manualChunks(id) {
          if (
            id.includes('@chakra-ui/react') ||
            id.includes('react-icons') ||
            id.includes('@emotion/react') ||
            id.includes('@tanstack/react-table')
          ) {
            return 'vendor-ui';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
