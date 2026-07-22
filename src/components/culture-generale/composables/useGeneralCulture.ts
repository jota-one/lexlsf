import useAuth from '@admin/composables/useAuth'
import type { TGeneralCulture } from '../../../types'

const COLLECTION = 'general_culture'

export default function useGeneralCulture() {
  const { pb } = useAuth()

  const loadItems = async () => {
    return pb.collection<TGeneralCulture.TRecord>(COLLECTION).getFullList({
      expand: 'LexicalFields,Signs,Persons',
      sort: 'start_date',
    })
  }

  const loadItem = async (slug: string) => {
    return pb
      .collection<TGeneralCulture.TRecord>(COLLECTION)
      .getFirstListItem(pb.filter('slug = {:slug}', { slug }), { expand: 'LexicalFields,Signs,Persons' })
  }

  const getImageUrl = (record: TGeneralCulture.TRecord, filename: string, thumb?: string) => {
    return pb.files.getURL(record, filename, thumb ? { thumb } : {})
  }

  return { loadItems, loadItem, getImageUrl }
}
