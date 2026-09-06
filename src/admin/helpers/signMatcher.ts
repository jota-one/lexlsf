/**
 * Fuzzy matching between a lexical term and the sign catalogue.
 *
 * Terms imported from a CSV carry no sign, and PocketBase can only do a
 * substring `LIKE`, which is accent-sensitive and unranked. So the whole
 * catalogue (id + name only) is indexed client-side once, and every term is
 * matched against that index.
 *
 * A term is never compared to the whole catalogue: an inverted trigram index
 * narrows it down to a short list first, and only that short list goes through
 * the edit distance. The cost per term stays flat as the catalogue grows.
 */

export type TSign = { id: string; name: string }
export type TSignMatch = { id: string; name: string; score: number }

/** Below this, a candidate is noise and is not proposed at all. */
export const MIN_SCORE = 0.5

/** Candidates pulled from the trigram index before the edit distance runs. */
const SHORTLIST_SIZE = 20

/**
 * Under this length, only an exact match is trustworthy: acronyms and very
 * short words sit a couple of edits away from half the catalogue.
 */
const MIN_FUZZY_LENGTH = 4

/** Accent- and punctuation-insensitive form used for every comparison. */
export const normalize = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const trigrams = (value: string) => {
  const padded = `  ${value} `
  const grams = new Set<string>()
  for (let i = 0; i < padded.length - 2; i++) {
    grams.add(padded.slice(i, i + 3))
  }
  return grams
}

type TEntry = { id: string; name: string; normalized: string; gramCount: number }

export type TSignIndex = {
  entries: TEntry[]
  exact: Map<string, number[]>
  byGram: Map<string, number[]>
}

export const buildSignIndex = (signs: TSign[]): TSignIndex => {
  const entries: TEntry[] = []
  const exact = new Map<string, number[]>()
  const byGram = new Map<string, number[]>()

  for (const sign of signs) {
    const normalized = normalize(sign.name)
    if (!normalized) {
      continue
    }
    const grams = trigrams(normalized)
    const position = entries.length
    entries.push({ id: sign.id, name: sign.name, normalized, gramCount: grams.size })

    const sameName = exact.get(normalized)
    if (sameName) {
      sameName.push(position)
    } else {
      exact.set(normalized, [position])
    }

    for (const gram of grams) {
      const bucket = byGram.get(gram)
      if (bucket) {
        bucket.push(position)
      } else {
        byGram.set(gram, [position])
      }
    }
  }

  return { entries, exact, byGram }
}

/**
 * How many edits still count as "the same word", given its length. Terms are
 * curated words, not typed input, so two real French words a couple of edits
 * apart are usually unrelated ("Maire" / "Maître", "Jugement" / "Logement").
 * Only a single edit on a long enough word is worth proposing.
 */
const maxEdits = (length: number) => (length < 6 ? 0 : 1)

/** Levenshtein distance, abandoned as soon as it cannot stay within `max`. */
const boundedDistance = (a: string, b: string, max: number) => {
  if (Math.abs(a.length - b.length) > max) {
    return max + 1
  }
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost)
      current[j] = value
      if (value < best) {
        best = value
      }
    }
    if (best > max) {
      return max + 1
    }
    previous = current
  }
  return previous[b.length]
}

/** Whether `short` appears in `long` as a whole word (or run of words). */
const containsWords = (long: string, short: string) => ` ${long} `.includes(` ${short} `)

/**
 * Scores are a ladder of decreasing confidence: same string, one contains the
 * other as a whole word, then a couple of typos apart. Anything else scores 0
 * and is dropped — trigram similarity alone is only good enough to shortlist,
 * never to propose ("Idéologie" and "Biologie" share plenty of trigrams).
 */
const scoreOf = (query: string, candidate: string) => {
  if (query === candidate) {
    return 1
  }

  if (query.length < MIN_FUZZY_LENGTH || candidate.length < MIN_FUZZY_LENGTH) {
    return 0
  }

  const [short, long] = query.length <= candidate.length ? [query, candidate] : [candidate, query]
  if (containsWords(long, short)) {
    return 0.6 + 0.3 * (short.length / long.length)
  }

  const max = maxEdits(query.length)
  if (max === 0) {
    return 0
  }
  const distance = boundedDistance(query, candidate, max)
  if (distance <= max) {
    return 1 - distance / (query.length + 1)
  }

  return 0
}

/**
 * Best signs for a term name, most confident first. Returns nothing rather than
 * a weak guess when no candidate reaches `MIN_SCORE`.
 */
export const findMatches = (index: TSignIndex, term: string, limit = 5): TSignMatch[] => {
  const query = normalize(term)
  if (!query) {
    return []
  }

  const exactHits = index.exact.get(query)
  if (exactHits) {
    return exactHits.slice(0, limit).map(position => ({ ...pickSign(index, position), score: 1 }))
  }

  const grams = trigrams(query)
  const common = new Map<number, number>()
  for (const gram of grams) {
    const bucket = index.byGram.get(gram)
    if (!bucket) {
      continue
    }
    for (const position of bucket) {
      common.set(position, (common.get(position) || 0) + 1)
    }
  }

  const shortlist = [...common.entries()]
    .map(([position, shared]): [number, number] => [
      position,
      (2 * shared) / (grams.size + index.entries[position].gramCount),
    ])
    .sort((a, b) => b[1] - a[1])
    .slice(0, SHORTLIST_SIZE)

  return shortlist
    .map(([position]) => ({
      ...pickSign(index, position),
      score: scoreOf(query, index.entries[position].normalized),
    }))
    .filter(match => match.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit)
}

const pickSign = (index: TSignIndex, position: number) => ({
  id: index.entries[position].id,
  name: index.entries[position].name,
})
