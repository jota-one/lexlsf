import { ref, computed } from 'vue'
import PocketBase from 'pocketbase'
import config from '../../config'
import type { ItemType } from '@admin/types/quiz'

type SearchItem = {
  id: string
  type: 'sign' | 'person'
  name: string
  label: string
  details?: string
  expand?: any
}

export type QuizItemSearchQuery = {
  search: string
  level?: string
  deafFilter?: 'deaf' | 'hearing' | 'both'
  itemType: ItemType
}

export default function useQuizItemSearch() {
  const pb = new PocketBase(config.apiBaseUrl)

  const results = ref<SearchItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Build filter string for signs collection
   */
  const buildSignFilter = (search: string, level?: string): string => {
    const filters: string[] = []

    if (search.trim()) {
      // Search in name, definition, or Category.tag
      filters.push(
        `(name ~ "${search.trim()}" || definition ~ "${search.trim()}" || Category.tag ~ "${search.trim()}")`
      )
    }

    if (level) {
      filters.push(`level = "${level}"`)
    }

    return filters.join(' && ')
  }

  /**
   * Build filter string for persons collection
   */
  const buildPersonFilter = (search: string, deafFilter?: 'deaf' | 'hearing' | 'both'): string => {
    const filters: string[] = []

    if (search.trim()) {
      // Search in name, firstname, description, Activities.tag, or Category.tag
      filters.push(
        `(name ~ "${search.trim()}" || firstname ~ "${search.trim()}" || description ~ "${search.trim()}" || Activities.tag ~ "${search.trim()}" || Category.tag ~ "${search.trim()}")`
      )
    }

    if (deafFilter === 'deaf') {
      filters.push('deaf = true')
    } else if (deafFilter === 'hearing') {
      filters.push('deaf = false')
    }
    // 'both' means no filter on the deaf field

    return filters.join(' && ')
  }

  /**
   * Format search result based on type
   */
  const formatResult = (record: any, type: 'sign' | 'person'): SearchItem => {
    if (type === 'sign') {
      return {
        id: record.id,
        type: 'sign',
        name: record.name,
        label: record.name,
        details: record.definition,
        expand: record.expand,
      }
    } else {
      return {
        id: record.id,
        type: 'person',
        name: record.name,
        label: record.firstname ? `${record.firstname} ${record.name}` : record.name,
        details: record.description,
        expand: record.expand,
      }
    }
  }

  /**
   * Search for quiz items (signs and/or persons based on itemType)
   */
  const search = async (query: QuizItemSearchQuery) => {
    loading.value = true
    error.value = null
    results.value = []

    try {
      const allResults: SearchItem[] = []

      // Search signs if applicable
      if (query.itemType === 'sign' || query.itemType === 'mixed') {
        const filter = buildSignFilter(query.search, query.level)
        const signResults = await pb
          .collection('sign')
          .getFullList({
            filter: filter || undefined,
            expand: 'Category',
            limit: 50,
          })

        allResults.push(...signResults.map((r) => formatResult(r, 'sign')))
      }

      // Search persons if applicable
      if (query.itemType === 'person' || query.itemType === 'mixed') {
        const filter = buildPersonFilter(query.search, query.deafFilter)
        const personResults = await pb
          .collection('person')
          .getFullList({
            filter: filter || undefined,
            expand: 'Category,Activities',
            limit: 50,
          })

        allResults.push(...personResults.map((r) => formatResult(r, 'person')))
      }

      results.value = allResults
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
    error.value = null
  }

  return {
    results: computed(() => results.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    search,
    clear,
  }
}
