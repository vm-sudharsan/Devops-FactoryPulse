import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Port is read from VITE_PORT env var at dev-server startup time.
    // This is a Vite server option — it is NOT baked into the build bundle.
    // Default: 3001
    port: parseInt(process.env.VITE_PORT || '3001'),
    open: true,
  },
});
