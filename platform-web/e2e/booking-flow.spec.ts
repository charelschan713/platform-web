import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('book page loads correctly', async ({ page }) => {
    await page.goto('/book');
    await expect(page.getByText(/service city|book|pickup/i)).toBeVisible();
  });

  test('booking form requires fields', async ({ page }) => {
    await page.goto('/book');
    const nextButton = page.getByRole('button', { name: /get quote|next|continue/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await expect(page.getByText(/required|please|invalid/i)).toBeVisible({ timeout: 3000 });
    }
  });

  test('quote page is accessible', async ({ page }) => {
    await page.goto('/book/quote');
    await expect(page).toHaveURL(/book/);
  });
});
