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
      '@glacier/native': fileURLToPath(new URL('../../packages/native/src/index.ts', import.meta.url)),
      '@glacier/commons': fileURLToPath(new URL('../../packages/commons/src/index.ts', import.meta.url)),
      // the native kit imports from 'react-native'; on the web docs that resolves
      // to react-native-web so View/Text/Pressable render to the DOM, which is
      // what powers the Web/Native comparison toggle on each component page.
      'react-native': 'react-native-web',
    },
    // react-native-web ships platform-specific files; prefer .web.* so the web
    // build never pulls a native-only module.
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.jsx', '.web.js', '.jsx', '.js', '.json'],
  },
  optimizeDeps: {
    // Vite's dep pre-bundler (esbuild) does not honor resolve.extensions, so on
    // its own it follows react-native-svg's non-web build, whose Fabric files
    // import `react-native/Libraries/.../codegenNativeComponent` — a subpath the
    // `react-native` -> `react-native-web` alias rewrites to a file that does not
    // exist. Teaching esbuild to prefer `.web.*` makes it resolve the clean web
    // build (ReactNativeSVG.web.js -> elements.web.js), which never touches Fabric.
    esbuildOptions: {
      resolveExtensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json', '.mjs'],
    },
  },
  server: {
    port: 5199,
    // Bind every interface so the dev server is reachable from other devices on
    // the LAN (a phone on the same Wi-Fi), which is how on-device haptics get
    // tested. Vite prints the Network URL on start; open it on the phone.
    host: true,
  },
});
