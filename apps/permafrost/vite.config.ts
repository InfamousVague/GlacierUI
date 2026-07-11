import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Import the kit's raw TS source (same trick as the docs app) so dev and
      // HMR never depend on a stale library build.
      '@glacier/react': fileURLToPath(new URL('../../packages/react/src/index.ts', import.meta.url)),
    },
  },
  server: {
    port: 5230,
  },
});
