import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

// Bundles the public type surface into a single dist/index.d.ts.
// The @glacier/spec, @glacier/tokens and @glacier/motion workspace types are
// inlined (matching the JS bundle produced by vite.config.ts); only react,
// react-dom and the `motion` package remain external type imports.
export default {
  input: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
  output: {
    file: fileURLToPath(new URL('./dist/index.d.ts', import.meta.url)),
    format: 'es',
  },
  external: [/^react(\/|$)/, /^react-dom(\/|$)/, /^motion(\/|$)/],
  plugins: [
    dts({
      tsconfig: fileURLToPath(new URL('./tsconfig.build.json', import.meta.url)),
      respectExternal: true,
    }),
  ],
};
