import { ref } from 'vue'
import { pb } from '@lib/pb'
import type { TSign } from '../../types'
import { createSlug } from '@lib/slug'
import {
  translateNumericLevel,
  getNumericLevel,
  learningSourceOptions,
  primaryLanguageOptions,
  verificationStatusOptions,
} from '@lib/signOptions'

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
  ;(payload.Roles || []).forEach(roleId => {
    formData.append('Roles', roleId)
  })
  formData.append('placement', JSON.stringify(payload.placement))

  return formData
}

export default function useSigns() {

  const signs = ref<TSign.TRecord[]>([])
  const totalSigns = ref(0)
  const loadSigns = async (query?: string, sort = '-updated') => {
    const options = {
      fields:
        'id, name, video, slug, definition, level, primary_language, learning_source, learning_source_detail, Roles, updated, expand.ConfigurationRight.*, expand.ConfigurationLeft.*, expand.Category.*, expand.Roles.*',
      expand: 'Category,ConfigurationRight,ConfigurationLeft,Roles',
      sort,
    }
    if (query?.trim()) {
      const q = query.trim()
      const result = await pb.collection<TSign.TRecord>('sign').getList(1, 200, {
        ...options,
        filter: pb.filter('name ~ {:q} || Category.tag ~ {:q}', { q }),
      })
      signs.value = result.items
      totalSigns.value = result.totalItems
    } else {
      const result = await pb.collection<TSign.TRecord>('sign').getList(1, 100, options)
      signs.value = result.items
      totalSigns.value = result.totalItems
    }
  }

  const loadSign = async (id: string) => {
    return pb.collection<TSign.TRecord>('sign').getOne(id, {
      fields:
        '*, expand.ConfigurationRight.*, expand.ConfigurationLeft.*, expand.Category.*, expand.Roles.*',
      expand: 'Category,ConfigurationRight,ConfigurationLeft,Roles',
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
    totalSigns,
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
