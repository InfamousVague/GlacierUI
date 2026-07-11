import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Library build for external consumers. The docs app and the test suites keep
// importing the raw TS source (via resolve aliases / tsconfig paths); this
// config only produces dist/ for `npm run build -w @glacier/react`.
//
// The @glacier/spec, @glacier/tokens and @glacier/motion workspace packages are
// bundled in (JS here, types via rollup.dts.config.mjs), so a consumer only
// needs @glacier/react plus the css entries. Only react, react-dom and the
// `motion` package stay external.
export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'styles',
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [/^react(\/|$)/, /^react-dom(\/|$)/, /^motion(\/|$)/],
    },
  },
});
