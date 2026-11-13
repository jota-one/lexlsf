import { describe, expect, it } from 'vitest'
import { itemCountLabel, itemTypeBadge, itemTypeLabel } from './quizItemType'

describe('quizItemType', () => {
  it('labels each quiz type', () => {
    expect(itemTypeLabel('sign')).toBe('Signes')
    expect(itemTypeLabel('person')).toBe('Personnes')
    expect(itemTypeLabel('mixed')).toBe('Mixte')
  })

  it('keeps signs blue and persons pink', () => {
    expect(itemTypeBadge('sign')).toBe('badge-primary')
    expect(itemTypeBadge('person')).toBe('badge-secondary')
    expect(itemTypeBadge('mixed')).toBe('badge-ghost')
  })

  it('counts items with the noun of the quiz type', () => {
    expect(itemCountLabel('sign', 1)).toBe('1 signe')
    expect(itemCountLabel('sign', 19)).toBe('19 signes')
    expect(itemCountLabel('person', 3)).toBe('3 personnes')
    expect(itemCountLabel('mixed', 0)).toBe('0 élément')
  })
})
