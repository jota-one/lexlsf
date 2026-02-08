import { ref } from 'vue'
import config from '../../config'
import PocketBase from 'pocketbase'
import type { TSign } from '../../types'
import { createSlug } from '@admin/helpers/strings'

const translateNumericLevel = (level: number) => {
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1']
  return levels[level - 1] || ''
}

const getNumericLevel = (level: string) => {
  return ['a1', 'a2', 'b1', 'b2', 'c1'].indexOf(level) + 1
}

const learningSourceOptions = [
  { label: 'Dictionnaire', value: 'dictionary' },
  { label: 'Enseignant', value: 'teacher' },
  { label: 'Communauté', value: 'community' },
  { label: 'Média', value: 'media' },
  { label: 'Université / M1', value: 'uni/m1' },
  { label: 'Autre', value: 'other' },
]
const primaryLanguageOptions = [
  { label: 'LSF', value: 'LSF' },
  { label: 'LSR', value: 'LSR' },
  { label: 'ASL', value: 'ASL' },
  { label: 'LS Internationale', value: 'LS Internationale' },
  { label: 'BSL', value: 'BSL' },
  { label: 'ISL', value: 'ISL' },
  { label: 'Autre', value: 'other' },
]

const verificationStatusOptions = [
  { label: 'À vérifier', value: 'unverified' },
  { label: 'Officiel', value: 'verified' },
  { label: 'Contesté', value: 'disputed' },
]

const setFormData = (payload: TSign.TForm) => {
  const formData = new FormData()
  // set regular text field
  if (payload.video && payload.video instanceof File) {
    formData.append('video', payload.video)
  }
  formData.append('name', payload.name)
  formData.append('definition', payload.definition)
  // Use provided slug if available, otherwise generate from name
  const slug = payload.slug || createSlug(payload.name)
  formData.append('slug', slug)
  formData.append('level', translateNumericLevel(payload.level))
  ;(payload.Category || []).forEach(cat => {
    formData.append('Category', cat)
  })
  formData.append('verification_status', payload.verification_status)
  if (payload.ConfigurationRight?.id) {
    formData.append('ConfigurationRight', payload.ConfigurationRight.id)
  }
  if (payload.ConfigurationLeft?.id) {
    formData.append('ConfigurationLeft', payload.ConfigurationLeft.id)
  }
  formData.append('learning_source', payload.learning_source)
  formData.append('learning_source_detail', payload.learning_source_detail)
  formData.append('primary_language', payload.primary_language)
  formData.append('placement', JSON.stringify(payload.placement))

  return formData
}

export default function useSigns() {
  const pb = new PocketBase(config.apiBaseUrl)

  const signs = ref<TSign.TRecord[]>([])
  const loadSigns = async () => {
    signs.value = await pb.collection<TSign.TRecord>('sign').getFullList({
      fields:
        'id, name, video, slug, definition, level, updated, expand.ConfigurationRight.*, expand.ConfigurationLeft.*, expand.Category.*',
      expand: 'Category,ConfigurationRight,ConfigurationLeft',
      sort: '-updated',
    })
  }

  const loadSign = async (id: string) => {
    return pb.collection<TSign.TRecord>('sign').getOne(id, {
      fields: '*, expand.ConfigurationRight.*, expand.ConfigurationLeft.*, expand.Category.*',
      expand: 'Category,ConfigurationRight,ConfigurationLeft',
    })
  }

  const addSign = async (payload: any) => {
    const formData = setFormData(payload)

    // upload and create new record
    return pb.collection('sign').create(formData)
  }

  const updateSign = async (id: string, payload: any) => {
    const formData = setFormData(payload)

    // upload and update record
    return pb.collection('sign').update(id, formData)
  }

  const deleteSign = async (id: string) => {
    return pb.collection('sign').delete(id)
  }

  return {
    signs,
    loadSigns,
    loadSign,
    addSign,
    getNumericLevel,
    learningSourceOptions,
    primaryLanguageOptions,
    verificationStatusOptions,
    deleteSign,
    updateSign,
  }
}
