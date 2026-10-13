import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

// Every test shares one running server, so each one uses a title nobody
// else will create.
function unique(label: string): string {
  return `${label} ${randomUUID().slice(0, 8)}`;
}

async function addNote(page: Page, title: string, body = '') {
  await page.getByLabel('Title').fill(title);
  await page.getByLabel('Body').fill(body);
  await page.getByRole('button', { name: 'Add note' }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('a user can create a note', async ({ page }) => {
  const title = unique('Shopping');

  await addNote(page, title, 'Milk and bread');

  await expect(page.getByText('Milk and bread').first()).toBeVisible();
  await expect(page.getByLabel('Title')).toHaveValue('');
});

test('a note is still there after the page is reloaded', async ({ page }) => {
  const title = unique('Reload');
  await addNote(page, title);

  await page.reload();

  await expect(page.getByRole('heading', { name: title })).toBeVisible();
});

test('a user can edit a note', async ({ page }) => {
  const title = unique('Draft');
  const newTitle = unique('Final');
  await addNote(page, title);

  await page.getByRole('button', { name: `Edit ${title}` }).click();
  await page.getByLabel('Title').fill(newTitle);
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.getByRole('heading', { name: newTitle })).toBeVisible();
  await expect(page.getByRole('heading', { name: title })).toHaveCount(0);
});

test('a user can delete a note', async ({ page }) => {
  const title = unique('Temporary');
  await addNote(page, title);

  await page.getByRole('button', { name: `Delete ${title}` }).click();

  await expect(page.getByRole('heading', { name: title })).toHaveCount(0);
});

test('a note without a title is refused', async ({ page }) => {
  await page.getByRole('button', { name: 'Add note' }).click();

  await expect(page.getByRole('alert')).toHaveText('Title is required');
});
