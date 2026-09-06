import { ref } from 'vue'
import { pb } from '@lib/pb'
import { buildSignIndex, type TSign, type TSignIndex } from '../helpers/signMatcher'

/**
 * The whole sign catalogue, names only, indexed for fuzzy matching.
 *
 * Loaded at most once per page session and shared by every caller: matching a
 * field's terms would otherwise mean one request per term, and PocketBase has
 * no fuzzy operator to answer them with anyway.
 */
let cache: Promise<TSignIndex> | null = null

const fetchIndex = async () => {
  const signs = await pb.collection('sign').getFullList<TSign>({ fields: 'id,name', batch: 500 })
  return buildSignIndex(signs)
}

export default function useSignCatalogue() {
  const loading = ref(false)

  const loadIndex = async () => {
    loading.value = true
    try {
      if (!cache) {
        cache = fetchIndex()
      }
      return await cache
    } catch (error) {
      // Keep a failed load from poisoning every later attempt.
      cache = null
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    loadIndex,
  }
}
