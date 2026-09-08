/**
 * The collections the global search can look into.
 *
 * They are coarser than the underlying queries on purpose: `person` yields both
 * "Personne" and "Organisme" results, and "Champs lexicaux" covers the fields
 * and their terms. Each entry carries the badge class its results already use,
 * so a filter reads the same as the results it lets through.
 */
export const SEARCH_COLLECTIONS = [
  { key: 'sign', label: 'Signes', badge: 'badge-primary' },
  { key: 'culture', label: 'Culture', badge: 'badge-accent' },
  { key: 'lexical', label: 'Champs lexicaux', badge: 'badge-warning' },
  { key: 'french_expression', label: 'Expr. françaises', badge: 'badge-success' },
  { key: 'pi_deaf_expression', label: 'Expr. pi-sourdes', badge: 'badge-secondary' },
] as const

export type TSearchCollection = (typeof SEARCH_COLLECTIONS)[number]['key']

const ALL = SEARCH_COLLECTIONS.map(collection => collection.key)

const STORAGE_KEY = 'search-collections'

/**
 * Reads the stored selection, falling back to every collection: an absent,
 * corrupted or empty value must never leave the search unable to find anything.
 * Storage can also throw outright (private browsing), hence the try/catch.
 */
export const readStoredCollections = (): TSearchCollection[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    const kept = Array.isArray(parsed)
      ? (parsed.filter(key => ALL.includes(key as TSearchCollection)) as TSearchCollection[])
      : []
    return kept.length > 0 ? kept : [...ALL]
  } catch {
    return [...ALL]
  }
}

export const writeStoredCollections = (keys: TSearchCollection[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  } catch {
    // Nothing to do: the selection simply will not survive the session.
  }
}

export const allCollections = (): TSearchCollection[] => [...ALL]
