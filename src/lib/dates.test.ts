import { describe, it, expect } from 'vitest'
import { formatDate, formatDateRange, isPeriod } from './dates'

describe('formatDate', () => {
  it('returns empty string for empty input', () => {
    expect(formatDate('')).toBe('')
  })

  it('formats a year-only date', () => {
    expect(formatDate('2020')).toBe('2020')
  })

  it('formats a year-month date', () => {
    expect(formatDate('2020-05')).toBe('mai 2020')
  })

  it('formats a full date without leading zero on the day', () => {
    expect(formatDate('2020-05-07')).toBe('7 mai 2020')
    expect(formatDate('2020-05-17')).toBe('17 mai 2020')
  })

  it('covers month boundaries', () => {
    expect(formatDate('2020-01')).toBe('jan. 2020')
    expect(formatDate('2020-12')).toBe('déc. 2020')
  })
})

describe('formatDateRange', () => {
  it('returns only the start date when end is empty', () => {
    expect(formatDateRange('2020', '')).toBe('2020')
  })

  it('joins start and end with an arrow', () => {
    expect(formatDateRange('2020', '2021-03')).toBe('2020 → mar. 2021')
  })
})

describe('isPeriod', () => {
  it('is true only when end_date is set', () => {
    expect(isPeriod({ end_date: '2021' })).toBe(true)
    expect(isPeriod({ end_date: '' })).toBe(false)
    expect(isPeriod({})).toBe(false)
  })
})
