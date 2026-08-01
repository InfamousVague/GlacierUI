import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

// Bundles the public type surface into a single dist/index.d.ts.
//
// HEAP. This step is the memory hog of the repo: it holds the whole inlined type
// graph at once and peaks somewhere between 16 and 20 GB, so `npm run build`
// passes --max-old-space-size=20480. At the old 16384 the bundler died with
// "Reached heap limit" and the package built its JS and CSS but silently
// shipped no index.d.ts - keep the ceiling ahead of the type surface.
// The @glacier/spec, @glacier/tokens and @glacier/motion workspace types are
// inlined (matching the JS bundle produced by vite.config.ts). Runtime
// dependencies stay external type imports: react, react-dom, motion, and the
// date stack (react-day-picker, date-fns) - inlining date-fns' enormous type
// surface OOMs the dts bundler, and consumers install these as dependencies.
export default {
  input: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
  output: {
    file: fileURLToPath(new URL('./dist/index.d.ts', import.meta.url)),
    format: 'es',
  },
  external: [/^react(\/|$)/, /^react-dom(\/|$)/, /^motion(\/|$)/, /^react-day-picker(\/|$)/, /^date-fns(\/|$)/],
  plugins: [
    dts({
      tsconfig: fileURLToPath(new URL('./tsconfig.build.json', import.meta.url)),
      respectExternal: true,
    }),
  ],
};
