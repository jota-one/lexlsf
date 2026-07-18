import { describe, it, expect } from 'vitest'
import { computeQuizScore, scoreColorClass } from './quizScore'

describe('computeQuizScore', () => {
  it('returns 100 for an all-known run at reference speed', () => {
    // refTime = 6s/card * 10 = 60s → timeRatio 1 → no bonus
    expect(
      computeQuizScore({ known: 10, unknown: 0, skipped: 0, total: 10, durationSeconds: 60 }),
    ).toBe(100)
  })

  it('caps at 100 for an all-known fast run (time bonus clamped)', () => {
    // 30s for 60s ref → +15 bonus, 100 + 15 clamped to 100
    expect(
      computeQuizScore({ known: 10, unknown: 0, skipped: 0, total: 10, durationSeconds: 30 }),
    ).toBe(100)
  })

  it('returns 0 for an all-unknown run', () => {
    expect(
      computeQuizScore({ known: 0, unknown: 10, skipped: 0, total: 10, durationSeconds: 60 }),
    ).toBe(0)
  })

  it('never goes below 0 (slow all-unknown run)', () => {
    // timeRatio 0.1 → malus capped at −5, then clamped to 0
    expect(
      computeQuizScore({ known: 0, unknown: 10, skipped: 0, total: 10, durationSeconds: 600 }),
    ).toBe(0)
  })

  it('deducts 2 points per skipped card out of 10 (linear skip penalty)', () => {
    // accuracy 80 − skipDeduction 4 = 76
    expect(
      computeQuizScore({ known: 8, unknown: 0, skipped: 2, total: 10, durationSeconds: 60 }),
    ).toBe(76)
  })

  it('caps the skip deduction at 20 points (1 skip/card)', () => {
    // skipped 20 / total 10 → ratio clamped to 1 → −20
    expect(
      computeQuizScore({ known: 10, unknown: 0, skipped: 20, total: 10, durationSeconds: 60 }),
    ).toBe(80)
  })

  it('caps the slow-run malus at −5 points', () => {
    // timeRatio 0.01 → raw malus −14.85, capped at −5
    expect(
      computeQuizScore({ known: 10, unknown: 0, skipped: 0, total: 10, durationSeconds: 6000 }),
    ).toBe(95)
  })

  it('returns 0 when total is 0', () => {
    expect(
      computeQuizScore({ known: 0, unknown: 0, skipped: 0, total: 0, durationSeconds: 60 }),
    ).toBe(0)
  })

  it('treats a zero duration as neutral time (no bonus, no malus)', () => {
    expect(
      computeQuizScore({ known: 5, unknown: 5, skipped: 0, total: 10, durationSeconds: 0 }),
    ).toBe(50)
  })
})

describe('scoreColorClass', () => {
  it('returns success from 80 up', () => {
    expect(scoreColorClass(100)).toBe('text-success')
    expect(scoreColorClass(80)).toBe('text-success')
  })

  it('returns warning from 50 to 79', () => {
    expect(scoreColorClass(79)).toBe('text-warning')
    expect(scoreColorClass(50)).toBe('text-warning')
  })

  it('returns error below 50', () => {
    expect(scoreColorClass(49)).toBe('text-error')
    expect(scoreColorClass(0)).toBe('text-error')
  })
})
