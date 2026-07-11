import { expect, test } from '@playwright/test';

const PAGES = [
  'overview',
  'colors',
  'typography',
  'spacing',
  'layout',
  'shape',
  'motion',
  'spec',
  'button',
  'text',
  'pill',
  'counterbadge',
  'statusdot',
  'avatar',
  'divider',
  'callout',
  'banner',
  'codeblock',
  'selection',
  'radiocard',
  'textarea',
  'searchfield',
  'numberinput',
  'slider',
  'toggle',
  'meter',
  'progress',
  'spinner',
  'progressring',
  'steps',
  'segmentedbar',
  'skeleton',
  'emptystate',
  'surfaces',
  'field',
  'select',
  'combobox',
  'multiselect',
  'segmented',
  'tabs',
  'tooltip',
  'toast',
  'modal',
  'drawer',
  'alertdialog',
  'popover',
  'sidebar',
  'toolbar',
  'titlebar',
  'navbar',
  'datagrid',
  'datepicker',
  'fileupload',
  'fieldset',
  'pageheader',
  'section',
  'cardgroup',
  'timeline',
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
