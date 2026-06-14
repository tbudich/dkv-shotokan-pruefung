import { test, expect, type Page } from '@playwright/test'

// Prev/next belt-navigation behavior, locked to the verified adjacency table in
// docs/nav-button-sweep.md. The buttons label the DESTINATION grade (title +
// belt) and are tinted in that grade's belt color. The behavior is a pure
// function of the grade you are on — independent of how you reached the page.

// Grade order as rendered (9. Kyu → 8. Dan).
const ORDER = [
  '9-kyu', '8-kyu', '7-kyu', '6-kyu', '5-kyu', '4-kyu', '3-kyu', '2-kyu', '1-kyu',
  '1-dan', '2-dan', '3-dan', '4-dan', '5-dan', '6-dan', '7-dan', '8-dan',
] as const

// id → [visible title, belt name, belt color as rendered rgb()]
const META: Record<string, [string, string, string]> = {
  '9-kyu': ['9. Kyu', 'Weißer Gürtel', 'rgb(245, 245, 245)'],
  '8-kyu': ['8. Kyu', 'Gelber Gürtel', 'rgb(250, 204, 21)'],
  '7-kyu': ['7. Kyu', 'Orangener Gürtel', 'rgb(249, 115, 22)'],
  '6-kyu': ['6. Kyu', 'Grüner Gürtel', 'rgb(22, 163, 74)'],
  '5-kyu': ['5. Kyu', 'Blauer Gürtel', 'rgb(37, 99, 235)'],
  '4-kyu': ['4. Kyu', 'Blauer Gürtel', 'rgb(37, 99, 235)'],
  '3-kyu': ['3. Kyu', 'Brauner Gürtel', 'rgb(146, 64, 14)'],
  '2-kyu': ['2. Kyu', 'Brauner Gürtel', 'rgb(146, 64, 14)'],
  '1-kyu': ['1. Kyu', 'Brauner Gürtel', 'rgb(146, 64, 14)'],
  '1-dan': ['1. Dan', 'Schwarzer Gürtel', 'rgb(31, 41, 55)'],
  '2-dan': ['2. Dan', 'Schwarzer Gürtel', 'rgb(31, 41, 55)'],
  '3-dan': ['3. Dan', 'Schwarzer Gürtel', 'rgb(31, 41, 55)'],
  '4-dan': ['4. Dan', 'Schwarzer Gürtel', 'rgb(31, 41, 55)'],
  '5-dan': ['5. Dan', 'Schwarzer Gürtel', 'rgb(31, 41, 55)'],
  '6-dan': ['6. Dan', 'Schwarzer Gürtel', 'rgb(31, 41, 55)'],
  '7-dan': ['7. Dan', 'Schwarzer Gürtel', 'rgb(31, 41, 55)'],
  '8-dan': ['8. Dan', 'Schwarzer Gürtel', 'rgb(31, 41, 55)'],
}

async function assertButton(
  page: Page,
  which: 'prev' | 'next',
  expected: string | null,
) {
  const btn = page.locator(`.gradenav-btn.${which}`)
  await expect(btn).toBeVisible()
  if (expected === null) {
    // Ends of the range: a disabled <span>, not a link, with no label/href.
    await expect(btn).not.toHaveAttribute('href', /.+/)
    await expect(btn.locator('.g-title')).toHaveCount(0)
    return
  }
  const [title, belt, color] = META[expected]
  await expect(btn).toHaveAttribute('href', `#/grade/${expected}`)
  await expect(btn.locator('.g-title')).toHaveText(title)
  await expect(btn.locator('.g-belt')).toHaveText(belt)
  await expect(btn).toHaveCSS('background-color', color)
}

test.describe('grade navigation buttons', () => {
  for (let i = 0; i < ORDER.length; i++) {
    const id = ORDER[i]
    const prevId = i > 0 ? ORDER[i - 1] : null
    const nextId = i < ORDER.length - 1 ? ORDER[i + 1] : null

    test(`${META[id][0]} → prev ${prevId ? META[prevId][0] : '∅'}, next ${
      nextId ? META[nextId][0] : '∅'
    }`, async ({ page }) => {
      await page.goto(`#/grade/${id}`)
      await expect(page.locator('.belt-head .head-title')).toHaveText(META[id][0])
      await assertButton(page, 'prev', prevId)
      await assertButton(page, 'next', nextId)
    })
  }

  // Behavior must not depend on how the page was reached: navigate via the
  // overview card, then click "next", and re-check from the landing page.
  test('behavior is independent of entry path (overview → 4. Kyu → next)', async ({
    page,
  }) => {
    await page.goto('#/')
    await page.getByText('4. Kyu', { exact: true }).first().click()
    await expect(page.locator('.belt-head .head-title')).toHaveText('4. Kyu')
    await assertButton(page, 'prev', '5-kyu')
    await assertButton(page, 'next', '3-kyu')

    await page.locator('.gradenav-btn.next').click()
    await expect(page.locator('.belt-head .head-title')).toHaveText('3. Kyu')
    await assertButton(page, 'prev', '4-kyu')
    await assertButton(page, 'next', '2-kyu')
  })
})
