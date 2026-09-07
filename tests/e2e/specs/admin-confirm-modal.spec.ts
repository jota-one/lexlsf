import { test, expect, pbFetch } from '../fixtures/index'
import { deleteLexicalField } from '../fixtures/lexical'

/**
 * The confirmation modal shared by every admin view hands focus to "Confirmer"
 * on open, so a keyboard user validates with Enter instead of tabbing to it.
 */
test('the admin confirmation modal focuses its confirm button', async ({ adminPage, admin }) => {
  const stamp = Date.now().toString(36)
  const name = `E2E-Confirm-${stamp}`
  const res = await pbFetch(
    '/api/collections/lexical_field/records',
    {
      method: 'POST',
      body: JSON.stringify({
        name,
        slug: `e2e-confirm-${stamp}`,
        introduction: '',
        Roles: [],
        Categories: [],
      }),
    },
    admin.token,
  )
  expect(res.ok, `field creation failed: ${res.status}`).toBeTruthy()
  const field = (await res.json()) as { id: string }

  try {
    await adminPage.goto('/admin/lexical-fields')
    await adminPage
      .getByRole('row', { name: new RegExp(name) })
      .getByTitle('Supprimer')
      .click()
    await expect(adminPage.getByText('Supprimer le champ lexical ?')).toBeVisible()

    await expect(async () => {
      const focused = await adminPage.evaluate(() => document.activeElement?.textContent?.trim())
      expect(focused).toBe('Confirmer')
    }).toPass({ timeout: 3000 })

    // Focused means Enter alone confirms.
    await adminPage.keyboard.press('Enter')
    await expect(async () => {
      const check = await pbFetch(
        `/api/collections/lexical_field/records/${field.id}`,
        {},
        admin.token,
      )
      expect(check.status).toBe(404)
    }).toPass({ timeout: 5000 })
  } finally {
    await deleteLexicalField(admin, field.id)
  }
})
