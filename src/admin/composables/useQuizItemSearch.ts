import { ref, computed } from 'vue'
import type { PersonResponse, SignResponse } from '@types'
import { pb } from '@lib/pb'
import type { ItemType } from '@admin/types/quiz'

type SearchItem = {
  id: string
  type: 'sign' | 'person'
  name: string
  label: string
  details?: string
  expand?: Record<string, unknown>
}

export type QuizItemSearchQuery = {
  search: string
  level?: string
  deafFilter?: 'deaf' | 'hearing' | 'both'
  itemType: ItemType
  addedSince?: string
}

/** Results fetched per collection; a broader search asks to be narrowed down. */
export const SEARCH_LIMIT = 100

export default function useQuizItemSearch() {
  const results = ref<SearchItem[]>([])
  /** How many items match, which can be more than the results shown. */
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Build filter string for signs collection
   */
  const buildSignFilter = (search: string, level?: string, addedSince?: string): string => {
    const filters: string[] = []

    const q = search.trim()
    if (q) {
      // Search in name, definition, or Category.tag
      filters.push(pb.filter('(name ~ {:q} || definition ~ {:q} || Category.tag ~ {:q})', { q }))
    }

    if (level) {
      filters.push(pb.filter('level = {:level}', { level }))
    }

    if (addedSince) {
      // A Date is formatted the way PocketBase stores datetimes.
      filters.push(pb.filter('created >= {:since}', { since: new Date(addedSince) }))
    }

    return filters.join(' && ')
  }

  /**
   * Build filter string for persons collection
   */
  const buildPersonFilter = (
    search: string,
    deafFilter?: 'deaf' | 'hearing' | 'both',
    addedSince?: string,
  ): string => {
    const filters: string[] = []

    const q = search.trim()
    if (q) {
      // Search in name, firstname, description, Activities.tag, or Category.tag
      filters.push(
        pb.filter(
          '(name ~ {:q} || firstname ~ {:q} || description ~ {:q} || Activities.tag ~ {:q} || Category.tag ~ {:q})',
          { q },
        ),
      )
    }

    if (deafFilter === 'deaf') {
      filters.push('deaf = true')
    } else if (deafFilter === 'hearing') {
      filters.push('deaf = false')
    }
    // 'both' means no filter on the deaf field

    if (addedSince) {
      filters.push(pb.filter('created >= {:since}', { since: new Date(addedSince) }))
    }

    return filters.join(' && ')
  }

  /**
   * Format search result based on type
   */
  const formatSign = (record: SignResponse): SearchItem => ({
    id: record.id,
    type: 'sign',
    name: record.name,
    label: record.name,
    details: record.definition,
    expand: record.expand as SearchItem['expand'],
  })

  const formatPerson = (record: PersonResponse): SearchItem => ({
    id: record.id,
    type: 'person',
    name: record.name,
    label: record.firstname ? `${record.firstname} ${record.name}` : record.name,
    details: record.description,
    expand: record.expand as SearchItem['expand'],
  })

  /**
   * Search for quiz items (signs and/or persons based on itemType)
   */
  const search = async (query: QuizItemSearchQuery) => {
    loading.value = true
    error.value = null
    results.value = []
    total.value = 0

    try {
      const allResults: SearchItem[] = []
      let matching = 0

      // Search signs if applicable
      if (query.itemType === 'sign' || query.itemType === 'mixed') {
        const filter = buildSignFilter(query.search, query.level, query.addedSince)
        const signResults = await pb.collection('sign').getList(1, SEARCH_LIMIT, {
          filter: filter || undefined,
          expand: 'Category',
          sort: 'name',
        })

        allResults.push(...signResults.items.map(formatSign))
        matching += signResults.totalItems
      }

      // Search persons if applicable
      if (query.itemType === 'person' || query.itemType === 'mixed') {
        const filter = buildPersonFilter(query.search, query.deafFilter, query.addedSince)
        const personResults = await pb.collection('person').getList(1, SEARCH_LIMIT, {
          filter: filter || undefined,
          expand: 'Category,Activities',
          sort: 'name',
        })

        allResults.push(...personResults.items.map(formatPerson))
        matching += personResults.totalItems
      }

      results.value = allResults
      total.value = matching
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la recherche'
      results.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear search results
   */
  const clear = () => {
    results.value = []
    total.value = 0
    error.value = null
  }

  return {
    results: computed(() => results.value),
    total: computed(() => total.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    search,
    clear,
  }
}
