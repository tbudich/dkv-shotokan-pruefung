import { test, expect } from '@playwright/test'

test.describe('glossary search', () => {
  test('filters entries and shows the empty state', async ({ page }) => {
    await page.goto('#/glossar')
    await expect(page.locator('.gloss-item').first()).toBeVisible()
    await page.getByPlaceholder(/Begriff suchen/).fill('zzzzzzz')
    await expect(page.getByText(/Keine Treffer/)).toBeVisible()
  })
})
