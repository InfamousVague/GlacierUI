import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

// Bundles the public type surface into a single dist/index.d.ts.
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
