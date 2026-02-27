import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/JusArtificial/i);
});

test('main call to action buttons exist', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Check for "Acessar Plataforma" button
  await expect(page.getByRole('button', { name: /Acessar Plataforma/i })).toBeVisible();

  // Check for "Login" button
  await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
});
