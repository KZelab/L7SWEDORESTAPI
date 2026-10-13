import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function scan(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return results.violations;
}

test('the page has no detectable accessibility violations', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Title').fill('Accessibility check');
  await page.getByRole('button', { name: 'Add note' }).click();
  await expect(
    page.getByRole('heading', { name: 'Accessibility check' }).first(),
  ).toBeVisible();

  expect(await scan(page)).toEqual([]);
});

test('the validation error state has no detectable violations', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add note' }).click();
  await expect(page.getByRole('alert')).toBeVisible();

  expect(await scan(page)).toEqual([]);
});
