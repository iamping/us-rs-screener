import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: '/us-rs-screener',
  server: {
    proxy: {
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
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
