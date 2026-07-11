import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` is `/` for local dev. GitHub Pages serves a project repo from a
// subpath (e.g. https://<user>.github.io/GlacierUI/), so the deploy workflow
// sets BASE_PATH to `/GlacierUI/` for the production build.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      // @glacier/react's package exports point at dist/ for external
      // consumers; the docs app keeps importing the raw TS source so dev,
      // HMR and the docs build never depend on a stale library build.
      '@glacier/react': fileURLToPath(new URL('../../packages/react/src/index.ts', import.meta.url)),
    },
  },
  server: {
    port: 5199,
  },
});
