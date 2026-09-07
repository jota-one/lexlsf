import { test, expect, pbFetch } from '../fixtures/index'

/**
 * A sign without a video must not render an empty player: the page shows a
 * placeholder of the same footprint instead.
 */
test('a sign without a video shows a placeholder instead of an empty player', async ({
  adminPage,
  admin,
}) => {
  const stamp = Date.now().toString(36)
  const slug = `e2e-no-video-${stamp}`
  const res = await pbFetch(
    '/api/collections/sign/records',
    {
      method: 'POST',
      body: JSON.stringify({
        name: `E2E-SansVideo-${stamp}`,
        slug,
        definition: 'Signe de test sans vidéo.',
        level: 'c1',
        Roles: [],
      }),
    },
    admin.token,
  )
  expect(res.ok, `sign creation failed: ${res.status}`).toBeTruthy()
  const sign = (await res.json()) as { id: string }

  try {
    await adminPage.goto(`/lexique/sign/${slug}`)
    await expect(adminPage.getByText('Vidéo non disponible')).toBeVisible()
    await expect(adminPage.locator('video')).toHaveCount(0)
  } finally {
    await pbFetch(`/api/collections/sign/records/${sign.id}`, { method: 'DELETE' }, admin.token)
  }
})
