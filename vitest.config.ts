import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
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
          name: 'react',
          environment: 'jsdom',
          include: ['packages/react/test/**/*.test.tsx'],
          setupFiles: ['./packages/react/test/setup.ts'],
        },
      },
    ],
  },
});
