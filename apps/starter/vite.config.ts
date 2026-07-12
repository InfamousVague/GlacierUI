import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In the monorepo the app imports the kit's raw TS source (the same alias the
// docs and permafrost apps use) so dev and HMR never wait on a library build.
// The scaffolded standalone copy drops this alias and resolves @glacier/react
// from its vendored dist instead; see create-glacier-app.
export default defineConfig({
  // Relative base so the built app also works when Tauri serves it from a file
  // path or a custom protocol rather than the server root.
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@glacier/react': fileURLToPath(new URL('../../packages/react/src/index.ts', import.meta.url)),
    },
  },
  server: {
    port: 5240,
    // Tauri picks a fixed port and expects a strict, non-shifting dev server.
    strictPort: true,
  },
  // Quieter output and a smaller footprint under Tauri, which ships its own
  // minifier-free debug builds during development.
  clearScreen: false,
});
