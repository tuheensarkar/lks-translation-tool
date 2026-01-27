import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    // Set up mock API endpoints for development
    cors: true,
  },
  plugins: [react()],
  define: {
    // Provide environment variables to the client
    'process.env': {}
  }
});