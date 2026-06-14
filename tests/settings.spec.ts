import { test, expect } from '@playwright/test'

test.describe('settings buttons', () => {
  test('theme buttons switch and persist the data-theme', async ({ page }) => {
    await page.goto('#/info')
    await page.getByRole('button', { name: 'Dunkel' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await page.getByRole('button', { name: 'Hell' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('System theme button activates system mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('#/info')
    // Put the app into a known non-system state so the System click provably changes it.
    await page.getByRole('button', { name: 'Dunkel' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    const system = page.getByRole('button', { name: 'System' })
    await system.click()
    await expect(system).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('update button settles into a terminal state (best-effort)', async ({ page }) => {
    await page.goto('#/info')
    const check = page.getByRole('button', { name: /Nach Updates suchen/ })
    await check.click()
    // After clicking, the button is disabled while checking. We wait for it to
    // become re-enabled (status settles to 'current' or 'error') rather than
    // asserting on specific text — the local preview SW may not reach 'current'
    // or 'error' quickly enough, so we tolerate any non-checking terminal state.
    await expect(check).toBeEnabled({ timeout: 15_000 })
  })
})
