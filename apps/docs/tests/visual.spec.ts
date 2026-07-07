import { expect, test } from '@playwright/test';

const PAGES = [
  'overview',
  'colors',
  'typography',
  'spacing',
  'layout',
  'shape',
  'motion',
  'button',
  'text',
  'pill',
  'counterbadge',
  'statusdot',
  'avatar',
  'divider',
  'callout',
  'codeblock',
  'selection',
  'textarea',
  'searchfield',
  'numberinput',
  'slider',
  'toggle',
  'meter',
  'progress',
  'spinner',
  'progressring',
  'sparkline',
  'segmentedbar',
  'skeleton',
  'surfaces',
  'field',
  'select',
  'segmented',
  'tabs',
  'modal',
  'popover',
  'sidebar',
  'toolbar',
  'pageheader',
  'footer',
  'emptystate',
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
