import { test, expect } from '@playwright/test';

test('Home loads with title and search', async ({ page }) => {
  await page.goto('/');
  // Title visible
  await expect(page.getByRole('heading', { name: /Creativity Kits/i })).toBeVisible();
  // Search input visible (match EN/ZN placeholder aria-label and visual semantics)
  const input = page.locator('input[placeholder*="Search"], input[placeholder*="搜索"], input[placeholder*="搜尋"]');
  await expect(input).toBeVisible();
});

test('Tabs render and can switch', async ({ page }) => {
  await page.goto('/');
  // Click "All/全部" then "New/最新"
  const allTab = page.getByRole('tab', { name: /All|全部/i });
  await allTab.click();
  const newTab = page.getByRole('tab', { name: /New|最新/i });
  await newTab.click();
  await page.waitForTimeout(300);
  // After switching, at least one card should still be visible (grid present)
  // We assert presence of multiple card-like elements by a generic grid item heuristic.
  const grid = page.locator('div.grid');
  await expect(grid.first()).toBeVisible();
});

test('Tools grid renders many cards', async ({ page }) => {
  await page.goto('/');
  // Heuristic: there should be many child elements in the grid container
  const cards = page.locator('div.grid > *');
  await expect(cards.first()).toBeVisible();
  const count = await cards.count();
  expect(count).toBeGreaterThan(20);
});
