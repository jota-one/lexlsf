import { test, expect, pbFetch, type Auth } from '../fixtures/index'
import { deleteCategory, deleteLexicalField, ensureTermType, listTerms } from '../fixtures/lexical'
import { LexicalFieldEditPage } from '../pages/LexicalFieldEditPage'

/**
 * End-to-end coverage of the lexical fields rework: admin term CRUD with a
 * type and reciprocal links, CSV import (two-pass link resolution), and the
 * type-grouped public page.
 */

const stamp = () => Date.now().toString(36)

async function createField(admin: Auth, name: string): Promise<{ id: string; slug: string }> {
  const slug = `e2e-${name.toLowerCase()}-${stamp()}`
  const res = await pbFetch(
    '/api/collections/lexical_field/records',
    {
      method: 'POST',
      body: JSON.stringify({ name, slug, introduction: '', Roles: [], Categories: [] }),
    },
    admin.token,
  )
  expect(res.ok, `field creation failed: ${res.status}`).toBeTruthy()
  return { id: (await res.json()).id, slug }
}

test.describe.configure({ mode: 'serial' })

test.describe('Champs lexicaux — admin', () => {
  let type: { id: string; created: boolean }

  test.beforeAll(async () => {
    const { ensureAdminAuth } = await import('../fixtures/index')
    const admin = await ensureAdminAuth()
    type = await ensureTermType(admin, 'E2E-Institution')
  })

  test.afterAll(async () => {
    const { ensureAdminAuth } = await import('../fixtures/index')
    const admin = await ensureAdminAuth()
    if (type.created) {
      await deleteCategory(admin, type.id)
    }
  })

  test('creates a lexical field through the modal and lands on its edit page', async ({
    adminPage,
    admin,
  }) => {
    const name = `Champ ${stamp()}`
    await adminPage.goto('/admin/lexical-fields')
    await adminPage.getByRole('button', { name: 'Ajouter un champ lexical' }).click()
    await adminPage.getByLabel('Nom').fill(name)
    await adminPage.getByRole('button', { name: 'Créer' }).click()

    await expect(adminPage).toHaveURL(/\/admin\/lexical-fields\/[a-z0-9]+\/edit$/)
    await expect(adminPage.getByRole('heading', { name })).toBeVisible()

    // Clean up the field this test created.
    const id = adminPage.url().match(/lexical-fields\/([a-z0-9]+)\/edit/)?.[1]
    expect(id).toBeTruthy()
    await deleteLexicalField(admin, id!)
  })

  test('adds terms and links them reciprocally', async ({ adminPage, admin }) => {
    const field = await createField(admin, 'Liens')
    try {
      const edit = new LexicalFieldEditPage(adminPage)
      await edit.goto(field.id)
      await edit.openTermsTab()

      await edit.addTerm({ term: 'Ministre', type: 'E2E-Institution', note: 'chef de ministère' })
      await edit.addTerm({ term: 'Parlement', strategy: 'signer assemblée' })

      await edit.linkTerm('Ministre', 'Parlement')

      // The link must exist on both sides.
      await expect(async () => {
        const terms = await listTerms(admin, field.id)
        const ministre = terms.find(t => t.term === 'Ministre')
        const parlement = terms.find(t => t.term === 'Parlement')
        expect(ministre?.RelatedTerms).toContain(parlement?.id)
        expect(parlement?.RelatedTerms).toContain(ministre?.id)
      }).toPass({ timeout: 5000 })

      // The type set on Ministre must be persisted.
      const terms = await listTerms(admin, field.id)
      expect(terms.find(t => t.term === 'Ministre')?.Type).toBe(type.id)
    } finally {
      await deleteLexicalField(admin, field.id)
    }
  })

  test('imports terms from CSV and resolves links in a second pass', async ({
    adminPage,
    admin,
  }) => {
    const field = await createField(admin, 'Import')
    try {
      const edit = new LexicalFieldEditPage(adminPage)
      await edit.goto(field.id)
      await edit.openTermsTab()

      await adminPage.getByRole('button', { name: 'Import / Export' }).click()

      // Sloppy input: the term has repeated inner spaces and the `related`
      // column has stray/inner spaces — both must be cleaned and still match.
      const csv = [
        'term,Type,strategy,note,related',
        'Chambre  haute,,,,Chambre basse',
        'Chambre basse,,,,  Chambre   haute  ',
      ].join('\n')
      await adminPage.locator('input[type="file"]').setInputFiles({
        name: 'terms.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(csv, 'utf-8'),
      })
      await adminPage.getByRole('button', { name: 'Importer le fichier' }).click()

      await expect(adminPage.getByText(/2 terme\(s\) traité\(s\)/)).toBeVisible()

      await expect(async () => {
        const terms = await listTerms(admin, field.id)
        // The stored term must have collapsed inner whitespace.
        const haute = terms.find(t => t.term === 'Chambre haute')
        const basse = terms.find(t => t.term === 'Chambre basse')
        expect(haute, 'Chambre haute imported and cleaned').toBeTruthy()
        expect(basse, 'Chambre basse imported').toBeTruthy()
        // The link resolved despite the messy `related` value.
        expect(haute?.RelatedTerms).toContain(basse?.id)
        expect(basse?.RelatedTerms).toContain(haute?.id)
      }).toPass({ timeout: 5000 })
    } finally {
      await deleteLexicalField(admin, field.id)
    }
  })

  test('renders the public page grouped by term type', async ({ adminPage, admin }) => {
    const field = await createField(admin, 'Public')
    try {
      // Seed one typed and one untyped term via API.
      await pbFetch(
        '/api/collections/lexical_term/records',
        {
          method: 'POST',
          body: JSON.stringify({
            term: 'Préfecture',
            LexicalField: field.id,
            Type: type.id,
            strategy: 'signe administration',
          }),
        },
        admin.token,
      )
      await pbFetch(
        '/api/collections/lexical_term/records',
        {
          method: 'POST',
          body: JSON.stringify({ term: 'Vote', LexicalField: field.id, note: 'geste bulletin' }),
        },
        admin.token,
      )

      await adminPage.goto(`/outils/champs-lexicaux/${field.slug}`)

      await expect(adminPage.getByRole('heading', { name: 'E2E-Institution' })).toBeVisible()
      await expect(adminPage.getByText('Préfecture')).toBeVisible()
      await expect(adminPage.getByText('signe administration')).toBeVisible()
      await expect(adminPage.getByText('Vote')).toBeVisible()
    } finally {
      await deleteLexicalField(admin, field.id)
    }
  })
})
