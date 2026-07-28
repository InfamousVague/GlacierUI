import { expect, test } from '@playwright/test';

test('theme previews apply and persist a coordinated preset', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Preferences' }).click();

  const themes = page.getByRole('radiogroup', { name: 'Theme' });
  await expect(themes.getByRole('radio')).toHaveCount(6);
  await expect(themes.locator('[data-theme-preview]')).toHaveCount(6);
  await expect(themes.getByRole('radio').evaluateAll((radios) => radios.map((radio) => (radio as HTMLInputElement).value))).resolves.toEqual([
    'system',
    'light',
    'dark',
    'dawn',
    'boreal',
    'ember',
  ]);
  await expect(themes.locator('[data-theme-preview="system"]')).toHaveAttribute('data-split', 'true');
  await expect(themes.locator('[data-theme-preview="system"] [data-theme-preview-layer]')).toHaveCount(2);

  for (const name of ['Automatic', 'Alpine', 'Dawn', 'Midnight', 'Boreal', 'Ember']) {
    await expect(themes.getByRole('radio', { name })).toBeVisible();
  }

  await themes.getByText('Boreal', { exact: true }).click();
  await expect(themes.getByRole('radio', { name: 'Boreal' })).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme-preset', 'boreal');
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'green');

  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('glacier-docs-preferences') ?? '{}').theme))
    .toBe('boreal');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme-preset', 'boreal');
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'green');

  await page.getByRole('button', { name: 'Preferences' }).click();
  await expect(page.getByRole('radio', { name: 'Boreal' })).toBeChecked();
});