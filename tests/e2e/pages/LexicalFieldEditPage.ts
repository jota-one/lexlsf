import { expect, type Page } from '@playwright/test'

/**
 * Drives the admin lexical field edit page (/admin/lexical-fields/:id/edit)
 * and its compact terms table.
 */
export class LexicalFieldEditPage {
  constructor(private page: Page) {}

  async goto(fieldId: string) {
    await this.page.goto(`/admin/lexical-fields/${fieldId}/edit`)
    await expect(this.page.getByRole('tab', { name: 'Termes' })).toBeVisible()
  }

  async openTermsTab() {
    await this.page.getByRole('tab', { name: 'Termes' }).click()
    await expect(this.page.getByRole('button', { name: 'Ajouter un terme' })).toBeVisible()
  }

  /** Picks a value in a PrimeVue Select identified by its current label. */
  private async selectOption(currentLabel: string, optionLabel: string) {
    await this.page.locator('.p-select', { hasText: currentLabel }).first().click()
    await this.page.locator('.p-select-option', { hasText: optionLabel }).first().click()
  }

  /** Adds a term through the inline "new term" form. */
  async addTerm(opts: { term: string; type?: string; strategy?: string; note?: string }) {
    await this.page.getByRole('button', { name: 'Ajouter un terme' }).click()
    await this.page.getByPlaceholder('Terme français...').fill(opts.term)
    if (opts.strategy) {
      await this.page.getByPlaceholder('Stratégie...').fill(opts.strategy)
    }
    if (opts.note) {
      await this.page.getByPlaceholder('Note personnelle...').fill(opts.note)
    }
    if (opts.type) {
      await this.selectOption('Aucun type', opts.type)
    }
    await this.page.getByRole('button', { name: 'Ajouter', exact: true }).click()
    await expect(this.termRow(opts.term)).toBeVisible()
  }

  termRow(term: string) {
    return this.page.getByRole('row', { name: new RegExp(term) })
  }

  /** Expands a term row and links it to another term via the MultiSelect. */
  async linkTerm(term: string, relatedLabel: string) {
    // The first button in the row is the PrimeVue expander toggle.
    await this.termRow(term).locator('button').first().click()
    // The expansion panel carries the MultiSelect labelled "Aucun terme lié".
    const multiselect = this.page.locator('.p-multiselect').last()
    await multiselect.click()
    await this.page.locator('.p-multiselect-option', { hasText: relatedLabel }).first().click()
    await this.page.keyboard.press('Escape')
    await this.page.getByRole('button', { name: 'Enregistrer', exact: true }).last().click()
  }
}
