import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: [
        'packages/react/src/**',
        'packages/tokens/src/**',
        'packages/spec/src/**',
      ],
      exclude: [
        '**/*.module.css',
        '**/*.d.ts',
        'apps/docs/**',
        // Build entry points: they write css/json/dist artifacts as a side
        // effect of being imported, so running them under the test runner
        // would regenerate files in the working tree.
        '**/generate.ts',
      ],
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      // Ratchet floor. Typical runs measure ~97.5 / ~80 / ~89 / ~97.5, but the
      // v8 provider intermittently drops one worker's data under heavy CPU
      // contention (worst observed full run: 92.74 / 76.54 / 77.99 / 92.74),
      // so the floor sits at the worst observed run, rounded down. Raise these
      // as coverage grows; never lower them.
      thresholds: {
        statements: 92,
        branches: 76,
        functions: 77,
        lines: 92,
      },
    },
    projects: [
      {
        test: {
          name: 'tokens',
          environment: 'node',
          include: ['packages/tokens/test/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'spec',
          environment: 'node',
          include: ['packages/spec/test/**/*.test.ts'],
        },
      },
      {
        resolve: {
          alias: {
            // @glacier/react's package exports point at dist/ for external
            // consumers; the test suites keep exercising the raw TS source.
            '@glacier/react': fileURLToPath(new URL('./packages/react/src/index.ts', import.meta.url)),
          },
        },
        test: {
          name: 'react',
          environment: 'jsdom',
          include: ['packages/react/test/**/*.test.tsx'],
          setupFiles: ['./packages/react/test/setup.ts'],
        },
      },
    ],
  },
});
