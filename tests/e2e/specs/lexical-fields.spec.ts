import { test, expect, pbFetch, type Auth } from '../fixtures/index'
import { deleteCategory, deleteLexicalField, ensureTermType, listTerms } from '../fixtures/lexical'
import { LexicalFieldEditPage } from '../pages/LexicalFieldEditPage'

/**
 * End-to-end coverage of the lexical fields rework: admin term CRUD with a
 * type and one-way links, CSV import (two-pass link resolution), and the
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

  test('adds terms and links them one way only', async ({ adminPage, admin }) => {
    const field = await createField(admin, 'Liens')
    // Unique term names so the suite never collides with real data in the dev DB
    // (the related-terms picker searches every field).
    const a = `E2E${stamp()}-Alpha`
    const b = `E2E${stamp()}-Beta`
    try {
      const edit = new LexicalFieldEditPage(adminPage)
      await edit.goto(field.id)
      await edit.openTermsTab()

      await edit.addTerm({ term: a, type: 'E2E-Institution', note: 'chef de ministère' })
      await edit.addTerm({ term: b, strategy: 'signer assemblée' })

      await edit.linkTerm(a, b)

      // The link only exists on the edited term.
      await expect(async () => {
        const terms = await listTerms(admin, field.id)
        const termA = terms.find(t => t.term === a)
        const termB = terms.find(t => t.term === b)
        expect(termA?.RelatedTerms).toContain(termB?.id)
        expect(termB?.RelatedTerms).not.toContain(termA?.id)
      }).toPass({ timeout: 5000 })

      // The type set on the first term must be persisted.
      const terms = await listTerms(admin, field.id)
      expect(terms.find(t => t.term === a)?.Type).toBe(type.id)
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

      // Unique names so the two-pass link resolution stays unambiguous even
      // against real data already in the dev DB.
      const hauteName = `E2E${stamp()}-Chambre haute`
      const basseName = `E2E${stamp()}-Chambre basse`
      // Sloppy input: the term has repeated inner spaces and the `related`
      // column has stray/inner spaces — both must be cleaned and still match.
      const csv = [
        'term,Type,strategy,note,related',
        `${hauteName.replace(' haute', '  haute')},,,,${basseName}`,
        `${basseName},,,,  ${hauteName.replace(' haute', '   haute')}  `,
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
        const haute = terms.find(t => t.term === hauteName)
        const basse = terms.find(t => t.term === basseName)
        expect(haute, 'haute imported and cleaned').toBeTruthy()
        expect(basse, 'basse imported').toBeTruthy()
        // Each row declares its own link, so both resolved despite the messy
        // `related` values.
        expect(haute?.RelatedTerms).toContain(basse?.id)
        expect(basse?.RelatedTerms).toContain(haute?.id)
      }).toPass({ timeout: 5000 })
    } finally {
      await deleteLexicalField(admin, field.id)
    }
  })

  test('imports a semicolon-delimited CSV with comma-separated links', async ({
    adminPage,
    admin,
  }) => {
    const field = await createField(admin, 'ImportSemi')
    try {
      const edit = new LexicalFieldEditPage(adminPage)
      await edit.goto(field.id)
      await edit.openTermsTab()

      await adminPage.getByRole('button', { name: 'Import / Export' }).click()

      const senat = `E2E${stamp()}-Senat`
      const depute = `E2E${stamp()}-Depute`
      const scrutin = `E2E${stamp()}-Scrutin`
      // French-locale spreadsheet flavour: `;` between columns, so the related
      // list can use commas like the other import/exports.
      const csv = [
        'term;Type;strategy;note;related',
        `${senat};;;;${depute},${scrutin}`,
        `${depute};;;;`,
        `${scrutin};;;;`,
      ].join('\n')
      await adminPage.locator('input[type="file"]').setInputFiles({
        name: 'terms.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(csv, 'utf-8'),
      })
      await adminPage.getByRole('button', { name: 'Importer le fichier' }).click()

      await expect(adminPage.getByText(/3 terme\(s\) traité\(s\)/)).toBeVisible()

      await expect(async () => {
        const terms = await listTerms(admin, field.id)
        const first = terms.find(t => t.term === senat)
        const second = terms.find(t => t.term === depute)
        const third = terms.find(t => t.term === scrutin)
        expect(first, 'columns split on the semicolon').toBeTruthy()
        // Both names of the comma-separated `related` list resolved...
        expect(first?.RelatedTerms).toContain(second?.id)
        expect(first?.RelatedTerms).toContain(third?.id)
        // ...and only in that direction.
        expect(second?.RelatedTerms).not.toContain(first?.id)
        expect(third?.RelatedTerms).not.toContain(first?.id)
      }).toPass({ timeout: 5000 })
    } finally {
      await deleteLexicalField(admin, field.id)
    }
  })

  test('expands and highlights a collapsed card when following a related link', async ({
    adminPage,
    admin,
  }) => {
    const field = await createField(admin, 'Ancres')
    const prefix = `E2E${stamp()}`
    try {
      // Enough terms in the typed card that it renders collapsed.
      const ids: string[] = []
      for (let i = 1; i <= 12; i++) {
        const res = await pbFetch(
          '/api/collections/lexical_term/records',
          {
            method: 'POST',
            body: JSON.stringify({
              term: `${prefix}-T${String(i).padStart(2, '0')}`,
              LexicalField: field.id,
              Type: type.id,
            }),
          },
          admin.token,
        )
        ids.push((await res.json()).id)
      }
      const targetId = ids[ids.length - 1]
      // An untyped term linking to the last one, buried in the collapsed card.
      const sourceRes = await pbFetch(
        '/api/collections/lexical_term/records',
        {
          method: 'POST',
          body: JSON.stringify({
            term: `${prefix}-Source`,
            LexicalField: field.id,
            RelatedTerms: [targetId],
          }),
        },
        admin.token,
      )
      const sourceId = (await sourceRes.json()).id

      await adminPage.goto(`/outils/champs-lexicaux/${field.slug}`)
      await expect(adminPage.getByRole('button', { name: 'Réduire' })).toHaveCount(0)

      // The links live in the detail panel revealed by hovering the term.
      await adminPage.locator(`li#term-${sourceId}`).hover()
      await adminPage.getByRole('link', { name: `${prefix}-T12` }).click()

      // The card holding the target unfolds...
      await expect(adminPage.getByRole('button', { name: 'Réduire' })).toBeVisible()
      // ...and the target term is highlighted.
      await expect(adminPage.locator(`li#term-${targetId}`)).toHaveCSS(
        'box-shadow',
        /3px 0px 0px 0px inset/,
      )

      // An expanded card can also be folded back from its header chevron.
      await adminPage.getByRole('button', { name: 'Replier E2E-Institution' }).click()
      await expect(adminPage.getByRole('button', { name: 'Voir les 12 termes' })).toBeVisible()
    } finally {
      await deleteLexicalField(admin, field.id)
    }
  })

  test('highlights a term reached from another lexical field', async ({ adminPage, admin }) => {
    const target = await createField(admin, 'Cible')
    const source = await createField(admin, 'Source')
    const prefix = `E2E${stamp()}`
    try {
      // Enough terms in the target field that its card renders collapsed.
      const ids: string[] = []
      for (let i = 1; i <= 12; i++) {
        const res = await pbFetch(
          '/api/collections/lexical_term/records',
          {
            method: 'POST',
            body: JSON.stringify({
              term: `${prefix}-C${String(i).padStart(2, '0')}`,
              LexicalField: target.id,
              Type: type.id,
            }),
          },
          admin.token,
        )
        ids.push((await res.json()).id)
      }
      const targetTermId = ids[ids.length - 1]
      const departRes = await pbFetch(
        '/api/collections/lexical_term/records',
        {
          method: 'POST',
          body: JSON.stringify({
            term: `${prefix}-Depart`,
            LexicalField: source.id,
            RelatedTerms: [targetTermId],
          }),
        },
        admin.token,
      )
      const departId = (await departRes.json()).id

      await adminPage.goto(`/outils/champs-lexicaux/${source.slug}`)
      await adminPage.locator(`li#term-${departId}`).hover()
      await adminPage.getByRole('link', { name: `${prefix}-C12` }).click()

      // Landing on the other field's page, the card unfolds and the term is
      // highlighted — `:target` cannot do this, the terms render client-side.
      await expect(adminPage).toHaveURL(
        `/outils/champs-lexicaux/${target.slug}#term-${targetTermId}`,
      )
      await expect(adminPage.getByRole('button', { name: 'Réduire' })).toBeVisible()
      await expect(adminPage.locator(`li#term-${targetTermId}`)).toHaveCSS(
        'box-shadow',
        /3px 0px 0px 0px inset/,
      )
    } finally {
      await deleteLexicalField(admin, source.id)
      await deleteLexicalField(admin, target.id)
    }
  })

  test('proposes and applies signs for terms that have none', async ({ adminPage, admin }) => {
    const prefix = `E2E${stamp()}`
    const signName = `${prefix}-Sénat`
    const signRes = await pbFetch(
      '/api/collections/sign/records',
      {
        method: 'POST',
        body: JSON.stringify({ name: signName, slug: `${prefix.toLowerCase()}-senat`, Roles: [] }),
      },
      admin.token,
    )
    expect(signRes.ok, `sign creation failed: ${signRes.status}`).toBeTruthy()
    const sign = await signRes.json()

    const field = await createField(admin, 'Signes')
    try {
      // One term matches the sign exactly (accent aside), one contains it as a
      // whole word, one has nothing to match.
      for (const term of [`${prefix}-senat`, `${prefix}-Sénat européen`, `${prefix}-Zzzz`]) {
        await pbFetch(
          '/api/collections/lexical_term/records',
          { method: 'POST', body: JSON.stringify({ term, LexicalField: field.id }) },
          admin.token,
        )
      }

      const edit = new LexicalFieldEditPage(adminPage)
      await edit.goto(field.id)
      await edit.openTermsTab()

      await adminPage.getByRole('button', { name: 'Rapprocher les signes' }).click()

      // Two proposals out of three sign-less terms.
      await expect(adminPage.getByRole('button', { name: /Associer 2 signes/ })).toBeVisible()
      await expect(adminPage.getByText('Exact', { exact: true })).toBeVisible()
      await expect(adminPage.getByText('Approchant', { exact: true })).toBeVisible()

      await adminPage.getByRole('button', { name: /Associer 2 signes/ }).click()

      await expect(async () => {
        const terms = await listTerms(admin, field.id)
        expect(terms.find(t => t.term === `${prefix}-senat`)?.Sign).toBe(sign.id)
        expect(terms.find(t => t.term === `${prefix}-Sénat européen`)?.Sign).toBe(sign.id)
        // The term with no candidate is left alone.
        expect(terms.find(t => t.term === `${prefix}-Zzzz`)?.Sign).toBeFalsy()
      }).toPass({ timeout: 5000 })
    } finally {
      await deleteLexicalField(admin, field.id)
      await pbFetch(`/api/collections/sign/records/${sign.id}`, { method: 'DELETE' }, admin.token)
    }
  })

  test('renders the public page grouped by term type', async ({ adminPage, admin }) => {
    const field = await createField(admin, 'Public')
    const typed = `E2E${stamp()}-Typé`
    const untyped = `E2E${stamp()}-Libre`
    try {
      // Seed one typed and one untyped term via API.
      const typedRes = await pbFetch(
        '/api/collections/lexical_term/records',
        {
          method: 'POST',
          body: JSON.stringify({
            term: typed,
            LexicalField: field.id,
            Type: type.id,
            strategy: 'signe administration',
          }),
        },
        admin.token,
      )
      const typedId = (await typedRes.json()).id
      await pbFetch(
        '/api/collections/lexical_term/records',
        {
          method: 'POST',
          body: JSON.stringify({
            term: untyped,
            LexicalField: field.id,
            note: 'geste bulletin',
          }),
        },
        admin.token,
      )

      await adminPage.goto(`/outils/champs-lexicaux/${field.slug}`)

      await expect(adminPage.getByRole('heading', { name: 'E2E-Institution' })).toBeVisible()
      await expect(adminPage.getByText(typed)).toBeVisible()
      await expect(adminPage.getByText(untyped)).toBeVisible()
      // Untyped terms fall under a default "Non classés" heading.
      await expect(adminPage.getByRole('heading', { name: 'Non classés' })).toBeVisible()

      // The cards list terms only: the strategy shows in the hover panel.
      await expect(adminPage.getByText('signe administration')).toHaveCount(0)
      await adminPage.locator(`li#term-${typedId}`).hover()
      await expect(adminPage.getByText('signe administration')).toBeVisible()
    } finally {
      await deleteLexicalField(admin, field.id)
    }
  })
})
