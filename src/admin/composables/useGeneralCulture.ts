import { ref } from 'vue'
import useAuth from './useAuth'
import type { TGeneralCulture } from '../../types'
import { createSlug } from '@admin/helpers/strings'

const COLLECTION = 'general_culture'

export const emptyForm = (): TGeneralCulture.TForm => ({
  name: '',
  slug: '',
  description: '',
  start_date: '',
  end_date: '',
  LexicalFields: [],
  Signs: [],
  Persons: [],
  Roles: [],
  newImages: [],
  removedImages: [],
})

const appendRelation = (formData: FormData, key: string, ids: string[] | undefined) => {
  const list = ids || []
  list.forEach(id => formData.append(key, id))
  if (list.length === 0) { formData.append(key, '') }
}

const buildFormData = (payload: TGeneralCulture.TForm, isUpdate: boolean) => {
  const formData = new FormData()
  formData.append('name', payload.name.trim())
  formData.append('slug', payload.slug || createSlug(payload.name))
  formData.append('description', payload.description || '')
  formData.append('start_date', payload.start_date || '')
  formData.append('end_date', payload.end_date || '')

  appendRelation(formData, 'LexicalFields', payload.LexicalFields)
  appendRelation(formData, 'Signs', payload.Signs)
  appendRelation(formData, 'Persons', payload.Persons)
  appendRelation(formData, 'Roles', payload.Roles)

  if (isUpdate) {
    ;(payload.removedImages || []).forEach(f => formData.append('images-', f))
    ;(payload.newImages || []).forEach(f => formData.append('images+', f))
  } else {
    ;(payload.newImages || []).forEach(f => formData.append('images', f))
  }

  return formData
}

export default function useGeneralCulture() {
  const { pb } = useAuth()
  const items = ref<TGeneralCulture.TRecord[]>([])

  const loadItems = async () => {
    items.value = await pb.collection<TGeneralCulture.TRecord>(COLLECTION).getFullList({
      expand: 'Roles',
      sort: 'start_date',
    })
  }

  const loadItem = async (id: string) => {
    return pb.collection<TGeneralCulture.TRecord>(COLLECTION).getOne(id, {
      expand: 'Roles,LexicalFields,Signs,Persons',
    })
  }

  const addItem = async (payload: TGeneralCulture.TForm) => {
    return pb.collection(COLLECTION).create(buildFormData(payload, false))
  }

  const updateItem = async (id: string, payload: TGeneralCulture.TForm) => {
    return pb.collection(COLLECTION).update(id, buildFormData(payload, true))
  }

  const deleteItem = async (id: string) => {
    return pb.collection(COLLECTION).delete(id)
  }

  const getImageUrl = (record: TGeneralCulture.TRecord, filename: string, thumb?: string) => {
    return pb.files.getURL(record, filename, thumb ? { thumb } : {})
  }

  return { items, loadItems, loadItem, addItem, updateItem, deleteItem, getImageUrl }
}
