import { expect, test } from '@playwright/test';

const PAGES = [
  'overview',
  'colors',
  'typography',
  'spacing',
  'shape',
  'motion',
  'button',
  'text',
  'pill',
  'divider',
  'progress',
  'spinner',
  'selection',
  'skeleton',
  'slider',
  'toggle',
  'meter',
  'surfaces',
  'field',
  'select',
  'segmented',
  'tabs',
  'modal',
];

const THEME_LABEL = { light: 'Light', dark: 'Dark' } as const;

for (const page of PAGES) {
  for (const theme of ['light', 'dark'] as const) {
    test(`${page} (${theme})`, async ({ page: pw }) => {
      await pw.goto(`/#/${page}`);
      // theme lives in the Preferences modal
      await pw.getByRole('button', { name: 'Preferences' }).click();
      await pw.getByRole('radio', { name: THEME_LABEL[theme] }).click();
      await pw.keyboard.press('Escape');
      await pw.waitForTimeout(400); // let entrance animations settle
      await expect(pw.locator('.content')).toHaveScreenshot(`${page}-${theme}.png`, {
        animations: 'disabled',
      });
    });
  }
}
