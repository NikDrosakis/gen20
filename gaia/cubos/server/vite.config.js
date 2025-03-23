import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Αν χρησιμοποιείς React
import vue from '@vitejs/plugin-vue'; // Αν χρησιμοποιείς Vue

export default defineConfig({
  plugins: [react()], // Αν React
  // plugins: [vue()], // Αν Vue
  server: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  preview: {
    allowedHosts: ['vivalibro.com', '0.0.0.0']
  }
});
