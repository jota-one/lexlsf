import { describe, expect, it } from 'vitest'
import { MIN_SCORE, buildSignIndex, findMatches, normalize } from './signMatcher'

const SIGNS = [
  { id: 's1', name: 'Ministre' },
  { id: 's2', name: 'Parlement' },
  { id: 's3', name: 'Événement' },
  { id: 's4', name: 'Assemblée nationale' },
  { id: 's5', name: 'Élève' },
  { id: 's6', name: 'Chien' },
]

const index = buildSignIndex(SIGNS)
const best = (term: string) => findMatches(index, term)[0]

describe('normalize', () => {
  it('strips accents, case and punctuation', () => {
    expect(normalize('Événement')).toBe('evenement')
    expect(normalize('  Assemblée   NATIONALE ')).toBe('assemblee nationale')
    expect(normalize('Personne / acteur')).toBe('personne acteur')
  })
})

describe('findMatches', () => {
  it('scores an exact match at 1', () => {
    expect(best('Ministre')).toMatchObject({ id: 's1', score: 1 })
  })

  it('ignores accents and case', () => {
    expect(best('evenement')).toMatchObject({ id: 's3', score: 1 })
    expect(best('ELEVE')).toMatchObject({ id: 's5', score: 1 })
  })

  it('tolerates a single-edit typo on a long enough word', () => {
    expect(best('Parlemant')?.id).toBe('s2')
    expect(best('Parlemnt')?.id).toBe('s2')
  })

  it('does not chase near-miss words', () => {
    // Two real words one edit apart, but too short to be a credible typo.
    expect(findMatches(buildSignIndex([{ id: 'x', name: 'Maître' }]), 'Maire')).toEqual([])
    // Two edits apart: unrelated words, whatever the length.
    expect(findMatches(buildSignIndex([{ id: 'x', name: 'Logement' }]), 'Jugement')).toEqual([])
  })

  it('finds a sign contained in a longer term', () => {
    expect(best('Assemblée nationale française')?.id).toBe('s4')
  })

  it('proposes nothing rather than a weak guess', () => {
    expect(findMatches(index, 'Photosynthèse')).toEqual([])
    expect(findMatches(index, '')).toEqual([])
  })

  it('never returns a candidate below the floor', () => {
    for (const term of ['Ministre', 'Parlemant', 'Chien', 'xyz']) {
      for (const match of findMatches(index, term)) {
        expect(match.score).toBeGreaterThanOrEqual(MIN_SCORE)
      }
    }
  })

  it('returns candidates in decreasing confidence, capped by the limit', () => {
    const matches = findMatches(index, 'Parlement', 3)
    expect(matches.length).toBeLessThanOrEqual(3)
    const scores = matches.map(match => match.score)
    expect([...scores].sort((a, b) => b - a)).toEqual(scores)
  })

  it('keeps every sign sharing the same name', () => {
    const twins = buildSignIndex([
      { id: 'a', name: 'Banque' },
      { id: 'b', name: 'banque' },
    ])
    expect(findMatches(twins, 'Banque').map(match => match.id)).toEqual(['a', 'b'])
  })

  it('skips signs with an empty name', () => {
    const sparse = buildSignIndex([
      { id: 'a', name: '   ' },
      { id: 'b', name: 'Chat' },
    ])
    expect(findMatches(sparse, 'Chat').map(match => match.id)).toEqual(['b'])
  })
})
