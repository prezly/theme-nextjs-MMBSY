import { expect, test } from '@playwright/test';
test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
});
