import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      // Single origin: the browser only ever talks to port 3000.
      '/api': {
        target: 'http://api:4000',
        changeOrigin: true,
      },
      // Images uploaded from the admin panel are served by the API.
      '/uploads': {
        target: 'http://api:4000',
        changeOrigin: true,
      },
    },
  },
});
