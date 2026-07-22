import { describe, it, expect } from 'vitest'
import { shuffle, partitionResumedItems, computeSkipInsertIndex } from './quizDeck'

const quizItems = [
  { id: 'q1', item_type: 'sign', item_id: 's1', position: 1 },
  { id: 'q2', item_type: 'sign', item_id: 's2', position: 2 },
  { id: 'q3', item_type: 'sign', item_id: 's3', position: 3 },
  { id: 'q4', item_type: 'sign', item_id: 's4', position: 4 },
]

describe('shuffle', () => {
  it('keeps the same elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffle([...arr])
    expect([...result].sort((a, b) => a - b)).toEqual(arr)
  })
})

describe('partitionResumedItems', () => {
  it('returns everything unattempted when there are no attempts', () => {
    const { unattempted, skippedOnly } = partitionResumedItems(quizItems, [])
    expect(unattempted.map(i => i.quizItemId)).toEqual(['q1', 'q2', 'q3', 'q4'])
    expect(skippedOnly).toEqual([])
  })

  it('excludes definitively answered items', () => {
    const attempts = [
      { QuizItem: 'q1', result: 'known' },
      { QuizItem: 'q2', result: 'unknown' },
    ]
    const { unattempted, skippedOnly } = partitionResumedItems(quizItems, attempts)
    expect(unattempted.map(i => i.quizItemId)).toEqual(['q3', 'q4'])
    expect(skippedOnly).toEqual([])
  })

  it('puts skipped-never-answered items in skippedOnly', () => {
    const attempts = [{ QuizItem: 'q3', result: 'skip' }]
    const { unattempted, skippedOnly } = partitionResumedItems(quizItems, attempts)
    expect(unattempted.map(i => i.quizItemId)).toEqual(['q1', 'q2', 'q4'])
    expect(skippedOnly.map(i => i.quizItemId)).toEqual(['q3'])
  })

  it('a skip-then-known item is neither unattempted nor skippedOnly', () => {
    const attempts = [
      { QuizItem: 'q2', result: 'skip' },
      { QuizItem: 'q2', result: 'known' },
    ]
    const { unattempted, skippedOnly } = partitionResumedItems(quizItems, attempts)
    expect(unattempted.map(i => i.quizItemId)).toEqual(['q1', 'q3', 'q4'])
    expect(skippedOnly).toEqual([])
  })
})

describe('computeSkipInsertIndex', () => {
  it('appends at the end when no skipped zone exists yet', () => {
    const deck = [{}, {}, {}, {}]
    expect(computeSkipInsertIndex(deck, 0)).toBe(4)
  })

  it('never inserts before an unanswered card', () => {
    // deck: current at 0, unanswered at 1-2, skipped zone at 3-4
    const deck = [{}, {}, {}, { isSkipRequeue: true }, { isSkipRequeue: true }]
    for (let run = 0; run < 100; run++) {
      const idx = computeSkipInsertIndex(deck, 0)
      expect(idx).toBeGreaterThanOrEqual(3)
      expect(idx).toBeLessThanOrEqual(deck.length)
    }
  })

  it('ignores re-queued cards at or before the current position', () => {
    // the only isSkipRequeue card is before currentIndex → no zone → append
    const deck = [{ isSkipRequeue: true }, {}, {}]
    expect(computeSkipInsertIndex(deck, 1)).toBe(3)
  })
})
