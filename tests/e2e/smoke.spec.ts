import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FIFA Smart Stadium/);
    await expect(page.locator('text=Smart Stadium')).toBeVisible();
  });

  test('navigation to assistant page', async ({ page }) => {
    await page.goto('/assistant');
    await expect(page.locator('text=AI Stadium Assistant')).toBeVisible();
  });

  test('navigation to crowd page', async ({ page }) => {
    await page.goto('/crowd');
    await expect(page.locator('text=Crowd Intelligence')).toBeVisible();
  });

  test('navigation to emergency page', async ({ page }) => {
    await page.goto('/emergency');
    await expect(page.locator('text=Emergency AI')).toBeVisible();
  });

  test('login page renders', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('accessibility page renders', async ({ page }) => {
    await page.goto('/accessibility');
    await expect(page.locator('text=Accessibility Settings')).toBeVisible();
  });
});
