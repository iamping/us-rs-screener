import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'development' ? '/' : '/us-rs-screener',
  server: {
    proxy: {
      // Use mock api by msw. see ./src/mocks/browser.ts
      // '/api': {
      //   target: 'https://iamping.github.io/us-rs-screener/api',
      //   changeOrigin: true,
      //   secure: false,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // },
      '/historical-api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/historical-api/, '')
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 800,
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
          if (id.includes('highcharts')) {
            return 'vendor-chart';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
