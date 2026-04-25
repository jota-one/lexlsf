import useAuth from '@admin/composables/useAuth'
import type { TGeneralCulture } from '../../../types'

const COLLECTION = 'general_culture'

export function formatDate(raw: string): string {
  if (!raw) return ''
  const parts = raw.split('-')
  const months = [
    'jan.',
    'fév.',
    'mar.',
    'avr.',
    'mai',
    'jun.',
    'jul.',
    'aoû.',
    'sep.',
    'oct.',
    'nov.',
    'déc.',
  ]
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${months[parseInt(parts[1]) - 1]} ${parts[0]}`
  return `${parseInt(parts[2])} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`
}

export function formatDateRange(start: string, end: string): string {
  if (!end) return formatDate(start)
  return `${formatDate(start)} → ${formatDate(end)}`
}

export function isPeriod(item: TGeneralCulture.TRecord): boolean {
  return !!item.end_date
}

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
      .getFirstListItem(`slug = "${slug}"`, { expand: 'LexicalFields,Signs,Persons' })
  }

  const getImageUrl = (record: TGeneralCulture.TRecord, filename: string, thumb?: string) => {
    return pb.files.getURL(record, filename, thumb ? { thumb } : {})
  }

  return { loadItems, loadItem, getImageUrl }
}
