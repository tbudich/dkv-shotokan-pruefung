import { test, expect } from '@playwright/test'

const EXPECTED_COMMIT = process.env.EXPECTED_COMMIT

test.describe('deployment', () => {
  test('serves version.json for the expected build', async ({ request }) => {
    if (EXPECTED_COMMIT) {
      // Ride out Pages/CDN propagation: poll until the live commit matches.
      await expect
        .poll(
          async () => {
            const res = await request.get('version.json')
            if (!res.ok()) return null
            return (await res.json()).commit
          },
          { timeout: 90_000, intervals: [2_000, 5_000, 10_000] },
        )
        .toBe(EXPECTED_COMMIT)
    } else {
      const res = await request.get('version.json')
      expect(res.ok()).toBeTruthy()
      const json = await res.json()
      expect(json.commit).toMatch(/^[0-9a-f]{40}$/)
      expect(typeof json.version).toBe('string')
      expect(json.version.length).toBeGreaterThan(0)
    }
  })

  test('home page renders grades', async ({ page }) => {
    await page.goto('#/')
    await expect(page.locator('.grade-card').first()).toBeVisible()
    await expect(page.getByText('9. Kyu').first()).toBeVisible()
  })

  test('Einstellung surfaces the app version', async ({ page, request }) => {
    const json = await (await request.get('version.json')).json()
    await page.goto('#/info')
    const versionLine = page.locator('.app-version')
    await expect(versionLine).toBeVisible()
    await expect(versionLine).toContainText('Version')
    await expect(versionLine).toContainText(String(json.version))
  })

  test('PWA assets are served', async ({ request }) => {
    const manifest = await request.get('manifest.webmanifest')
    expect(manifest.status()).toBe(200)
    const m = await manifest.json()
    expect(String(m.name)).toContain('Shotokan')

    const sw = await request.get('sw.js')
    expect(sw.status()).toBe(200)
  })
})
