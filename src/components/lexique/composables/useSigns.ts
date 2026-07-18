import { ref } from 'vue'
import useAuth from '@admin/composables/useAuth'
import type { TSign } from '../../../types'
import {
  translateNumericLevel,
  getNumericLevel,
  learningSourceOptions,
  primaryLanguageOptions,
  verificationStatusOptions,
} from '@lib/signOptions'

export default function useSigns() {
  const { pb } = useAuth()

  const signs = ref<TSign.TRecord[]>([])
  const loadSigns = async (category: string) => {
    signs.value = await pb.collection<TSign.TRecord>('sign').getFullList({
      fields:
        'id, name, video, slug, definition, level, updated, expand.ConfigurationRight.*, expand.ConfigurationLeft.*, expand.Category.*',
      expand: 'Category,ConfigurationRight,ConfigurationLeft',
      filter: pb.filter('Category.slug ?= {:category}', { category }),
      sort: '-updated',
    })
  }

  const loadSign = async (id: string) => {
    return pb.collection<TSign.TRecord>('sign').getOne(id, {
      fields: '*, expand.ConfigurationRight.*, expand.ConfigurationLeft.*, expand.Category.*',
      expand: 'Category,ConfigurationRight,ConfigurationLeft',
    })
  }

  return {
    signs,
    loadSigns,
    loadSign,
    translateNumericLevel,
    getNumericLevel,
    learningSourceOptions,
    primaryLanguageOptions,
    verificationStatusOptions,
  }
}
