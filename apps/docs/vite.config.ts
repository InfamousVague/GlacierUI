import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` is `/` for local dev. GitHub Pages serves a project repo from a
// subpath (e.g. https://<user>.github.io/GlacierUI/), so the deploy workflow
// sets BASE_PATH to `/GlacierUI/` for the production build.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  server: {
    port: 5199,
  },
});
