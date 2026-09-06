import { ref } from 'vue'
import { pb } from '@lib/pb'
import type { TCategory } from '../../types'

/**
 * Term "Types" are categories tagged with the `lexical_term` entity, used as a
 * flat list (no parent/child hierarchy) — this matches how the CSV import
 * resolves a term's Type by tag.
 */
export default function useTermTypes() {
  const termTypes = ref<TCategory.TRecord[]>([])

  const loadTermTypes = async () => {
    termTypes.value = await pb.collection<TCategory.TRecord>('category').getFullList({
      fields: 'id,tag,slug,entities',
      sort: 'tag',
      filter: pb.filter('entities ~ {:entity}', { entity: 'lexical_term' }),
    })
    return termTypes.value
  }

  return {
    termTypes,
    loadTermTypes,
  }
}
