import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npm run dev',
    port: 5199,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:5199',
    viewport: { width: 1280, height: 900 },
    // deterministic screenshots: freeze kit animations
    contextOptions: { reducedMotion: 'reduce' },
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.002 },
  },
});
