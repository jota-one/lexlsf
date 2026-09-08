import { test, expect } from '../fixtures/index'

/**
 * The global search can be narrowed to a few collections. The choice is kept in
 * localStorage, shared by the home page toggles and the header filter button,
 * and an unticked collection is not queried at all.
 */

const searchInput = 'nav input[role="combobox"]'

/** The collections actually hit by a search, from the network traffic. */
async function queriedCollections(page: import('@playwright/test').Page, query: string) {
  const hits = new Set<string>()
  const record = (url: string) => {
    const match = url.match(/\/api\/collections\/([^/]+)\//)
    if (match) {
      hits.add(match[1])
    }
  }
  page.on('request', request => record(request.url()))
  await page.locator(searchInput).fill(query)
  await page.waitForTimeout(1000)
  return hits
}

test('narrows the search to the ticked collections and remembers the choice', async ({
  adminPage,
}) => {
  await adminPage.goto('/')

  // The home page shows the collections as toggles, all on by default.
  await adminPage.getByRole('button', { name: 'Culture', exact: true }).click()
  await adminPage.getByRole('button', { name: 'Expr. pi-sourdes' }).click()

  // The header of another page picks the same selection back up.
  await adminPage.goto('/lexique')
  await adminPage.getByRole('button', { name: 'Filtrer les collections cherchées' }).click()
  await expect(adminPage.getByRole('checkbox', { name: 'Signes' })).toBeChecked()
  await expect(adminPage.getByRole('checkbox', { name: 'Culture' })).not.toBeChecked()
  await expect(adminPage.getByRole('checkbox', { name: 'Expr. pi-sourdes' })).not.toBeChecked()

  const hits = await queriedCollections(adminPage, 'avo')
  expect([...hits].sort()).toEqual(['french_expression', 'lexical_field', 'lexical_term', 'sign'])
})

test('keeps at least one collection ticked', async ({ adminPage }) => {
  await adminPage.goto('/')
  for (const label of ['Culture', 'Champs lexicaux', 'Expr. françaises', 'Expr. pi-sourdes']) {
    await adminPage.getByRole('button', { name: label, exact: true }).click()
  }

  // "Signes" is the last one left: it must not be possible to untick it.
  await adminPage.getByRole('button', { name: 'Signes', exact: true }).click()
  const stored = await adminPage.evaluate(() => localStorage.getItem('search-collections'))
  expect(JSON.parse(stored ?? '[]')).toEqual(['sign'])
})
