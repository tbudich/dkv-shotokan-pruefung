import { test, expect } from '@playwright/test'

test.describe('tab bar + back button', () => {
  test('tabs route to overview, glossary, and settings', async ({ page }) => {
    await page.goto('#/')
    await page.getByRole('link', { name: /Glossar/ }).click()
    await expect(page).toHaveURL(/#\/glossar/)
    await expect(page.getByRole('heading', { name: /Glossar/ })).toBeVisible()

    await page.getByRole('link', { name: /Einstellung/ }).click()
    await expect(page).toHaveURL(/#\/info/)
    await expect(page.getByRole('heading', { name: /Einstellung/ })).toBeVisible()

    await page.getByRole('link', { name: /Gürtel/ }).click()
    await expect(page.locator('.grade-card').first()).toBeVisible()
  })

  test('back button on a grade returns to the overview', async ({ page }) => {
    await page.goto('#/grade/5-kyu')
    await expect(page.locator('.belt-head .head-title')).toHaveText('5. Kyu')
    await page.getByRole('button', { name: /Zur Gürtel-Übersicht/ }).click()
    await expect(page.locator('.grade-card').first()).toBeVisible()
  })
})
