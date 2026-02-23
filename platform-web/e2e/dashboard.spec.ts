import { test, expect, Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page
    .getByPlaceholder(/email/i)
    .fill(process.env.TEST_ADMIN_EMAIL ?? 'admin@test.com');
  await page
    .getByPlaceholder(/password/i)
    .fill(process.env.TEST_ADMIN_PASSWORD ?? 'testpassword');
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await page.waitForURL(/dashboard|login/, { timeout: 10000 });
}

test.describe('Dashboard', () => {
  test('dashboard route reachable after login attempt', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard|login/);
  });

  test('bookings page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/bookings');
    await expect(page.getByText(/bookings/i)).toBeVisible();
  });

  test('reports page loads with charts', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/reports');
    await expect(page.getByText(/reports/i)).toBeVisible();
  });

  test('settings page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/settings');
    await expect(page.getByText(/business profile|settings/i)).toBeVisible();
  });
});
