import { ref } from 'vue'
import config from '../../config'
import PocketBase from 'pocketbase'
import type { TPerson } from '../../types'
import { createSlug } from '@admin/helpers/strings'

const setFormData = (payload: TPerson.TForm) => {
  const formData = new FormData()
  // set regular text field
  if (payload.illustration && payload.illustration instanceof File) {
    formData.append('illustration', payload.illustration)
  }
  formData.append('name', payload.name.trim())
  if (payload.firstname) {
    formData.append('firstname', payload.firstname.trim())
  }
  // Use provided slug if available, otherwise generate from name + firstname
  const slug = payload.slug || createSlug(payload.name, payload.firstname)
  formData.append('slug', slug)
  if (payload.description) {
    formData.append('description', payload.description)
  }
  if (payload.Sign) {
    formData.append('Sign', payload.Sign)
  }
  // new simple fields
  if (typeof payload.deaf !== 'undefined') {
    formData.append('deaf', String(Boolean(payload.deaf)))
  }
  if (typeof payload.organism !== 'undefined') {
    formData.append('organism', String(Boolean(payload.organism)))
  }
  if (payload.birthdate) {
    formData.append('birthdate', payload.birthdate)
  }
  if (payload.birthplace) {
    formData.append('birthplace', payload.birthplace)
  }
  if (typeof payload.deafFamily !== 'undefined') {
    formData.append('deafFamily', String(Boolean(payload.deafFamily)))
  }
  if (payload.family) {
    formData.append('family', payload.family)
  }
  if (typeof payload.deceased !== 'undefined') {
    formData.append('deceased', String(Boolean(payload.deceased)))
  }
  if (payload.deathdate) {
    formData.append('deathdate', payload.deathdate)
  }
  ;(payload.Category || []).forEach(cat => {
    formData.append('Category', cat)
  })
  ;(payload.Activities || []).forEach(act => {
    formData.append('Activities', act)
  })
  ;(payload.Videos || []).forEach(video => {
    formData.append('Videos', video)
  })
  if (payload.timeline) {
    formData.append('timeline', JSON.stringify(payload.timeline))
  }

  return formData
}

export default function usePersons() {
  const pb = new PocketBase(config.apiBaseUrl)

  const persons = ref<TPerson.TRecord[]>([])
  const loadPersons = async () => {
    persons.value = await pb.collection<TPerson.TRecord>('person').getFullList({
      fields:
        'id, name, firstname, illustration, slug, updated, deaf, organism, birthdate, birthplace, deafFamily, family, deceased, deathdate, expand.Category.*, expand.Sign.*, expand.Videos.*',
      expand: 'Category,Sign,Videos',
      sort: '-updated',
    })
  }

  const loadPerson = async (id: string) => {
    return pb.collection<TPerson.TRecord & { expand?: any }>('person').getOne(id, {
      fields: '*',
      expand: 'Category,Activities,Sign,Videos',
    })
  }

  const addPerson = async (payload: TPerson.TForm) => {
    const formData = setFormData(payload)

    // upload and create new record
    return pb.collection('person').create(formData)
  }

  const updatePerson = async (id: string, payload: TPerson.TForm) => {
    const formData = setFormData(payload)

    // upload and update record
    return pb.collection('person').update(id, formData)
  }

  const deletePerson = async (id: string) => {
    return pb.collection('person').delete(id)
  }

  const getIllustrationUrl = (person: TPerson.TRecord): string => {
    if (!person.illustration) return ''
    return `${config.apiBaseUrl}/api/files/person/${person.id}/${person.illustration}`
  }

  return {
    persons,
    loadPersons,
    loadPerson,
    addPerson,
    deletePerson,
    updatePerson,
    getIllustrationUrl,
  }
}
