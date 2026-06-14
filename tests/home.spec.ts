import { test, expect } from '@playwright/test'

const ORDER = [
  '9-kyu', '8-kyu', '7-kyu', '6-kyu', '5-kyu', '4-kyu', '3-kyu', '2-kyu', '1-kyu',
  '1-dan', '2-dan', '3-dan', '4-dan', '5-dan', '6-dan', '7-dan', '8-dan',
] as const

const TITLE: Record<string, string> = {
  '9-kyu': '9. Kyu', '8-kyu': '8. Kyu', '7-kyu': '7. Kyu', '6-kyu': '6. Kyu',
  '5-kyu': '5. Kyu', '4-kyu': '4. Kyu', '3-kyu': '3. Kyu', '2-kyu': '2. Kyu', '1-kyu': '1. Kyu',
  '1-dan': '1. Dan', '2-dan': '2. Dan', '3-dan': '3. Dan', '4-dan': '4. Dan',
  '5-dan': '5. Dan', '6-dan': '6. Dan', '7-dan': '7. Dan', '8-dan': '8. Dan',
}

test.describe('home grade cards', () => {
  for (const id of ORDER) {
    test(`card ${TITLE[id]} opens its detail`, async ({ page }) => {
      await page.goto('#/')
      await page.locator(`a.grade-card[href="#/grade/${id}"]`).click()
      await expect(page.locator('.belt-head .head-title')).toHaveText(TITLE[id])
    })
  }

  test('search filters cards and shows the empty state', async ({ page }) => {
    await page.goto('#/')
    await page.getByPlaceholder(/Suche/).fill('zzzzzzz')
    await expect(page.getByText(/Keine Treffer/)).toBeVisible()
  })
})
