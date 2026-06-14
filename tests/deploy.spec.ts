import { test, expect } from '@playwright/test'

const EXPECTED_COMMIT = process.env.EXPECTED_COMMIT

test.describe('deployment', () => {
  // The freshness poll can run up to ~90s during Pages/CDN propagation. The
  // default 30s test timeout would otherwise cut the poll short, and a stale
  // deploy that hasn't propagated within one poll won't within a retried one —
  // so give this test room and don't retry it.
  test.describe('freshness', () => {
    test.describe.configure({ retries: 0 })

    test('serves version.json for the expected build', async ({ request }) => {
      test.setTimeout(120_000)
      if (EXPECTED_COMMIT) {
        await expect
          .poll(
            async () => {
              const res = await request.get('version.json')
              if (!res.ok()) return null
              // A CDN edge can briefly serve a non-JSON 200 during propagation;
              // treat a parse failure as "not ready yet" and keep polling.
              try {
                return (await res.json()).commit
              } catch {
                return null
              }
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
  })

  test('home page renders grades', async ({ page }) => {
    await page.goto('#/')
    await expect(page.locator('.grade-card').first()).toBeVisible()
    await expect(page.getByText('9. Kyu').first()).toBeVisible()
  })

  test('Einstellung surfaces the app version', async ({ page, request }) => {
    // Commit freshness is gated by the dedicated test above; here we only check
    // that the UI renders the version that version.json reports.
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
